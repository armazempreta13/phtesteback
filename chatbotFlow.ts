import { BudgetData, ChatStep, ChatOption } from './types';
import { SERVICE_PACKAGES } from './config';

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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

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

  if (data.designStatus === 'Não tenho design') {
      basePrice += 500;
  } else if (data.designStatus === 'Tenho referências') {
      basePrice += 200;
  }

  if (data.timeline?.toLowerCase().includes('urgente')) {
      basePrice *= 1.25;
  } else if (data.timeline?.toLowerCase().includes('flexível')) {
      basePrice *= 0.9;
  }

  return {
      min: Math.round(basePrice * 0.85),
      max: Math.round(basePrice * 1.15)
  };
};

export const generateWhatsAppLink = (data: BudgetData) => {
    const phone = "5561993254324"; 
    
    let text = `Olá! Vim pelo Chat do Portfólio.\n\n`;
    text += `━━━━━━━━━━━━━━━━\n`;
    text += `SOBRE MIM\n`;
    text += `Nome: ${data.name}\n`;
    if (data.email) text += `E-mail: ${data.email}\n`;
    if (data.targetAudience) text += `Público: ${data.targetAudience}\n`;
    
    text += `\nO PROJETO\n`;
    text += `Tipo: ${data.projectType}\n`;
    text += `Design: ${data.designStatus}\n`;
    text += `Prazo: ${data.timeline}\n`;
    if (data.budgetRange) text += `Orçamento: ${data.budgetRange}\n`;
    
    if (data.functionalities && data.functionalities.length > 0) {
        text += `\nFUNCIONALIDADES\n`;
        data.functionalities.forEach(f => text += `✓ ${f}\n`);
    }

    if (data.details) {
        text += `\nDETALHES\n${data.details}\n`;
    }
    
    const estimate = calculateEstimate(data);
    text += `\n━━━━━━━━━━━━━━━━\n`;
    text += `ESTIMATIVA IA\n${formatCurrency(estimate.min)} - ${formatCurrency(estimate.max)}\n\n`;
    text += `Podemos conversar sobre a proposta?`;
    
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
};

