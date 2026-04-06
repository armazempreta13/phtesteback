const https = require('https');
const logger = require('../utils/logger');

const SYSTEM_PROMPT = `Voce e PH.bot IA, assistente oficial do PH.static - agencia de sites em React, Tailwind CSS e alta performance. Seja conciso e direto.

**SOBRE**: PH.static por Philippe Boechat | Email: contato@phstatic.com.br | WhatsApp: +55 61 99325-4324 | Brasilia DF

**PACOTES:**
1. Landing Page Express - A partir de R$900 | One-page React+Tailwind, mobile-first, ate 4 secoes, arquivo de edicao de textos, hospedagem gratis Vercel, dominio .com.br. Prazo: 3-7 dias uteis.

2. Site Profissional - A partir de R$1800 | Ate 5 paginas, formulario de contato, mapa, SEO, SSL. Prazo: 10-15 dias uteis.

3. Sob Medida - A combinar | Interfaces customizadas, ajustes em sites React, consultoria front-end. Codigo limpo e documentado.

**EXTRAS**: Dominio ~R$40/ano | Hospedagem premium ~R$200/ano

**PAGAMENTO**: 50% entrada, 50% entrega. PIX, cartao, transferencia. Contrato e nota fiscal.

**SUPORTE**: 30 dias gratis (bugs e ajustes). Manutencao opcional a partir de R$99/mes.

**DIFERENCIAIS**: Mobile-first, sites <1s carregando, SEO, sem WordPress, Engenharia Aumentada com IA.

**REGRAS**: Responda em portugues brasileiro. Seja conciso. Sempre sugira proximo passo. WhatsApp: +55 61 99325-4324. Nao invente precos.`;

function chatWithAIStream(userMessage, history = [], res) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.AI_MODEL || 'openai/gpt-oss-120b:free';

  if (!apiKey) {
    res.status(500).json({ success: false, message: 'API key nao configurada' });
    return null;
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-10),
    { role: 'user', content: userMessage },
  ];

  const payload = JSON.stringify({
    model,
    messages,
    max_tokens: 1500,
    temperature: 0.7,
    stream: true,
  });

  const options = {
    hostname: 'openrouter.ai',
    path: '/api/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://phstatic.com.br',
      'X-Title': 'PH.static Chatbot',
    },
  };

  const req = https.request(options, (streamRes) => {
    if (streamRes.statusCode !== 200) {
      let errorData = '';
      streamRes.on('data', chunk => { errorData += chunk; });
      streamRes.on('end', () => {
        logger.error('Stream error:', errorData);
        if (!res.headersSent) {
          res.status(400).json({ success: false, message: 'Erro ao conectar com IA' });
        }
      });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let fullContent = '';
    let buffer = '';

    streamRes.on('data', chunk => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;

        if (trimmed.startsWith('data:')) {
          try {
            const json = JSON.parse(trimmed.slice(5).trim());
            const content = json.choices?.[0]?.delta?.content;
            if (content) {
              fullContent += content;
              res.write(content);
            }
          } catch (e) {
            // SSE parse skip
          }
        }
      }
    });

    streamRes.on('end', () => {
      if (!res.headersSent) {
        res.json({ success: true, data: { reply: fullContent } });
      } else {
        res.write('data: [DONE]\n\n');
        res.end(`data: {"full":"${fullContent.replace(/"/g, '\\"')}"}\n\n`);
      }
    });
  });

  req.on('error', (err) => {
    logger.error('Stream request error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Erro de conexao com IA' });
    }
  });

  req.setTimeout(60000, () => {
    req.destroy();
    if (!res.headersSent) {
      res.status(504).json({ success: false, message: 'Timeout da IA' });
    }
  });

  req.write(payload);
  req.end();
}

// Legacy non-streaming endpoint (fallback)
function chatWithAINonStream(userMessage, history = []) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.AI_MODEL || 'openai/gpt-oss-120b:free';

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-10),
      { role: 'user', content: userMessage },
    ];

    const payload = JSON.stringify({
      model,
      messages,
      max_tokens: 1500,
      temperature: 0.7,
    });

    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://phstatic.com.br',
        'X-Title': 'PH.static Chatbot',
      },
    };

    const req = https.request(options, (streamRes) => {
      let data = '';
      streamRes.on('data', (chunk) => { data += chunk; });
      streamRes.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            reject(new Error(parsed.error.message || 'AI API error'));
          } else if (parsed.choices && parsed.choices[0]) {
            resolve(parsed.choices[0].message.content);
          } else {
            reject(new Error('Unexpected AI response'));
          }
        } catch (err) {
          reject(new Error('Failed to parse AI response'));
        }
      });
    });

    req.on('error', (err) => reject(new Error(`Connection error: ${err.message}`)));
    req.setTimeout(60000, () => {
      req.destroy();
      reject(new Error('AI request timeout'));
    });
    req.write(payload);
    req.end();
  });
}

// Streaming endpoint
exports.chatStream = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Campo "message" e obrigatorio',
      });
    }

    chatWithAIStream(message, history || [], res);
  } catch (err) {
    logger.error('AI chat stream error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: err.message || 'Erro ao processar mensagem.',
      });
    }
  }
};

// Legacy non-streaming
exports.chat = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Campo "message" e obrigatorio',
      });
    }

    const reply = await chatWithAINonStream(message, history || []);

    res.json({
      success: true,
      data: { reply },
    });
  } catch (err) {
    logger.error('AI chat error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message || 'Erro ao processar mensagem. Tente novamente.',
    });
  }
};
