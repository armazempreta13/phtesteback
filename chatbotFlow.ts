import { BudgetData, ChatStep, ChatOption } from './types';
import { SERVICE_PACKAGES } from './config';

// ============================================================
// STATE
// ============================================================
export const INITIAL_BUDGET: BudgetData = {
  name: '',
  email: '',
  projectType: '',
  designStatus: '',
  functionalities: [],
  details: '',
  budgetRange: '',
  calculatedEstimation: '',
  contactMethod: '',
  timeline: '',
  referenceLinks: '',
  targetAudience: '',
  hasDomain: '',
  hasHosting: '',
  designFormat: ''
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const calculateEstimate = (data: BudgetData) => {
  let basePrice = 800;
  if (data.projectType) {
    const pkg = SERVICE_PACKAGES.find(p => p.title === data.projectType);
    if (pkg) {
      const priceStr = pkg.price.replace(/[^0-9]/g, '');
      if (priceStr) basePrice = parseInt(priceStr, 10);
    }
  }
  if (data.functionalities && data.functionalities.length > 0) {
    basePrice += data.functionalities.length * 150;
  }
  if (data.designStatus === 'Nao tenho design' || data.designStatus === 'Preciso criar do zero') {
    basePrice += 500;
  } else if (data.designStatus === 'Tenho referencias' || data.designStatus === 'Tenho referências') {
    basePrice += 200;
  }
  if (data.timeline?.toLowerCase().includes('urgente')) {
    basePrice *= 1.25;
  } else if (data.timeline?.toLowerCase().includes('flex')) {
    basePrice *= 0.9;
  }
  return { min: Math.round(basePrice * 0.85), max: Math.round(basePrice * 1.15) };
};

export const generateWhatsAppLink = (data: BudgetData) => {
  const phone = '5561993254324';
  const estimate = calculateEstimate(data);

  let text = `\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n`;
  text += `RESUMO DO BRIEFING\n`;
  text += `\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n\n`;
  text += `CLIENTE: ${data.name}\n`;
  if (data.email) text += `EMAIL: ${data.email}\n`;
  if (data.targetAudience) text += `PUBLICO: ${data.targetAudience}\n`;
  text += `\nPROJETO: ${data.projectType || 'Em definicao'}\n`;
  text += `DESIGN: ${data.designStatus || 'A combinar'}\n`;
  text += `PRAZO: ${data.timeline || 'A combinar'}\n`;
  if (data.budgetRange) text += `ORCAMENTO: ${data.budgetRange}\n`;
  if (data.functionalities?.length) {
    text += `\nRECURSOS:\n`;
    data.functionalities.forEach(f => text += `  + ${f}\n`);
  }
  if (data.details) text += `\nDETALHES: ${data.details}\n`;
  text += `\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n`;
  text += `ESTIMATIVA: ${formatCurrency(estimate.min)} - ${formatCurrency(estimate.max)}\n\n`;
  text += `Podemos conversar sobre a proposta?`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
};

// ============================================================
// VALIDATION RULES — per step
// ============================================================
export function validateInput(stepId: string, value: string): { accepted: boolean; feedback?: string; cleaned?: string } {
  const trimmed = value.trim();
  switch (stepId) {
    case 'start':
    case 'start_context':
      if (trimmed.length < 2) return { accepted: false, feedback: 'Pode me dizer seu nome? Assim fica mais pessoal 😄' };
      if (/^\d+$/.test(trimmed)) return { accepted: false, feedback: 'Seu nome mesmo, sem numeros. Como posso te chamar?' };
      return { accepted: true };

    case 'details':
      if (trimmed.length === 0) return { accepted: true, cleaned: '' }; // allowSkip
      if (trimmed.length < 3) return { accepted: false, feedback: 'Pode escrever um pouco mais? Ou pular se preferir!' };
      return { accepted: true };

    case 'ask_email': {
      if (trimmed.length === 0) return { accepted: true, cleaned: '' }; // allowSkip
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) {
        return { accepted: false, feedback: 'Esse email nao parece valido. Pode conferir? Ex: nome@email.com' };
      }
      return { accepted: true, cleaned: trimmed.toLowerCase() };
    }

    case 'targetAudience':
      if (trimmed.length < 2) return { accepted: false, feedback: 'Descreva brevemente quem é seu cliente. Ex: "Pais jovens"' };
      return { accepted: true };

    default:
      return { accepted: true };
  }
}

