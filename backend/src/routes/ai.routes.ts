import { Context } from 'hono';
import type { Ctx } from '../app';

// ============================================================
// AI CHAT — requires auth + rate limited
// ============================================================
export async function aiChat(c: Ctx) {
  try {
    const body = await c.req.json();
    const { messages, systemPrompt } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return c.json({ success: false, message: 'Mensagens sao obrigatorias' }, 400);
    }

    // Limit messages
    if (messages.length > 20) {
      return c.json({ success: false, message: 'Maximo de 20 mensagens por requisicao' }, 400);
    }

    // Sanitize message content
    const cleanMessages = messages.map((m: any) => ({
      role: m.role || 'user',
      content: String(m.content || '').substring(0, 4000),
    }));

    const aiMessages = [
      {
        role: 'system' as const,
        content: systemPrompt || 'Voce e um assistente util para um site de desenvolvimento web.',
      },
      ...cleanMessages,
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${c.env.AI_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://phstatic.com.br',
        'X-Title': 'PH.static',
      },
      body: JSON.stringify({
        model: c.env.AI_MODEL || 'qwen/qwen3.6-plus:free',
        messages: aiMessages,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      console.error('OpenRouter API error:', response.status);
      return c.json({ success: false, message: 'Erro na IA. Tente novamente.' }, 502);
    }

    const data = (await response.json()) as any;
    const reply = data.choices?.[0]?.message?.content || 'Sem resposta.';

    return c.json({ success: true, data: { message: reply } });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return c.json({ success: false, message: `Erro na comunicacao com IA: ${msg || "Unknown error"}` }, 500);
  }
}

// ============================================================
// AI CHAT STREAM — requires auth
// ============================================================
export async function aiChatStream(c: Ctx) {
  try {
    const body = await c.req.json();
    const { messages, systemPrompt } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return c.json({ success: false, message: 'Mensagens sao obrigatorias' }, 400);
    }

    if (messages.length > 20) {
      return c.json({ success: false, message: 'Maximo de 20 mensagens por requisicao' }, 400);
    }

    const cleanMessages = messages.map((m: any) => ({
      role: m.role || 'user',
      content: String(m.content || '').substring(0, 4000),
    }));

    // Proxy streaming from OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${c.env.AI_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://phstatic.com.br',
        'X-Title': 'PH.static',
      },
      body: JSON.stringify({
        model: c.env.AI_MODEL || 'qwen/qwen3.6-plus:free',
        messages: [
          {
            role: 'system',
            content: systemPrompt || 'Voce e um assistente util para um site de desenvolvimento web.',
          },
          ...cleanMessages,
        ],
        max_tokens: 2000,
        stream: true,
      }),
    });

    if (!response.ok) {
      return c.json({ success: false, message: 'Erro na IA' }, 502);
    }

    // Stream back to client
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return c.json({ success: false, message: `Erro na comunicacao com IA (stream): ${msg || "Unknown error"}` }, 500);
  }
}
