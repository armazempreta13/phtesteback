import type { Ctx } from '../app';
import { buildSystemPrompt, KNOWLEDGE_BASE } from '../knowledge';
import { authRateLimiter, sanitizeInput } from '../middleware';

// ============================================================
// CHATBOT ASK — Knowledge-aware AI for the chatbot
// NO auth required — this is the public-facing bot
// Rate limited to prevent abuse
// ============================================================
export async function chatbotAsk(c: Ctx) {
  try {
    const body = await c.req.json();
    let { message, history, mode, context } = body;

    if (!message || typeof message !== 'string') {
      return c.json({ success: false, message: 'Mensagem e obrigatoria' }, 400);
    }

    // Rate limit: 30 requests per minute per IP
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    const rateResult = rateCheck(ip);
    if (!rateResult.allowed) {
      return c.json({ success: false, message: 'Muitas requisicoes. Tente novamente em instantes.' }, 429);
    }

    // Sanitize input
    message = message.substring(0, 3000);

    // Determine mode
    const validMode = ['sales', 'support', 'general'].includes(mode) ? mode : 'general';

    // Build system prompt with full knowledge base
    const systemPrompt = buildSystemPrompt(validMode as 'sales' | 'support' | 'general');

    // Enrich with dynamic context if provided
    let contextBlock = '';
    if (context) {
      if (context.projects && Array.isArray(context.projects)) {
        contextBlock += `\n\nDADOS DINAMICOS — PROJETOS ENCONTRADOS:\n${JSON.stringify(context.projects).substring(0, 2000)}`;
      }
      if (context.posts && Array.isArray(context.posts)) {
        contextBlock += `\n\nDADOS DINAMICOS — POSTS DO BLOG:\n${JSON.stringify(context.posts).substring(0, 2000)}`;
      }
      if (context.portfolio && Array.isArray(context.portfolio)) {
        contextBlock += `\n\nDADOS DINAMICOS — PORTFOLIO:\n${JSON.stringify(context.portfolio).substring(0, 2000)}`;
      }
      if (context.currentPage) {
        contextBlock += `\n\nPagina atual do usuario: ${context.currentPage}`;
      }
    }

    // Build message array
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt + contextBlock },
    ];

    // Add history (last 15 messages to stay within token limits)
    if (history && Array.isArray(history)) {
      const recentHistory = history.slice(-15);
      for (const msg of recentHistory) {
        const role = msg.role === 'user' ? 'user' : 'assistant';
        const content = typeof msg.content === 'string' ? msg.content.substring(0, 2000) : '';
        if (content) messages.push({ role, content });
      }
    }

    // Add current message
    messages.push({ role: 'user', content: message });

    // Call OpenRouter API
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
        messages,
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('OpenRouter API error (chatbot):', response.status);

      // Fallback: intelligent keyword-based responses
      const fallbackReply = keywordFallback(message);
      return c.json({
        success: true,
        data: {
          reply: fallbackReply,
          fallback: true,
        },
      });
    }

    const data = (await response.json()) as any;
    const reply = data.choices?.[0]?.message?.content || 'Nao consegui processar sua mensagem. Pode reformular?';

    return c.json({
      success: true,
      data: {
        reply,
        fallback: false,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('Chatbot ask error:', msg);

    // Fallback on error too
    return c.json({
      success: true,
      data: {
        reply: keywordFallback(c.req.raw.body ? String(c.req.raw.body).substring(0, 100) : ''),
        fallback: true,
      },
    });
  }
}

// ============================================================
// IN-MEMORY RATE LIMITER (per IP, per minute)
// ============================================================
const RATE_MAP = new Map<string, { count: number; resetAt: number }>();

function rateCheck(ip: string): { allowed: boolean } {
  const now = Date.now();
  const windowMs = 60_000;
  const max = 30;

  const record = RATE_MAP.get(ip);
  if (record && now < record.resetAt) {
    if (record.count >= max) return { allowed: false };
    record.count++;
  } else {
    RATE_MAP.set(ip, { count: 1, resetAt: now + windowMs });
  }

  // Cleanup
  if (RATE_MAP.size > 5000) {
    for (const [key, val] of RATE_MAP) {
      if (val.resetAt < now) RATE_MAP.delete(key);
    }
  }

  return { allowed: true };
}

// ============================================================
// KEYWORD-BASED FALLBACK — when AI API is unavailable
// ============================================================
function keywordFallback(message: string): string {
  const lower = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Price
  if (lower.includes('preco') || lower.includes('quanto custa') || lower.includes('valor') || lower.includes('orcamento')) {
    return '**Nossos pacos:**\n\n'
      + '- **Landing Page Express**: a partir de R$ 900\n'
      + '- **Site Profissional**: a partir de R$ 1.800\n'
      + '- **Sob Medida**: a combinar\n\n'
      + 'Quer que eu monte um orcamento personalizado? Me conta mais sobre seu projeto! ';
  }

  // Time
  if (lower.includes('prazo') || lower.includes('tempo') || lower.includes('demora') || lower.includes('entrega')) {
    return '**Prazos de entrega:**\n'
      + '- Landing Page: **3-7 dias uteis**\n'
      + '- Site Profissional: **10-15 dias uteis**\n'
      + '- Urgente: **1-2 semanas** (+25%)\n\n'
      + 'O prazo comeca apos receber todo material (textos, fotos, logo).';
  }

  // Tech
  if (lower.includes('tecnologia') || lower.includes('react') || lower.includes('ferramenta')) {
    return 'Usamos **React + Next.js + TailwindCSS + Vite** — a stack mais moderna e performatica do mercado. Sites ate **10x mais rapidos** que WordPress. ';
  }

  // Payment
  if (lower.includes('pagamento') || lower.includes('pix') || lower.includes('parcela')) {
    return '**Formas de pagamento:**\n'
      + '- **50% entrada** + **50% na entrega**\n'
      + '- PIX, cartao de credito ou transferencia\n'
      + '- Contrato e nota fiscal incluidos';
  }

  // WhatsApp contact
  if (lower.includes('whatsapp') || lower.includes('falar') || lower.includes('contato') || lower.includes('humano')) {
    return 'Claro! Voce pode falar com o PH diretamente pelo **WhatsApp: [+55 61 99325-4324](https://wa.me/5561993254324)**. Ele responde em breve! ';
  }

  // Portfolio
  if (lower.includes('portfolio') || lower.includes('projeto') || lower.includes('exemplo')) {
    return 'Temos varios projetos no nosso **portfolio**! Dá uma olhada na secao de **Portfólio** do site para ver demos interativas. Quer que eu te leve ate la? ';
  }

  // Process
  if (lower.includes('processo') || lower.includes('como funciona') || lower.includes('etapa')) {
    return '**Nosso processo:**\n'
      + '1. Briefing & Conversa\n'
      + '2. Estrutura Visual\n'
      + '3. Codificacao 10x (Engenharia Aumentada)\n'
      + '4. Entrega & Publicacao\n\n'
      + 'Voce acompanha tudo pelo portal do cliente! Quer saber mais?';
  }

  // Blog
  if (lower.includes('blog') || lower.includes('artigo') || lower.includes('conteudo')) {
    return 'Temos um **blog** com conteudos sobre desenvolvimento web, performance e dicas para negocios. Acesse na secao **Blog** do site! ';
  }

  // Default
  return 'Entendi sua mensagem! Para te dar a melhor resposta possivel, posso te ajudar de varias formas:\n\n'
    + '- **Orcamento** — me conta sobre seu projeto\n'
    + '- **Duvidas** — sobre servicos, precos, prazos\n'
    + '- **Portfolio** — ver exemplos de trabalhos\n'
    + '- **Falar com PH** – contato direto\n\n'
    + 'O que prefere?';
}