// ============================================================
// INTENT DETECTION — keyword/sinonimo/pattern system
// ============================================================
export interface DetectedIntent {
  type: 'navigation' | 'question_price' | 'question_timeline' | 'question_tech' | 'question_process'
      | 'question_payment' | 'hesitation' | 'negation' | 'answer_short'
      | 'correction' | 'off_topic' | 'answer';
  confidence: 'high' | 'medium' | 'low';
}

export function detectIntent(input: string): DetectedIntent {
  const lower = input.toLowerCase().trim();
  const clean = lower.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Questions
  if (/(quanto custa|qual preco|qual valor|valor de|orcamento|preco de|quanto cobram)/.test(clean))
    return { type: 'question_price', confidence: 'high' };

  if (/(quanto tempo|prazo|demora|quando fica|tempo de entrega|fica pronto)/.test(clean))
    return { type: 'question_timeline', confidence: 'high' };

  if (/(usa qual|tecnologia|react|next|framework|stack|linguagem|plataforma)/.test(clean))
    return { type: 'question_tech', confidence: 'high' };

  if (/(como funciona|como e o processo|como voce trabalha|etapas|passo a passo|metodo)/.test(clean))
    return { type: 'question_process', confidence: 'high' };

  if (/(forma de pagamento|pix|parcela|cartao|boleto|como pago)/.test(clean))
    return { type: 'question_payment', confidence: 'high' };

  // Navigation (only when includes trigger words)
  const navTriggers = ['me mostra', 'me mostre', 'quero ver', 'ver o ', 'ir para', 'ir pra', 'abrir'];
  const hasNavTrigger = navTriggers.some(t => lower.includes(t));
  if (hasNavTrigger) {
    if (/portfolio|projetos|trabalhos/.test(clean)) return { type: 'navigation', confidence: 'high' };
    if (/blog|artigo|post/.test(clean)) return { type: 'navigation', confidence: 'high' };
    if (/servico|pacote|plano|preco/.test(clean)) return { type: 'navigation', confidence: 'high' };
    if (/contato|fale|whatsapp|zap|telefone/.test(clean)) return { type: 'navigation', confidence: 'high' };
    if (/sobre|quem e/.test(clean)) return { type: 'navigation', confidence: 'high' };
  }

  // Hesitation
  if (/^(nao sei|nao tenho certeza|talvez|depende|hm|hmm|deixa eu ver|deixa eu pensar|nao faco ideia|to perdido)/.test(clean))
    return { type: 'hesitation', confidence: 'high' };

  // Negation
  if (/^(nao$|nenhum|nada|nao quero|nao preciso|nao tenho)/.test(clean))
    return { type: 'negation', confidence: 'high' };

  // Short answers (confirmation)
  if (/^(sim$|pode$|ok$|blz|blz$|claro$|uhum$|ss$|isso$|exato$|combinado$)/.test(clean))
    return { type: 'answer_short', confidence: 'high' };

  // Correction
  if (/na verdade|mudei de ideia|esquece|vol|volta|troca|muda/m.test(clean))
    return { type: 'correction', confidence: 'high' };

  // Off topic
  if (/(voce e robo|quem e voce|de onde voce|intelegencia artificial|e i a$|chatbot|bot$)/.test(clean))
    return { type: 'off_topic', confidence: 'high' };

  // If just "?" — low confidence question
  if (input.trim() === '?') return { type: 'hesitation', confidence: 'medium' };

  // Default — treat as an answer
  return { type: 'answer', confidence: 'low' };
}