export const CHAT_FLOW: Record<string, ChatStep> = {
  start: {
    id: 'start',
    message: "Olá! 👋 Sou a assistente virtual do PH.\n\nVou te ajudar a montar um orçamento personalizado em cerca de 5 minutos. Nada de enrolação, só as perguntas certas.\n\nPara começarmos, como você prefere ser chamado?",
    type: 'input',
    key: 'name',
    inputPlaceholder: "Seu nome...",
    nextId: 'check_project_type'
  },
  
  start_context: {
    id: 'start_context',
    message: (data) => `Olá! 👋 Vi que você se interessou por ${data.projectType}.\n\nVou te ajudar a estruturar esse projeto e calcular um orçamento realista.\n\nComo você prefere ser chamado?`,
    type: 'input',
    key: 'name',
    inputPlaceholder: "Seu nome...",
    nextId: 'check_project_type'
  },

  welcome_back: {
    id: 'welcome_back',
    message: (data) => `Olá novamente, ${data.name}! 👋\n\nVi que você já tinha iniciado um orçamento. Quer continuar de onde parou ou prefere começar um novo projeto?`,
    type: 'options',
    options: [
        { label: '▶️ Continuar orçamento', value: 'continue', nextId: 'check_project_type' },
        { label: '🔄 Novo projeto', value: 'restart', nextId: 'start' }
    ]
  },

  check_project_type: {
    id: 'check_project_type',
    message: (data) => `Prazer em conhecê-lo, ${data.name}! 🤝\n\nVamos começar pelo mais importante: que tipo de projeto digital você tem em mente?`,
    type: 'options',
    key: 'projectType',
    dynamicOptions: () => [
        ...SERVICE_PACKAGES.map(pkg => ({ label: pkg.title, value: pkg.title, nextId: 'design_status' })),
        { label: '💡 Projeto personalizado', value: 'Personalizado', nextId: 'design_status' },
        { label: '❓ Tenho dúvidas', value: 'SwitchToSupport', nextId: 'support_start' }
    ]
  },

  design_status: {
    id: 'design_status',
    message: (data) => `Perfeito! ${data.projectType} é uma ótima escolha. 🎯\n\nAgora sobre o design: você já tem algo pronto (Figma, Adobe XD) ou vamos precisar criar do zero?`,
    type: 'options',
    key: 'designStatus',
    options: [
      { label: '🎨 Preciso criar do zero', value: 'Não tenho design', nextId: 'design_note' },
      { label: '✅ Já tenho pronto', value: 'Sim, tenho design', nextId: 'functionalities' },
      { label: '🔗 Tenho referências', value: 'Tenho referências', nextId: 'functionalities' }
    ]
  },

  design_note: {
    id: 'design_note',
    message: "Entendi! Vou incluir a criação completa do design.\n\nIsso adiciona cerca de R$ 500 ao projeto, mas garante uma identidade visual profissional e exclusiva.\n\nVamos continuar?",
    type: 'options',
    options: [
      { label: '👍 Sim, vamos!', value: 'continue', nextId: 'functionalities' }
    ]
  },

  functionalities: {
    id: 'functionalities',
    message: "Ótimo! Agora vamos às funcionalidades. ⚙️\n\nQuais recursos você precisa? Pode selecionar quantos quiser (ou nenhum se preferir o básico):",
    type: 'multi-select',
    key: 'functionalities',
    options: [
      { label: '💬 Botão WhatsApp', value: 'WhatsApp' },
      { label: '📧 Formulário de Contato', value: 'Formulário' },
      { label: '📸 Galeria de Fotos', value: 'Galeria' },
      { label: '✨ Animações', value: 'Animações' },
      { label: '📰 Blog/Notícias', value: 'Blog' },
      { label: '🌍 Multi-idiomas', value: 'Multi-idioma' }
    ],
    nextId: 'define_audience'
  },

  define_audience: {
    id: 'define_audience',
    message: (data) => {
      const funcCount = data.functionalities?.length || 0;
      let response = funcCount > 0 
        ? `Show! ${funcCount} funcionalidade${funcCount > 1 ? 's' : ''} selecionada${funcCount > 1 ? 's' : ''}. 👌`
        : "Ok, vamos manter o essencial. 👌";
      
      return `${response}\n\nAgora me conta: para quem é esse projeto? Qual o público-alvo?\n\nEx: Advogados, Empresas B2B, Público jovem...`;
    },
    type: 'input',
    key: 'targetAudience',
    inputPlaceholder: "Descreva o público...",
    nextId: 'budget_range'
  },

  budget_range: {
    id: 'budget_range',
    message: (data) => `Entendi, ${data.targetAudience}. Isso ajuda bastante! 📊\n\nPara eu sugerir a melhor solução técnica, qual faixa de investimento você tem em mente?`,
    type: 'options',
    key: 'budgetRange',
    options: [
        { label: '💵 Até R$ 1.500', value: 'Até R$ 1.500', nextId: 'timeline' },
        { label: '💰 R$ 1.500 - R$ 3.000', value: 'R$ 1.500 - R$ 3.000', nextId: 'timeline' },
        { label: '💎 R$ 3.000 - R$ 5.000', value: 'R$ 3.000 - R$ 5.000', nextId: 'timeline' },
        { label: '🏆 Acima de R$ 5.000', value: 'Acima de R$ 5.000', nextId: 'timeline' },
        { label: '🤔 Prefiro não informar', value: 'A definir', nextId: 'timeline' }
    ]
  },

  timeline: {
    id: 'timeline',
    message: "Perfeito! Agora sobre prazos. ⏰\n\nQuando você precisa que isso esteja no ar?",
    type: 'options',
    key: 'timeline',
    options: [
        { label: '🔥 Urgente (1-2 semanas)', value: 'Urgente', nextId: 'urgency_note' },
        { label: '📅 Normal (2-4 semanas)', value: 'Normal', nextId: 'hosting_domain' },
        { label: '⏳ Sem pressa', value: 'Flexível', nextId: 'hosting_domain' }
    ]
  },

  urgency_note: {
    id: 'urgency_note',
    message: "Entendi a urgência! 🚨\n\nProjetos urgentes têm prioridade máxima, mas adicionam cerca de 25% ao valor final devido ao trabalho extra.\n\nTudo bem assim?",
    type: 'options',
    options: [
      { label: '✅ Sim, é urgente mesmo', value: 'continue', nextId: 'hosting_domain' },
      { label: '🤔 Prefiro prazo normal', value: 'change', nextId: 'timeline' }
    ]
  },

  hosting_domain: {
    id: 'hosting_domain',
    message: "Ótimo! Uma pergunta técnica: 🖥️\n\nVocê já tem domínio próprio (ex: seusite.com.br) e hospedagem?",
    type: 'options',
    key: 'hasDomain',
    options: [
      { label: '✅ Sim, tenho tudo', value: 'Sim', nextId: 'details' },
      { label: '⚠️ Tenho só o domínio', value: 'Só domínio', nextId: 'details' },
      { label: '❌ Não tenho nada', value: 'Não', nextId: 'hosting_note' }
    ]
  },

  hosting_note: {
    id: 'hosting_note',
    message: "Sem problemas! Posso incluir:\n\n• Registro de domínio (.com.br)\n• Hospedagem premium na Vercel\n• Configuração completa\n\nCusto adicional de R$ 200 (primeiro ano).\n\nContinuando...",
    type: 'options',
    options: [
      { label: '👍 Entendi', value: 'continue', nextId: 'details' }
    ]
  },

  details: {
    id: 'details',
    message: "Penúltima etapa! 🎯\n\nTem algum detalhe importante que eu não perguntei?\n\n• Sites que você admira\n• Cores da marca\n• Funcionalidade específica\n\n(Pode deixar em branco se preferir)",
    type: 'input',
    key: 'details',
    inputPlaceholder: "Detalhes adicionais...",
    nextId: 'ask_email',
    allowSkip: true
  },

  ask_email: {
    id: 'ask_email',
    message: "Quase pronto! 🏁\n\nPara finalizar, qual é o seu melhor e-mail? 📧\n\n(Vou usar para te enviar a cópia deste orçamento)",
    type: 'input',
    key: 'email',
    inputPlaceholder: "exemplo@email.com",
    nextId: 'show_summary'
  },

  show_summary: {
    id: 'show_summary',
    message: (data) => {
      const estimate = calculateEstimate(data);
      const estimateString = `${formatCurrency(estimate.min)} - ${formatCurrency(estimate.max)}`;
      
      let summary = `Pronto, ${data.name}! 🎉\n\n`;
      summary += `━━━━━━━━━━━━━━━━\n`;
      summary += `RESUMO DO PROJETO\n`;
      summary += `━━━━━━━━━━━━━━━━\n\n`;
      
      summary += `📦 Tipo: ${data.projectType}\n`;
      if (data.email) summary += `📧 Email: ${data.email}\n`;
      summary += `🎨 Design: ${data.designStatus}\n`;
      summary += `⏰ Prazo: ${data.timeline}\n`;
      if (data.targetAudience) summary += `🎯 Público: ${data.targetAudience}\n`;
      if (data.budgetRange) summary += `💰 Orçamento: ${data.budgetRange}\n`;
      if (data.hasDomain) summary += `🌐 Domínio/Hospedagem: ${data.hasDomain}\n`;
      
      if (data.functionalities && data.functionalities.length > 0) {
        summary += `\n⚙️ RECURSOS\n`;
        data.functionalities.forEach(func => summary += `✓ ${func}\n`);
      }

      if (data.details) {
        summary += `\n📝 OBSERVAÇÕES\n${data.details}\n`;
      }
      
      summary += `\n━━━━━━━━━━━━━━━━\n`;
      summary += `💵 ESTIMATIVA\n`;
      summary += `${estimateString}\n`;
      summary += `━━━━━━━━━━━━━━━━\n\n`;
      summary += `Posso enviar esse briefing pro WhatsApp do PH?`;
      
      return summary;
    },
    type: 'summary',
    options: [
      { label: '✅ Sim, enviar agora!', value: 'finish', nextId: 'finalize' },
      { label: '✏️ Corrigir algo', value: 'review', nextId: 'review_menu' }
    ]
  },

  review_menu: {
      id: 'review_menu',
      message: "Sem problema! O que você gostaria de ajustar? 🔧",
      type: 'options',
      options: [
          { label: '📧 E-mail', value: 'edit_email', nextId: 'ask_email' },
          { label: '📦 Tipo de Projeto', value: 'edit_type', nextId: 'check_project_type' },
          { label: '🎨 Design', value: 'edit_design', nextId: 'design_status' },
          { label: '⚙️ Funcionalidades', value: 'edit_funcs', nextId: 'functionalities' },
          { label: '🎯 Público', value: 'edit_audience', nextId: 'define_audience' },
          { label: '⏰ Prazo', value: 'edit_timeline', nextId: 'timeline' },
          { label: '📝 Detalhes', value: 'edit_details', nextId: 'details' },
          { label: '🔄 Recomeçar tudo', value: 'restart', nextId: 'start' }
      ]
  },

  // ===== SUPORTE =====
  support_start: {
      id: 'support_start',
      message: "Claro! No que posso ajudar? 🤝",
      type: 'options',
      options: [
          { label: '💳 Formas de pagamento', value: 'Pagamento', nextId: 'support_payment' },
          { label: '⚙️ Tecnologias usadas', value: 'Tecnologia', nextId: 'support_tech' },
          { label: '📅 Prazos e entregas', value: 'Prazo', nextId: 'support_deadline' },
          { label: '🔧 Suporte pós-entrega', value: 'Suporte', nextId: 'support_maintenance' },
          { label: '🔙 Voltar ao orçamento', value: 'SwitchToSales', nextId: 'check_project_type' }
      ]
  },

  support_payment: {
      id: 'support_payment',
      message: "FORMAS DE PAGAMENTO 💳\n\n1️⃣ 50% de entrada\nPara iniciar o desenvolvimento\n\n2️⃣ 50% na entrega\nApós sua aprovação final\n\n✓ PIX (instantâneo)\n✓ Cartão de crédito\n✓ Transferência bancária\n\nEmito contrato e nota fiscal.",
      type: 'options',
      options: [
          { label: '👍 Entendi', value: 'Voltar', nextId: 'support_end' },
          { label: '❓ Outra dúvida', value: 'Mais', nextId: 'support_start' }
      ]
  },

  support_tech: {
      id: 'support_tech',
      message: "TECNOLOGIAS ⚙️\n\n✓ React + Next.js\nFramework moderno e veloz\n\n✓ Tailwind CSS\nDesign responsivo profissional\n\n✓ Vercel\nHospedagem premium, mesma da Netflix\n\nResultado:\n→ Sites que carregam em < 1 segundo\n→ 99.9% de uptime\n→ SEO otimizado",
      type: 'options',
      options: [
          { label: '🤩 Impressionante!', value: 'Voltar', nextId: 'support_end' },
          { label: '❓ Mais perguntas', value: 'Mais', nextId: 'support_start' }
      ]
  },

  support_deadline: {
      id: 'support_deadline',
      message: "PRAZOS 📅\n\n🚀 Landing Page\n3-7 dias úteis\n\n🏢 Site Institucional\n10-20 dias úteis\n\n⚡ Urgente\n50% do prazo normal\n+25% no valor\n\nObs: Prazo inicia após receber todos os materiais (textos, fotos, logo).",
      type: 'options',
      options: [
          { label: '✅ Entendi', value: 'Voltar', nextId: 'support_end' },
          { label: '❓ Mais dúvidas', value: 'Mais', nextId: 'support_start' }
      ]
  },

  support_maintenance: {
      id: 'support_maintenance',
      message: "SUPORTE PÓS-ENTREGA 🔧\n\n🎁 INCLUÍDO (30 dias)\n✓ Correção de bugs\n✓ Ajustes de conteúdo\n✓ Suporte técnico\n\n💼 MANUTENÇÃO MENSAL (opcional)\nA partir de R$ 99/mês\n✓ Updates de segurança\n✓ Backups automáticos\n✓ Alterações de conteúdo\n\nSem obrigatoriedade!",
      type: 'options',
      options: [
          { label: '👌 Perfeito', value: 'Voltar', nextId: 'support_end' },
          { label: '❓ Mais dúvidas', value: 'Mais', nextId: 'support_start' }
      ]
  },

  support_end: {
      id: 'support_end',
      message: "Consegui esclarecer suas dúvidas? 😊",
      type: 'options',
      options: [
          { label: '🚀 Voltar ao orçamento', value: 'SwitchToSales', nextId: 'check_project_type' },
          { label: '💬 Falar no WhatsApp', value: 'finish', nextId: 'finalize' },
          { label: '❓ Tenho outra dúvida', value: 'Mais', nextId: 'support_start' }
      ]
  },

  // ===== FINALIZAÇÃO =====
  finalize: {
      id: 'finalize',
      message: (data) => `Perfeito, ${data.name}! 🎉\n\nEstou abrindo o WhatsApp agora com todo o briefing formatado.\n\nÉ só clicar em enviar que o PH vai te responder em breve!\n\nObrigado pela confiança. 🤝`,
      type: 'text'
  }
};