// Quick answers for common questions (used mid-flow)
export const QUICK_ANSWERS: Record<string, string> = {
  question_price: 'Sobre valores:\n• Landing Page: a partir de R$ 900\n• Site Profissional: a partir de R$ 1.800\n• Sob Medida: combinamos\n\nTodos com design responsivo e suporte incluso. Quer continuar o orcamento?',
  question_timeline: 'Prazos:\n• Landing Page: 3-7 dias uteis\n• Site Profissional: 10-15 dias uteis\n• Urgente: metade do prazo (+25%)\n\nO prazo comeca depois que recebo todo material. Seguimos?',
  question_tech: 'Tecnologia:\nReact + Next.js + Tailwind CSS + Vite.\nSites 10x mais rapidos que WordPress, impossiveis de hackear e otimizados pro Google.\n\nBora continuar?',
  question_process: 'O processo e simples:\n1. Briefing (aqui mesmo)\n2. Design (aprovo com voce)\n3. Codificacao\n4. Publicacao\n\nVoce acompanha tudo. Seguimos?',
  question_payment: 'Pagamento:\n• 50% na entrada + 50% na entrega\n• PIX, cartao ou transferencia\n• Contrato e nota fiscal\n\nPode continuar tranquilo, seguimos.'
};

// ============================================================
// CONVERSATION MEMORY
// ============================================================
export interface ConversationMemory {
  stepsAnswered: number;
  hesitations: number;
  corrections: number;
  avgResponseLength: number;
  responseLengths: number[];
  lastAnswerTime: number;
  responseTimes: number[];
  detectedProfile: {
    seemsRushing: boolean;
    seemsUnsure: boolean;
    seemsTechnical: boolean;
  };
}

export const initialMemory = (): ConversationMemory => ({
  stepsAnswered: 0,
  hesitations: 0,
  corrections: 0,
  avgResponseLength: 0,
  responseLengths: [],
  lastAnswerTime: 0,
  responseTimes: [],
  detectedProfile: {
    seemsRushing: false,
    seemsUnsure: false,
    seemsTechnical: false,
  }
});

export function updateMemory(mem: ConversationMemory, input: string): ConversationMemory {
  const clean = input.toLowerCase().trim();
  const now = Date.now();

  const lengths = [...mem.responseLengths, input.length];
  const times = mem.lastAnswerTime > 0 ? [...mem.responseTimes, now - mem.lastAnswerTime] : mem.responseTimes;

  const avg = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
  const avgTime = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 5000;

  const seemsRushing = avg < 20 && avgTime < 3000 && times.length >= 3;
  const seemsUnsure = mem.hesitations >= 3;
  const seemsTechnical = /(react|next|ssr|api|frontend|tailwind|figma|component)/.test(clean);

  return {
    stepsAnswered: mem.stepsAnswered + 1,
    hesitations: mem.hesitations,
    corrections: mem.corrections,
    avgResponseLength: avg,
    responseLengths: lengths,
    lastAnswerTime: now,
    responseTimes: times,
    detectedProfile: { seemsRushing, seemsUnsure, seemsTechnical },
  };
}

// ============================================================
// WHATSAPP RESPONSES
// ============================================================
export function getWhatsAppResponse(intentType: string): string | null {
  if (QUICK_ANSWERS[intentType]) return QUICK_ANSWERS[intentType];

  if (intentType === 'hesitation') return 'Sem problema, respira! Quer que eu te ajude a escolher? Posso sugerir algo baseado no que voce me disser. Ou se preferir, fala direto com o PH no WhatsApp.';

  if (intentType === 'off_topic') return 'Boa pergunta! Eu sou a assistente do PH. Nao sou inteligencia artificial — sou um sistema preparado com todas as respostas pra te ajudar num orcamento. Mas o PH e o humano por de tudo isso 😉 Podemos continuar?';

  return null;
}

// ============================================================
// CHAT FLOW — Redesigned: 8 steps + recovery
// ============================================================
export const CHAT_FLOW: Record<string, ChatStep> = {
  // ---- START ----
  start: {
    id: 'start',
    message: `Ola! 👋 Eu sou a assistente do PH.\n\nSe voce quer um orcamento rapido, chegou no lugar certo. Sao 8 perguntas e eu te dou uma estimativa na hora.\n\nComo posso te chamar?`,
    type: 'input',
    key: 'name',
    inputPlaceholder: 'Seu nome...',
    nextId: 'check_project_type',
  },

  start_context: {
    id: 'start_context',
    message: (data) => `Ola! Vi que voce se interessou por **${data.projectType}** — otima escolha. 👋\n\nVou montar um orcamento completo pra voce. Sao 8 perguntas rapidas.\n\nComo posso te chamar?`,
    type: 'input',
    key: 'name',
    inputPlaceholder: 'Seu nome...',
    nextId: 'check_project_type',
  },

  welcome_back: {
    id: 'welcome_back',
    message: (data) => `Oi ${data.name}! Que bom que você voltou. 👋\n\nVoce ja tinha comecado um orcamento. Quer continuar de onde parou ou prefere comecar do zero?`,
    type: 'options',
    options: [
      { label: '▶️ Continuar', value: 'continue', nextId: 'check_project_type' },
      { label: '🔄 Novo projeto', value: 'restart', nextId: 'start' },
    ],
  },

  // ---- RECOVERY steps for abandoned users ----
  recovery_stuck: {
    id: 'recovery_stuck',
    message: (data) => `Oi ${data.name}, tudo bem? Vi que voce tinha comecado um orcamento mas nao chegou a escolher o tipo de projeto.\n\nQuer continuar de onde parou?`,
    type: 'options',
    options: [
      { label: '▶️ Continuar', value: 'continue', nextId: 'check_project_type' },
      { label: '🔄 Recomecar', value: 'restart', nextId: 'start' },
      { label: '💬 So tirar duvidas', value: 'SwitchToSupport', nextId: 'support_start' },
    ],
  },

  recovery_middle: {
    id: 'recovery_middle',
    message: (data) => `Oi ${data.name}! Voce ja tinha definido que quer **${data.projectType}**. Faltou pouco para fechar o orcamento.\n\nQuer terminar? So mais 2 perguntinhas.`,
    type: 'options',
    options: [
      { label: '▶️ Terminar orcamento', value: 'continue', nextId: 'details' },
      { label: '🔄 Recomecar do zero', value: 'restart', nextId: 'start' },
    ],
  },

  // ---- STEP 1: Project type ----
  check_project_type: {
    id: 'check_project_type',
    message: (data) => `Prazer, ${data.name}! 🤝\n\nO que voce tem em mente? Escolha o que mais combina com seu projeto:`,
    type: 'options',
    key: 'projectType',
    dynamicOptions: () => [
      ...SERVICE_PACKAGES.map(pkg => ({ label: pkg.title, value: pkg.title, nextId: 'design_status' })),
      { label: '💡 Algo personalizado', value: 'Personalizado', nextId: 'design_status' },
      { label: '❓ Tenho duvidas', value: 'SwitchToSupport', nextId: 'support_start' },
    ],
  },

  // ---- STEP 2: Design ----
  design_status: {
    id: 'design_status',
    message: (data) => `Show! **${data.projectType}** e um otimo caminho. 🎯\n\nSobre o design: voce ja tem um layout pronto, ou a gente cria do zero?`,
    type: 'options',
    key: 'designStatus',
    options: [
      { label: '🎨 Criar do zero', value: 'Nao tenho design', nextId: 'design_note' },
      { label: '✅ Ja tenho pronto', value: 'Sim, tenho design', nextId: 'transition_func' },
      { label: '🔗 Tenho referencias', value: 'Tenho referencias', nextId: 'transition_func' },
    ],
  },

  design_note: {
    id: 'design_note',
    message: `Combinado! Vou incluir a criacao completa do design.\n\nIsso garante uma identidade visual profissional e exclusiva (+R$ 500, mas vale cada centavo).\n\nAgora, funcionalidades...`,
    type: 'options',
    options: [
      { label: '👍 Bora!', value: 'continue', nextId: 'transition_func' },
    ],
  },

  // Micro-transition before multi-select
  transition_func: {
    id: 'transition_func',
    message: `Agora vamos ao que faz o site funcionar de verdade. ⚙️\n\nSelecione tudo que fizer sentido (ou nenhum se quiser o basico):`,
    type: 'multi-select',
    key: 'functionalities',
    options: [
      { label: '💬 Botao WhatsApp', value: 'WhatsApp' },
      { label: '📧 Formulario de Contato', value: 'Formulario' },
      { label: '📸 Galeria de Fotos', value: 'Galeria' },
      { label: '✨ Animacoes', value: 'Animacoes' },
      { label: '📰 Blog/Noticias', value: 'Blog' },
      { label: '🌍 Multi-idiomas', value: 'Multi-idioma' },
    ],
    nextId: 'ack_funcs',
  },

  ack_funcs: {
    id: 'ack_funcs',
    message: (data) => {
      const n = data.functionalities?.length || 0;
      if (n === 0) return 'Sem problemas, simples tambem converte muito. 👌\n\nSo mais 3 perguntas...';
      if (n <= 2) return `Boa escolha! ${n} recurso${n > 1 ? 's' : ''} — enxuto e eficiente. 👌\n\nMais 3 perguntas rapidas...`;
      return `${n} funcionalidades anotadas — projeto robusto, gostei! 💪\n\nSó mais 3 perguntas...`;
    },
    type: 'options',
    options: [
      { label: '👍 Continuar', value: 'continue', nextId: 'timeline' },
    ],
  },

  // ---- STEP 3: Timeline ----
  timeline: {
    id: 'timeline',
    message: `Pra quando voce precisa disso no ar? ⏰`,
    type: 'options',
    key: 'timeline',
    options: [
      { label: '🔥 Urgente (1-2 semanas)', value: 'Urgente', nextId: 'urgency_note' },
      { label: '📅 Normal (2-4 semanas)', value: 'Normal', nextId: 'transition_email' },
      { label: '⏳ Sem pressa', value: 'Flexivel', nextId: 'transition_email' },
    ],
  },

  urgency_note: {
    id: 'urgency_note',
    message: `Entendi — prioridade maxima no seu projeto. 🚨\n\nSó avisando: urgente tem +25% de taxa pela dedicacao exclusiva.\n\nTudo bem?`,
    type: 'options',
    options: [
      { label: '✅ Sim, e urgente mesmo', value: 'continue', nextId: 'transition_email' },
      { label: '🤔 Prefiro prazo normal', value: 'change', nextId: 'timeline' },
    ],
  },

  // Micro-transition before email
  transition_email: {
    id: 'transition_email',
    message: `Quase la! So mais uma coisa... 🏁\n\nQual seu melhor email? Vou usar pra te enviar uma copia do orcamento\n\n(opcional, pode pular se quiser)`,
    type: 'input',
    key: 'email',
    inputPlaceholder: 'exemplo@email.com',
    allowSkip: true,
    nextId: 'details',
  },

  // ---- STEP 4: Details (optional) ----
  details: {
    id: 'details',
    message: `Ultima pergunta antes do resumo! 🎯\n\nTem algo mais que eu deveria saber? Pode ser:\n\n• Sites que voce admira\n• Cores da marca\n• Algum detalhe especifico\n\n(Pode pular se nao tiver)`,
    type: 'input',
    key: 'details',
    inputPlaceholder: 'Detalhes adicionais...',
    allowSkip: true,
    nextId: 'show_summary',
  },

  // ---- SUMMARY ----
  show_summary: {
    id: 'show_summary',
    message: (data) => {
      const estimate = calculateEstimate(data);
      let summary = `Pronto, **${data.name}**! 🎉\n\n`;
      summary += `Seu orcamento ficou assim:\n\n`;
      summary += `📦 ${data.projectType}\n`;
      summary += `🎨 ${data.designStatus}\n`;
      summary += `⏰ ${data.timeline}\n`;
      if (data.targetAudience) summary += `🎯 ${data.targetAudience}\n`;
      if (data.functionalities?.length) summary += `⚙️ ${data.functionalities.join(', ')}\n`;
      if (data.details) summary += `📝 ${data.details}\n`;
      summary += `\n━━━━━━━━━━━━━━━━\n`;
      summary += `Estimativa: **${formatCurrency(estimate.min)} — ${formatCurrency(estimate.max)}**\n`;
      summary += `━━━━━━━━━━━━━━━━\n\n`;
      summary += `Posso enviar esse pro PH?`;

      return summary;
    },
    type: 'summary',
    options: [
      { label: '✅ Enviar pelo WhatsApp', value: 'finish', nextId: 'finalize' },
      { label: '📩 Fale direto comigo', value: 'direct_message', nextId: 'direct_message_confirm' },
      { label: '✏️ Quero ajustar algo', value: 'review', nextId: 'review_menu' },
    ],
  },

  // ---- Direct message ----
  direct_message_confirm: {
    id: 'direct_message_confirm',
    message: `Otimo! Sua mensagem vai direto pro PH. 📩\n\nVoce quer enviar o resumo completo ou escrever algo personalizado?`,
    type: 'options',
    options: [
      { label: '📋 Enviar resumo', value: 'send_summary_msg', nextId: 'direct_message_sent' },
      { label: '✏️ Escrever mensagem', value: 'custom_message', nextId: 'direct_message_custom' },
      { label: '🔙 Voltar', value: 'back', nextId: 'show_summary' },
    ],
  },

  direct_message_custom: {
    id: 'direct_message_custom',
    message: `Manda ai: 👇`,
    type: 'input',
    key: 'directMessage',
    inputPlaceholder: 'Sua mensagem...',
    nextId: 'direct_message_sent',
  },

  direct_message_sent: {
    id: 'direct_message_sent',
    message: (data) => `Pronto, ${data.name}! ✅\n\nMensagem enviada. O PH vai ver e responder quando possivel.\n\nFique de olho aqui no chat! 😊`,
    type: 'text',
  },

  // ---- Review ----
  review_menu: {
    id: 'review_menu',
    message: `Beleza! O que voce quer ajustar? 🔧`,
    type: 'options',
    options: [
      { label: '📦 Tipo de Projeto', value: 'edit_type', nextId: 'check_project_type' },
      { label: '🎨 Design', value: 'edit_design', nextId: 'design_status' },
      { label: '⚙️ Funcionalidades', value: 'edit_funcs', nextId: 'transition_func' },
      { label: '⏰ Prazo', value: 'edit_timeline', nextId: 'timeline' },
      { label: '📧 Email', value: 'edit_email', nextId: 'transition_email' },
      { label: '📝 Detalhes', value: 'edit_details', nextId: 'details' },
      { label: '🔄 Recomecar', value: 'restart', nextId: 'start' },
    ],
  },

  // ---- Finalize ----
  finalize: {
    id: 'finalize',
    message: (data) => {
      const estimate = calculateEstimate(data);
      return `Otimo, ${data.name}! 🎉\n\nSua estimativa: **${formatCurrency(estimate.min)} — ${formatCurrency(estimate.max)}**.\n\nEstou abrindo o WhatsApp com tudo pronto. E só clicar em enviar que o PH recebe na hora.\n\nObrigado pela confianca! 🤝`;
    },
    type: 'text',
  },

  // ============================================================
  // SUPPORT MODE — keyword-based
  // ============================================================
  support_start: {
    id: 'support_start',
    message: `Claro! No que posso te ajudar? 🤝`,
    type: 'options',
    options: [
      { label: '💳 Pagamento', value: 'Pagamento', nextId: 'support_payment' },
      { label: '⚙️ Tecnologias', value: 'Tecnologia', nextId: 'support_tech' },
      { label: '📅 Prazos', value: 'Prazo', nextId: 'support_deadline' },
      { label: '🔧 Suporte', value: 'Suporte', nextId: 'support_maintenance' },
      { label: '📊 Status do projeto', value: 'status_project', nextId: 'support_project_status' },
      { label: '🚀 Voltar ao orcamento', value: 'SwitchToSales', nextId: 'check_project_type' },
    ],
  },

  support_project_status: {
    id: 'support_project_status',
    message: `Pra eu buscar, me diz seu email: 📧`,
    type: 'input',
    key: 'email',
    inputPlaceholder: 'seu@email.com',
    nextId: 'support_check_project',
  },

  support_check_project: {
    id: 'support_check_project',
    message: (data) => `Buscando projetos para ${data.email}... 🔍`,
    type: 'text',
    nextId: 'support_end',
  },

  support_payment: {
    id: 'support_payment',
    message: `Pagamento:\n\n1️⃣ 50% na entrada — pra iniciar\n2️⃣ 50% na entrega — apos aprovacao\n\n PIX, cartao ou transferencia. Contrato e nota fiscal incluidos.`,
    type: 'options',
    options: [
      { label: '👍 Entendi', value: 'Voltar', nextId: 'support_end' },
      { label: '❓ Mais duvidas', value: 'Mais', nextId: 'support_start' },
    ],
  },

  support_tech: {
    id: 'support_tech',
    message: `Stack:\n\nReact + Next.js + Tailwind CSS + Vite.\n\nResultado: sites que carregam em menos de 1 segundo, 99.9% uptime e SEO otimizado. 10x mais rapido que WordPress.`,
    type: 'options',
    options: [
      { label: '🤩 Impressionante', value: 'Voltar', nextId: 'support_end' },
      { label: '❓ Mais perguntas', value: 'Mais', nextId: 'support_start' },
    ],
  },

  support_deadline: {
    id: 'support_deadline',
    message: `Prazos:\n\n🚀 Landing Page: 3-7 dias uteis\n🏢 Site Institucional: 10-15 dias uteis\n⚡ Urgente: metade do prazo (+25% no valor)\n\nObs: Prazo so comeca depois de receber todo material.`,
    type: 'options',
    options: [
      { label: '✅ Entendi', value: 'Voltar', nextId: 'support_end' },
      { label: '❓ Mais duvidas', value: 'Mais', nextId: 'support_start' },
    ],
  },

  support_maintenance: {
    id: 'support_maintenance',
    message: `Suporte pos-entrega:\n\n🎁 INCLUIDO (30 dias gratis)\n✓ Correcao de bugs\n✓ Ajustes de conteudo\n✓ Suporte tecnico\n\n💼 MANUTENCAO MENSAL (opcional)\nA partir de R$ 99/mes\n\nSem contrato obrigatorios!`,
    type: 'options',
    options: [
      { label: '👌 Perfeito', value: 'Voltar', nextId: 'support_end' },
      { label: '❓ Mais duvidas', value: 'Mais', nextId: 'support_start' },
    ],
  },

  support_end: {
    id: 'support_end',
    message: `Consegui esclarecer? 😊`,
    type: 'options',
    options: [
      { label: '🚀 Fazer orcamento', value: 'SwitchToSales', nextId: 'check_project_type' },
      { label: '💬 Falar no WhatsApp', value: 'finish', nextId: 'finalize' },
      { label: '📩 Fale direto comigo', value: 'direct_message', nextId: 'direct_message_confirm' },
      { label: '❓ Mais uma duvida', value: 'Mais', nextId: 'support_start' },
    ],
  },
};
