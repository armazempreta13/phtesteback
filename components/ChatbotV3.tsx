import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageCircle, X, Send, CheckSquare, Square, ChevronRight,
  ShieldAlert, RefreshCcw, Bot, Sparkles, HelpCircle, Briefcase,
  Info, Clock, ArrowUpRight, User, Zap, FileText, Eye,
  Smartphone, Globe, BarChart3, Layers, MessageSquare
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { BudgetData, ChatMessage, ChatOption, ChatbotProps, ViewType } from '../types';
import { SERVICE_PACKAGES, CONTACT_CONFIG, PROCESS_STEPS } from '../config';
import { CHAT_FLOW, INITIAL_BUDGET, generateWhatsAppLink } from '../chatbotFlow';
import { api } from '../lib/api';
import { useMobile } from '../hooks/useMobile';

// --- Constants ---

const CHAT_TRIGGERS = [
  "Posso ajudar no seu projeto? 👋",
  "Vamos criar algo incrível hoje? 🚀",
  "Dúvidas sobre os pacotes? 🤔",
  "Faça um orçamento sem compromisso! 💰",
  "Transforme sua ideia em site 🌐",
  "Precisa de um Frontend Especialista? 👨‍💻",
  "Bora escalar seu negócio? 📈",
  "Sites rápidos e modernos aqui ⚡",
  "Me chama para conversar! 💬",
  "Qual seu próximo desafio? 🏆",
];

const SUPPORT_KEYWORDS = [
  'ajuda', 'socorro', 'dúvida', 'duvida', 'suporte', 'problema',
  'não entendi', 'como funciona', 'explica', 'o que é',
];

const BLOG_INTENT_KEYWORDS = ['blog', 'artigo', 'post', 'conteúdo', 'conteudo', 'ler', 'texto'];
const PORTFOLIO_INTENT_KEYWORDS = ['portfolio', 'projetos', 'trabalhos', 'case', 'cases'];
const SERVICES_INTENT_KEYWORDS = ['serviços', 'servicos', 'pacotes', 'preço', 'preco', 'plano'];
const NAV_INTENT_MAP: Record<string, string[]> = {
  'portfolio': PORTFOLIO_INTENT_KEYWORDS,
  'blog': BLOG_INTENT_KEYWORDS,
  'services': SERVICES_INTENT_KEYWORDS,
  'contact': ['contato', 'contact', 'fale', 'email', 'whatsapp', 'ligar', 'telefone'],
  'about': ['sobre', 'sobre mim', 'quem é', 'quem e ', 'quem vc', 'quem você', 'história', 'historia'],
  'process': ['processo', 'como funciona', 'etapas', 'método', 'metodo', 'passo a passo'],
  'faq': ['faq', 'perguntas', 'duvidas', 'dúvidas', 'frequentes'],
};

// --- Component ---

export const Chatbot: React.FC<ChatbotProps> = ({ isOpen, setIsOpen, onNavigate, contextService, extraElevation, initialMode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [budgetData, setBudgetData] = useState<BudgetData>(INITIAL_BUDGET);
  const [currentStepId, setCurrentStepId] = useState<string>('');
  const [selectedMultiOptions, setSelectedMultiOptions] = useState<string[]>([]);
  const [chatMode, setChatMode] = useState<'sales' | 'support'>('sales');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showQuickMessage, setShowQuickMessage] = useState(false);
  const [quickMessageText, setQuickMessageText] = useState('');
  const [proactiveMessage, setProactiveMessage] = useState('');
  const [showProactive, setShowProactive] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const quickMessageRef = useRef<HTMLTextAreaElement>(null);
  const isMounted = useRef(true);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isHandlingInput = useRef(false);
  const isComponentOpen = useRef(false);

  const isMobile = useMobile();
  const shouldElevate = !!extraElevation;

  // --- Mount /Unmount ---
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  // --- Persist chat mode in ref ---
  useEffect(() => {
    isComponentOpen.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  // --- Scroll to bottom ---
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // --- Initialize chat when opened ---
  useEffect(() => {
    if (isOpen && messages.length === 0 && currentStepId === '') {
      initializeChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // --- Proactive messages when closed ---
  useEffect(() => {
    if (isOpen) {
      setShowProactive(false);
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout>;

    const showRandom = () => {
      if (!isMounted.current) return;
      const randomMsg = CHAT_TRIGGERS[Math.floor(Math.random() * CHAT_TRIGGERS.length)];
      setProactiveMessage(randomMsg);
      setShowProactive(true);

      timeoutId = setTimeout(() => {
        if (!isMounted.current) return;
        setShowProactive(false);
        const delay = Math.random() * 12000 + 8000;
        timeoutId = setTimeout(showRandom, delay);
      }, 5000);
    };

    timeoutId = setTimeout(showRandom, 3000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isOpen]);

  // --- Polling for admin replies ---
  useEffect(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    const runCheck = async () => {
      const email = budgetData.email || localStorage.getItem('chat_email');
      if (budgetData.name) {
        await checkAdminReplies(budgetData.email || null);
      }
    };

    if (budgetData.name || localStorage.getItem('chat_name')) {
      runCheck();
      pollingRef.current = setInterval(runCheck, 15000);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [budgetData.name, budgetData.email]);

  // --- LocalStorage helpers ---
  const getSavedBudget = (): Partial<BudgetData> => {
    try {
      const saved = localStorage.getItem('chat_budget');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };

  const saveBudget = (data: BudgetData) => {
    try {
      localStorage.setItem('chat_budget', JSON.stringify({
        name: data.name,
        email: data.email,
        projectType: data.projectType,
        designStatus: data.designStatus,
        budgetRange: data.budgetRange,
        timeline: data.timeline,
        details: data.details,
        functionalities: data.functionalities,
        targetAudience: data.targetAudience,
      }));
      if (data.name) localStorage.setItem('chat_name', data.name);
      if (data.email) localStorage.setItem('chat_email', data.email);
    } catch { /* silent */ }
  };

  // --- Admin replies ---
  const checkAdminReplies = async (email: string | null) => {
    try {
      const storedName = localStorage.getItem('chat_name');
      const checkEmail = email || localStorage.getItem('chat_email');
      if (!checkEmail) return;

      const res = await fetch(`/api/chat/messages?email=${encodeURIComponent(checkEmail)}`);
      if (!res.ok) return;

      const data = await res.json();
      const allMessages = data.messages || [];
      const repliedMessages = allMessages.filter((m: any) => m.status === 'replied' && m.admin_reply);

      if (repliedMessages.length === 0) {
        setUnreadCount(0);
        return;
      }

      const lastSeenId = localStorage.getItem('chat_seen_reply_id');
      const lastReply = repliedMessages[0];

      if (String(lastReply.id) !== lastSeenId) {
        const newCount = repliedMessages.filter((m: any) => String(m.id) !== lastSeenId).length;

        if (lastSeenId !== null && isComponentOpen.current) {
          addBotMessage(`O PH respondeu sua mensagem! 📩\n\n"${lastReply.admin_reply}"`, 'text');
          localStorage.setItem('chat_seen_reply_id', String(lastReply.id));
          setUnreadCount(0);
        } else if (lastSeenId === null) {
          localStorage.setItem('chat_seen_reply_id', String(lastReply.id));
          setUnreadCount(0);
        } else {
          setUnreadCount(Math.min(newCount, 99));
        }
      }
    } catch { /* silent */ }
  };

  // --- Initialize chat ---
  const initializeChat = () => {
    setMessages([]);
    setSelectedMultiOptions([]);
    setQuickMessageText('');
    setShowQuickMessage(false);
    isHandlingInput.current = false;

    if (initialMode === 'support') {
      setChatMode('support');
      processStep('support_start', { ...INITIAL_BUDGET });
      return;
    }

    setChatMode('sales');

    if (contextService) {
      setBudgetData((prev) => ({ ...prev, projectType: contextService.title }));
      processStep('start_context', { ...INITIAL_BUDGET, projectType: contextService.title });
      return;
    }

    const savedData = getSavedBudget();
    if (savedData.name && savedData.projectType) {
      const mergedData = { ...INITIAL_BUDGET, ...savedData };
      setBudgetData(mergedData);
      processStep('welcome_back', mergedData);
      return;
    }

    if (savedData.name) {
      const mergedData = { ...INITIAL_BUDGET, ...savedData };
      setBudgetData(mergedData);
      processStep('welcome_back', mergedData);
      return;
    }

    processStep('start', INITIAL_BUDGET);
  };

  // --- Process a step from CHAT_FLOW ---
  const processStep = async (stepId: string, currentData: BudgetData) => {
    const step = CHAT_FLOW[stepId];
    if (!step) return;

    setCurrentStepId(stepId);

    // Auto-skip check_project_type if projectType already set
    if (stepId === 'check_project_type' && currentData.projectType) {
      processStep('design_status', currentData);
      return;
    }

    // Special: check project status via API
    if (stepId === 'support_check_project' && currentData.email) {
      setIsTyping(true);
      await delay(800);
      if (!isMounted.current) return;
      setIsTyping(false);
      try {
        const res = await api.projects.getAll();
        const allProjects = res.data?.projects || [];
        const userProjects = allProjects.filter(
          (p: any) => p.client_email?.toLowerCase() === currentData.email?.toLowerCase()
        );

        if (userProjects.length > 0) {
          const p = userProjects[0];
          const statusLabels: Record<string, string> = {
            new: 'Novo Lead',
            briefing: 'Em Briefing',
            development: 'Em Desenvolvimento',
            review: 'Em Revisao',
            completed: 'Concluido',
          };
          addBotMessage(
            `Encontrei seu projeto! 🎉\n\n` +
            `📦 ${p.title}\n` +
            `📊 Status: ${statusLabels[p.status] || p.status}\n` +
            `📈 Progresso: ${p.progress}%\n` +
            `📅 Entrega: ${p.deadline ? new Date(p.deadline).toLocaleDateString('pt-BR') : 'A definir'}\n\n` +
            `Qualquer duvida, e so perguntar! 😊`
          );
        } else {
          addBotMessage(
            `Nao encontrei projetos com esse email. 😕\n\n` +
            `Quer fazer um orcamento? Comece me dizendo seu nome!`,
            'text',
            [{ label: '🚀 Quero orcamento!', value: 'start_budget', nextId: 'start' }]
          );
        }
      } catch {
        addBotMessage('Nao consegui buscar os projetos no momento. Tente novamente!');
      }
      return;
    }

    setIsTyping(true);
    await delay(700);
    if (!isMounted.current) return;
    setIsTyping(false);

    const messageText = typeof step.message === 'function' ? step.message(currentData) : step.message;

    let options = step.options;
    if (step.dynamicOptions) {
      options = step.dynamicOptions(currentData);
    }

    addBotMessage(messageText, step.type, options);

    // Focus input for input steps
    if (step.type === 'input') {
      const currentVal = currentData[step.key as keyof BudgetData];
      if (typeof currentVal === 'string' && currentVal) {
        setInputValue(currentVal);
      } else {
        setInputValue('');
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setInputValue('');
    }
  };

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // --- Message adders ---
  const addBotMessage = (text: string | React.ReactNode, type: any = 'text', options?: ChatOption[]) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `bot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        text,
        isUser: false,
        type,
        options,
      },
    ]);
  };

  const addUserMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        text,
        isUser: true,
      },
    ]);
  };

  // --- Keyword-based support responses (no AI model) ---
  const KEYWORD_RESPONSES: Record<string, { kw: string[]; response: string }>[] = [
    { kw: ['preço', 'preco', 'valor', 'quanto custa', 'orcamento', 'orçamento', 'pago', 'pagamento'], response: `**Nossos Pacotes:**\n\n🚀 Landing Page Express — a partir de R$ 900\n🏢 Site Institucional — a partir de R$ 2.000\n🛒 E-Commerce — a partir de R$ 5.000\n⚡ Sistema Web — sob consulta\n\nTodos incluem design responsivo, otimização SEO e suporte inicial. Quer fazer um orçamento?` },
    { kw: ['prazo', 'tempo', 'demora', 'quando fica pronto', 'entrega'], response: `**Prazos Estimados:**\n\n🚀 Landing Page — 5 a 10 dias\n🏢 Site Institucional — 15 a 30 dias\n🛒 E-Commerce — 30 a 60 dias\n⚡ Sistema Web — sob consulta\n\nPrazos podem variar conforme a complexidade. Quer um orçamento personalizado?` },
    { kw: ['tecnologia', 'stack', 'framework', 'ferramenta', 'linguagem'], response: `**Tecnologias que usamos:**\n\n🌐 React.js / Next.js para frontend\n🎨 Tailwind CSS para estilização\n⚡ TypeScript para tipagem segura\n📦 Vite para build ultrarrapido\n🚀 Vercel para deploy global\n\nDesenvolvimento moderno e focado em performance!` },
    { kw: ['pagamento', 'pagar', 'pix', 'parcela', 'desconto'], response: `**Formas de Pagamento:**\n\n💳 Cartão de crédito (parc. em até 12x)\n📱 PIX (5% de desconto!)\n💰 Transferência bancária\n\nTrabalhamos com 50% na aprovação e 50% na entrega. Negociamos condições especiais!` },
    { kw: ['contato', 'whatsapp', 'falar', 'ligar', 'email', 'telefone', 'zap'], response: `**Fale com o PH diretamente:**\n\n📱 WhatsApp: (61) 99358-8455\n📧 Email: contato@phstatic.com.br\n\nPara atendimento rápido, o WhatsApp é o melhor canal! 😊` },
    { kw: ['portfolio', 'projetos', 'trabalhos', 'case', 'exemplo'], response: `**Confira nossos projetos!** 🎉\n\nTemos cases de Landing Pages, Sites Institucionais, E-Commerces e Sistemas Web.\n\nVou te levar para a galeria de projetos — clique no botão abaixo ou diga "quero ver o portfolio".` },
    { kw: ['processo', 'como funciona', 'etapas', 'método', 'passo a passo'], response: `**Nosso Processo de Trabalho:**\n\n1️⃣ **Briefing** — Entendemos suas necessidades\n2️⃣ **Design** — Criamos o layout e aprovamos\n3️⃣ **Desenvolvimento** — Codificamos com as melhores tecnologias\n4️⃣ **Lançamento** — Publicamos e fazemos testes finais\n\nTransparência total em cada etapa! Quer saber mais sobre alguma?` },
    { kw: ['blog', 'artigo', 'post', 'conteúdo', 'conteudo', 'dica'], response: `**Confira nosso Blog!** 📝\n\nTemos artigos sobre performance web, SEO, design responsivo e dicas para pequenos negócios.\n\nDiga "quero ver o blog" e eu te levo lá!` },
    { kw: ['suporte', 'ajuda', 'manutenção', 'manutencao', 'pos lançamento'], response: `**Suporte e Manutenção:**\n\nTodos os pacotes incluem suporte inicial gratuito.\n\nTambém oferecemos planos de manutenção mensal com:\n• Atualizações de conteúdo\n• Monitoramento de performance\n• Backups regulares\n• Correções de segurança\n\nQuer saber detalhes? O PH pode te explicar pelo WhatsApp!` },
  ];

  const sendSupportResponse = (userMessage: string) => {
    const lower = userMessage.toLowerCase().trim();
    for (const item of KEYWORD_RESPONSES) {
      if (item.kw.some(kw => lower.includes(kw))) {
        addBotMessage(item.response, 'text');
        return;
      }
    }
    // Fallback — direct to PH
    addBotMessage(
      `Entendi sua duvida! Para te dar a melhor resposta, recomendo falar direto com o PH.\n\n` +
      `Clique em "Mensagem" abaixo ou vá para o WhatsApp para um atendimento personalizado. 😊`,
      'text'
    );
  };

  // --- Handle input submit ---
  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isHandlingInput.current) return;

    const stepConfig = CHAT_FLOW[currentStepId];
    const trimmedValue = inputValue.trim();

    if (!trimmedValue && !stepConfig?.allowSkip) return;

    isHandlingInput.current = true;
    setInputValue('');

    // Add user message
    addUserMessage(trimmedValue);

    // Check navigation intents
    const navView = detectNavIntent(trimmedValue, currentStepId);
    if (navView) {
      handleSwitchMode('sales');
      onNavigate(navView);
      isHandlingInput.current = false;
      return;
    }

    // Handle direct_message_custom step
    if (currentStepId === 'direct_message_custom' && trimmedValue) {
      await saveDirectMessage(trimmedValue);
      createProjectFromBudget(budgetData);
      processStep('direct_message_sent', budgetData);
      isHandlingInput.current = false;
      return;
    }

    // Support mode -> keyword-based responses
    if (chatMode === 'support') {
      sendSupportResponse(trimmedValue);
      isHandlingInput.current = false;
      return;
    }

    // Sales mode -> flow
    const currentStep = CHAT_FLOW[currentStepId];
    const newData = { ...budgetData };

    if (currentStep?.key && trimmedValue) {
      // @ts-ignore
      newData[currentStep.key] = trimmedValue;
      setBudgetData(newData);
      saveBudget(newData);

      // Lead capture: auto-create contact when name + email are both provided
      if (currentStep.key === 'name' || currentStep.key === 'email') {
        const hasName = newData.name || localStorage.getItem('chat_name');
        const hasEmail = newData.email || localStorage.getItem('chat_email');
        if (hasName && hasEmail) {
          captureLead(hasName, hasEmail);
        }
      }
    }

    if (currentStep?.nextId) {
      processStep(currentStep.nextId, newData);
    }

    isHandlingInput.current = false;
  };

  // --- Navigation intent detection ---
  const detectNavIntent = (value: string, stepId: string): ViewType | null => {
    const inputSteps = ['define_audience', 'details'];
    const isFreeFormStep = inputSteps.includes(stepId);
    if (isFreeFormStep) return null;

    const lower = value.toLowerCase().trim();

    const navTriggers = [
      'me mostra', 'me mostre', 'quero ver', 'ver a pagina', 'ver a p',
      'mostra', 'ir para', 'ir pra', 'ver o', 'ver os', 'a página',
      'ver a', 'ir no', 'vai no', 'vai pro', 'vai para',
      'navegar', 'abrir', 'acessar', 'ver mais sobre',
    ];

    const hasNavTrigger = navTriggers.some((trigger) => lower.includes(trigger));

    if (!hasNavTrigger) return null;

    for (const [view, keywords] of Object.entries(NAV_INTENT_MAP)) {
      for (const kw of keywords) {
        if (lower.includes(kw)) {
          return view as ViewType;
        }
      }
    }

    return null;
  };

  // --- Handle option click ---
  const handleOptionClick = async (option: ChatOption) => {
    if (isHandlingInput.current) return;
    isHandlingInput.current = true;

    addUserMessage(option.label);

    // Special values
    if (option.value === 'restart') {
      initializeChat();
      isHandlingInput.current = false;
      return;
    }

    if (option.value === 'SwitchToSupport') {
      handleSwitchMode('support');
      isHandlingInput.current = false;
      return;
    }

    if (option.value === 'SwitchToSales' || option.value === 'Voltar Projeto') {
      handleSwitchMode('sales');
      isHandlingInput.current = false;
      return;
    }

    if (option.value === 'finish') {
      createProjectFromBudget(budgetData);
      const link = generateWhatsAppLink(budgetData);
      window.open(link, '_blank');
      isHandlingInput.current = false;
      return;
    }

    if (option.value === 'direct_message') {
      processStep('direct_message_confirm', budgetData);
      isHandlingInput.current = false;
      return;
    }

    if (option.value === 'send_summary_msg') {
      const estimated = calculateEstimate(budgetData);
      const summaryMsg =
        `Resumo do Orcamento - ${budgetData.name || 'Cliente'}\n\n` +
        `Tipo: ${budgetData.projectType || 'Nao definido'}\n` +
        `Design: ${budgetData.designStatus || 'Nao definido'}\n` +
        `Prazo: ${budgetData.timeline || 'A definir'}\n` +
        `Orcamento: ${budgetData.budgetRange || 'A definir'}\n` +
        `Estimativa: R$ ${estimated.min.toLocaleString('pt-BR')} - R$ ${estimated.max.toLocaleString('pt-BR')}\n\n` +
        `Funcionalidades: ${budgetData.functionalities?.join(', ') || 'Nenhuma'}\n` +
        `Detalhes: ${budgetData.details || 'Nenhum'}`;

      await saveDirectMessage(summaryMsg);
      createProjectFromBudget(budgetData);
      processStep('direct_message_sent', budgetData);
      isHandlingInput.current = false;
      return;
    }

    // Save budget data for option selections
    const currentStep = CHAT_FLOW[currentStepId];
    const newData = { ...budgetData };

    if (currentStep?.key) {
      // @ts-ignore
      newData[currentStep.key] = option.value;
    } else if (currentStepId === 'check_project_type') {
      newData.projectType = option.value;
    }

    setBudgetData(newData);
    saveBudget(newData);

    const nextId = option.nextId || currentStep?.nextId;
    if (nextId) {
      processStep(nextId, newData);
    }

    isHandlingInput.current = false;
  };

  // --- Multi-select ---
  const toggleMultiSelect = (value: string) => {
    setSelectedMultiOptions((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const confirmMultiSelect = () => {
    const selections = selectedMultiOptions.length > 0 ? selectedMultiOptions : ['Basico'];
    const newData = { ...budgetData, functionalities: selections };
    setBudgetData(newData);
    addUserMessage(selections.join(', '));
    saveBudget(newData);
    setSelectedMultiOptions([]);

    const currentStep = CHAT_FLOW[currentStepId];
    if (currentStep?.nextId) {
      processStep(currentStep.nextId, newData);
    }
  };

  // --- Mode switching ---
  const handleSwitchMode = async (targetMode: 'sales' | 'support') => {
    if (chatMode === targetMode) return;
    isHandlingInput.current = true;

    const savedData = { ...budgetData };
    setMessages([]);
    setSelectedMultiOptions([]);
    setCurrentStepId('');
    setChatMode(targetMode);

    await delay(400);
    if (!isMounted.current) {
      isHandlingInput.current = false;
      return;
    }

    if (targetMode === 'support') {
      processStep('support_start', savedData);
    } else {
      if (savedData.name) {
        processStep('welcome_back', savedData);
      } else {
        processStep('start', INITIAL_BUDGET);
      }
    }

    isHandlingInput.current = false;
  };

  // --- Quick replies ---
  const handleQuickReply = (action: string) => {
    if (action === 'orcamento') {
      if (messages.length === 0 || currentStepId === '') {
        initializeChat();
      } else {
        handleSwitchMode('sales');
      }
    }
    if (action === 'mensagem') {
      handleDirectMessageInline();
    }
    if (action === 'duvidas') {
      handleSwitchMode('support');
    }
    if (action === 'blog') {
      onNavigate('blog');
    }
  };

  // --- Quick message (direct to PH) ---
  const handleDirectMessageInline = () => {
    setShowQuickMessage((prev) => !prev);
    if (!showQuickMessage) {
      setTimeout(() => quickMessageRef.current?.focus(), 100);
    }
  };

  const handleQuickMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickMessageText.trim();
    if (!trimmed) return;

    addUserMessage(trimmed);
    setQuickMessageText('');
    setShowQuickMessage(false);

    const email = budgetData.email || localStorage.getItem('chat_email') || '';
    const name = budgetData.name || localStorage.getItem('chat_name') || 'Cliente';
    const msgBody = `Nome: ${name}\nEmail: ${email}\nTipo: ${budgetData.projectType || 'Nao definido'}\n\nMensagem: ${trimmed}`;

    try {
      await saveDirectMessage(msgBody);
      createProjectFromBudget(budgetData);
      addBotMessage('Entendido! Sua mensagem foi enviada. O PH vai te responder em breve. 🙌');
    } catch {
      addBotMessage('Houve um problema ao enviar. Tente novamente ou fale pelo WhatsApp. ⚠️');
    }
  };

  // --- Capture lead automatically to contact_messages ---
  const captureLead = async (name: string, email: string) => {
    try {
      const existing = localStorage.getItem('chat_lead_captured');
      if (existing) return; // Already captured this session
      await api.contact.submit({
        name,
        email,
        subject: `Lead via Chatbot — ${budgetData.projectType || 'Em definicao'}`,
        message: `Lead capturado automaticamente pelo chatbot.\nTipo de projeto: ${budgetData.projectType || 'Nao definido'}\nPrazo: ${budgetData.timeline || 'A definir'}`,
        service_interest: budgetData.projectType || '',
      });
      localStorage.setItem('chat_lead_captured', 'true');
    } catch { /* silent — lead capture is best-effort */ }
  };

  // --- Save direct message to backend ---
  const saveDirectMessage = async (message: string) => {
    await api.chat.sendMessage({
      name: budgetData.name || 'Anonimo',
      email: budgetData.email || '',
      budget_data: budgetData,
      message,
    });
  };

  // --- Create project from budget ---
  const createProjectFromBudget = (_data: BudgetData) => {
    const data = _data || budgetData;
    api.projects
      .create({
        client_name: data.name,
        client_email: data.email || '',
        client_cpf: '',
        title: `Projeto: ${data.projectType || 'Nao definido'}`,
        financial_total: 0,
        financial_paid: 0,
        financial_status: 'pending',
        status: data.projectType ? 'briefing' : 'new',
        progress: 0,
        briefing: {
          projectType: data.projectType,
          designStatus: data.designStatus,
          functionalities: data.functionalities,
          budgetRange: data.budgetRange,
          timeline: data.timeline,
          targetAudience: data.targetAudience,
          details: data.details,
          referenceLinks: data.referenceLinks,
          hasDomain: data.hasDomain,
          designFormat: data.designFormat,
          backendNeeds: data.backendNeeds,
          contactMethod: data.contactMethod,
          businessSummary: '',
          objective: '',
          usp: '',
          competitors: '',
          brandingStatus: '',
          colors: '',
          typographyPreference: '',
          logoStatus: '',
          visualVibe: '',
          sitemap: '',
          copyStatus: '',
          mediaStatus: '',
          referenceSites: data.referenceLinks || '',
          referenceDislikes: '',
          integrations: '',
          hostingStatus: '',
          domainName: '',
          deadline: data.timeline || '',
          notes: data.details || '',
        },
      })
      .catch(() => {
        // project creation is best-effort
      });
  };

  // --- WhatsApp shortcut ---
  const handleWhatsAppShortcut = () => {
    const text = `Ola! Vim pelo chat do site e gostaria de falar diretamente sobre meu projeto.`;
    const url = `https://wa.me/${CONTACT_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // --- Estimate calculation ---
  const calculateEstimate = (data: BudgetData): { min: number; max: number } => {
    let basePrice = 800;

    if (data.projectType) {
      const pkg = SERVICE_PACKAGES.find((p) => p.title === data.projectType);
      if (pkg) {
        const priceStr = pkg.price.replace(/[^0-9]/g, '');
        if (priceStr) basePrice = parseInt(priceStr, 10);
      }
    }

    if (data.functionalities && data.functionalities.length > 0) {
      basePrice += data.functionalities.length * 150;
    }

    if (data.designStatus === 'Nao tenho design') {
      basePrice += 500;
    } else if (data.designStatus === 'Tenho referencias') {
      basePrice += 200;
    }

    if (data.timeline?.toLowerCase().includes('urgente')) {
      basePrice *= 1.25;
    } else if (data.timeline?.toLowerCase().includes('flex')) {
      basePrice *= 0.9;
    }

    return {
      min: Math.round(basePrice * 0.85),
      max: Math.round(basePrice * 1.15),
    };
  };

  // --- Render message text with bold ---
  const renderMessageText = (text: string | React.ReactNode) => {
    if (typeof text !== 'string') return text;
    if (text.includes('**')) {
      const parts = text.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={index} className="font-bold text-gray-900 dark:text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={index}>{part}</span>;
      });
    }
    return text;
  };

  // --- Process info card ---
  const renderProcessInfoCard = () => {
    const stepIcons: Record<number, React.ReactNode> = {
      1: <Globe size={14} className="text-primary-600 dark:text-primary-400" />,
      2: <Layers size={14} className="text-primary-600 dark:text-primary-400" />,
      3: <Zap size={14} className="text-primary-600 dark:text-primary-400" />,
      4: <RocketIcon size={14} className="text-primary-600 dark:text-primary-400" />,
    };

    return (
      <div className="mx-0 md:mx-0 mt-2 w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="bg-primary-50 dark:bg-primary-900/20 p-3 border-b border-primary-100 dark:border-primary-800 flex justify-between items-center">
          <p className="text-xs font-bold text-primary-800 dark:text-primary-300 uppercase tracking-wider">
            Metodologia PH.Dev
          </p>
          <Clock size={12} className="text-primary-600 dark:text-primary-400" />
        </div>
        <div className="p-4 space-y-4">
          {PROCESS_STEPS.map((step, i) => (
            <div key={step.id} className="flex gap-3 relative">
              {i !== PROCESS_STEPS.length - 1 && (
                <div className="absolute top-6 left-3 w-0.5 h-full bg-gray-100 dark:bg-gray-700 -z-0" />
              )}
              <div className="bg-white dark:bg-gray-700 border-2 border-primary-100 dark:border-primary-800 text-primary-600 dark:text-primary-400 font-bold w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 z-10">
                {step.id}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-900 dark:text-white">{step.title}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // --- Derived values ---
  const currentStep = CHAT_FLOW[currentStepId];
  const isInputDisabled = isTyping || currentStep?.type !== 'input';

  const contextualPlaceholder = currentStep?.inputPlaceholder ||
    (chatMode === 'support' ? 'Digite sua duvida...' : 'Digite sua resposta...');

  const currentOptions = messages.length > 0
    ? messages[messages.length - 1].options
    : undefined;

  // --- Blog Recommendations ---
  const renderBlogRecommendations = () => {
    const blogs = [
      { title: 'Como um site rapido aumenta conversoes', icon: <Zap size={14} /> },
      { title: 'Design responsivo: por que importa', icon: <Smartphone size={14} /> },
      { title: 'SEO basico para pequenos negocios', icon: <BarChart3 size={14} /> },
    ];

    return (
      <div className="mt-3 ml-8 space-y-2 w-[85%]">
        <p className="text-[10px] text-gray-400 mb-1">Recomendacoes do Blog:</p>
        {blogs.map((blog, index) => (
          <button
            key={index}
            onClick={() => onNavigate('blog')}
            className="w-full flex items-center gap-2 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 px-3 py-2 rounded-xl transition-all text-left active:scale-[0.98]"
          >
            {blog.icon}
            <span className="truncate flex-1">{blog.title}</span>
            <Eye size={12} className="text-gray-400 shrink-0" />
          </button>
        ))}
      </div>
    );
  };

  // --- Portfolio showcase ---
  const renderPortfolioShowcase = () => {
    const items = [
      { label: '🌐 Landing Pages', view: 'portfolio' },
      { label: '🏢 Sites Institucionais', view: 'portfolio' },
      { label: '⚡ Projetos Sob Medida', view: 'portfolio' },
    ];

    return (
      <div className="mt-3 ml-8 space-y-2 w-[85%]">
        <p className="text-[10px] text-gray-400 mb-1">Veja nossos projetos:</p>
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => onNavigate(item.view as ViewType)}
            className="w-full text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 px-3 py-2 rounded-xl transition-all text-left active:scale-[0.98]"
          >
            {item.label}
          </button>
        ))}
      </div>
    );
  };

  // --- Rocket icon inline (to avoid import conflict with lucide Rocket) ---
  const RocketIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
    <Globe size={size} className={className} />
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // ======================== RENDER ========================

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 md:bottom-8 right-0 md:right-8 z-[100] w-full md:w-[420px] h-[100dvh] md:h-[700px] bg-white dark:bg-gray-900 md:rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden font-sans"
          >
            {/* ====== HEADER ====== */}
            <div
              className={`p-4 flex flex-col gap-3 border-b shrink-0 transition-colors duration-500 ${
                chatMode === 'support'
                  ? 'bg-indigo-900 border-indigo-800'
                  : 'bg-gray-900 border-gray-800'
              }`}
            >
              {/* Title row */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg shadow-inner transition-colors duration-500 ${
                      chatMode === 'support'
                        ? 'bg-indigo-500'
                        : 'bg-primary-600'
                    }`}
                  >
                    {chatMode === 'support' ? (
                      <HelpCircle size={18} className="text-white" />
                    ) : (
                      <Bot size={18} className="text-white" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-display font-bold text-lg text-white tracking-tight leading-none">
                        PH
                        <span
                          className={`transition-colors duration-500 ${
                            chatMode === 'support' ? 'text-indigo-300' : 'text-primary-400'
                          }`}
                        >
                          .bot
                        </span>
                      </span>
                      <Sparkles size={14} className="text-primary-400 dark:text-primary-300" />
                    </div>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <ShieldAlert size={10} className="text-green-500" />
                      <span className="uppercase tracking-wide">
                        {chatMode === 'support' ? 'Suporte Tecnico' : 'Orcamentos'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-1 items-center">
                  <button
                    onClick={handleWhatsAppShortcut}
                    className="text-green-400 hover:text-green-300 hover:bg-white/10 p-2 rounded-full transition-colors"
                    title="Falar no WhatsApp"
                  >
                    <MessageCircle size={18} />
                  </button>
                  <button
                    onClick={initializeChat}
                    className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                    title="Reiniciar conversa"
                  >
                    <RefreshCcw size={16} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                    title="Fechar chat"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Mode toggle */}
              <div className="bg-white/10 p-1 rounded-xl flex gap-1">
                <button
                  onClick={() => handleSwitchMode('sales')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                    chatMode === 'sales'
                      ? 'bg-white text-gray-900 shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Briefcase size={12} />
                  Projetos
                </button>
                <button
                  onClick={() => handleSwitchMode('support')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                    chatMode === 'support'
                      ? 'bg-white text-indigo-900 shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Info size={12} />
                  Duvidas
                </button>
              </div>
            </div>

            {/* ====== MESSAGES AREA ====== */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-[#0B0D12] space-y-3 scroll-smooth relative pb-2">
              {/* Persistent "Falar com PH" inline */}
              <div className="flex items-center justify-center py-1">
                <AnimatePresence mode="wait">
                  {!showQuickMessage ? (
                    <motion.button
                      key="trigger-btn"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={handleDirectMessageInline}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full transition-all active:scale-95 shadow-sm border border-gray-300 dark:border-gray-600"
                    >
                      <MessageSquare size={12} />
                      Falar com PH
                    </motion.button>
                  ) : (
                    <motion.form
                      key="inline-form"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      onSubmit={handleQuickMessageSubmit}
                      className="w-full max-w-[90%] flex items-center gap-1.5"
                    >
                      <textarea
                        ref={quickMessageRef}
                        value={quickMessageText}
                        onChange={(e) => setQuickMessageText(e.target.value)}
                        placeholder="Escreva sua mensagem..."
                        rows={1}
                        className="flex-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none border border-gray-200 dark:border-gray-700"
                      />
                      <button
                        type="submit"
                        disabled={!quickMessageText.trim()}
                        className="p-1.5 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm bg-primary-600 hover:bg-primary-700 shrink-0"
                      >
                        <Send size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowQuickMessage(false);
                          setQuickMessageText('');
                        }}
                        className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg transition-colors shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>

              {/* Message List */}
              <AnimatePresence mode="popLayout">
                {messages.map((msg, index) => {
                  const isLastMsg = index === messages.length - 1;

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 12, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      layout
                      className={`flex flex-col ${msg.isUser ? 'items-end' : 'items-start'}`}
                    >
                      {/* Message Bubble */}
                      {!msg.isUser && msg.type !== 'process-info' && (
                        <div className="flex items-start max-w-[90%]">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold mr-2 mt-1 shrink-0 select-none transition-colors duration-500 ${
                              chatMode === 'support'
                                ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300'
                                : 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                            }`}
                          >
                            AI
                          </div>
                          <div
                            className={`px-4 py-3 text-sm shadow-sm leading-relaxed whitespace-pre-wrap break-words ${
                              msg.isUser
                                ? chatMode === 'support'
                                  ? 'bg-indigo-600 text-white rounded-2xl rounded-br-sm'
                                  : 'bg-primary-600 text-white rounded-2xl rounded-br-sm'
                                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-sm'
                            }`}
                          >
                            {renderMessageText(msg.text)}
                          </div>
                        </div>
                      )}

                      {msg.isUser && (
                        <div className="max-w-[85%]">
                          <div
                            className={`px-4 py-3 text-sm shadow-sm leading-relaxed whitespace-pre-wrap break-words rounded-2xl rounded-br-sm ${
                              chatMode === 'support'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-primary-600 text-white'
                            }`}
                          >
                            {renderMessageText(msg.text)}
                          </div>
                        </div>
                      )}

                      {/* Options */}
                      {!msg.isUser && msg.type === 'options' && msg.options && (
                        <div className="flex flex-wrap gap-2 mt-3 ml-9 max-w-[90%]">
                          {msg.options.map((opt, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleOptionClick(opt)}
                              className={`text-xs font-medium py-2.5 px-4 rounded-xl border shadow-sm transition-all active:scale-95 text-left
                                ${
                                  chatMode === 'support'
                                    ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300 hover:border-indigo-300 dark:hover:border-indigo-700'
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-700 dark:hover:text-primary-300 hover:border-primary-300 dark:hover:border-primary-700'
                                }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Summary buttons */}
                      {!msg.isUser && msg.type === 'summary' && msg.options && (
                        <div className="mt-4 ml-9 flex flex-col gap-2 w-[85%]">
                          {msg.options.map((opt, idx) => {
                            const isFinish = opt.value === 'finish';
                            return (
                              <button
                                key={idx}
                                onClick={() => handleOptionClick(opt)}
                                className={`w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 ${
                                  isFinish
                                    ? 'bg-green-600 text-white shadow-lg shadow-green-200 dark:shadow-green-900/20'
                                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                              >
                                {isFinish && <CheckSquare size={16} />}
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Multi-select */}
                      {!msg.isUser && msg.type === 'multi-select' && msg.options && (
                        <div className="mt-4 ml-9 w-[90%]">
                          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                            {msg.options.map((opt, idx) => {
                              const isSelected = selectedMultiOptions.includes(opt.value);
                              return (
                                <button
                                  key={idx}
                                  onClick={() => toggleMultiSelect(opt.value)}
                                  className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors ${
                                    isSelected
                                      ? 'bg-primary-50 dark:bg-primary-900/20 text-gray-900 dark:text-primary-100'
                                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                  }`}
                                >
                                  <span>{opt.label}</span>
                                  <div
                                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                      isSelected
                                        ? 'bg-primary-600 border-primary-600 text-white'
                                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                                    }`}
                                  >
                                    {isSelected ? <CheckSquare size={12} /> : <Square size={12} />}
                                  </div>
                                </button>
                              );
                            })}
                            <div className="p-3 bg-gray-50 dark:bg-gray-800/80">
                              <button
                                onClick={confirmMultiSelect}
                                className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-2.5 rounded-lg text-sm font-bold hover:bg-black dark:hover:bg-gray-200 transition-colors"
                              >
                                Confirmar Selecao ({selectedMultiOptions.length})
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Process info card */}
                      {!msg.isUser && msg.type === 'process-info' && renderProcessInfoCard()}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Typing indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 ml-9 bg-gray-200 dark:bg-gray-800 w-fit px-4 py-2.5 rounded-2xl rounded-bl-sm"
                  >
                    <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.15s' }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.3s' }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* ====== QUICK REPLIES BAR ====== */}
            <div className="px-3 py-2 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0">
              <div className="flex gap-1.5 justify-center flex-wrap">
                <button
                  onClick={() => handleQuickReply('orcamento')}
                  className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full transition-all active:scale-95 border border-gray-200 dark:border-gray-700 flex items-center gap-1"
                >
                  <FileText size={12} />
                  Orcamento
                </button>
                <button
                  onClick={() => handleQuickReply('mensagem')}
                  className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full transition-all active:scale-95 border border-gray-200 dark:border-gray-700 flex items-center gap-1"
                >
                  <MessageSquare size={12} />
                  Mensagem
                </button>
                <button
                  onClick={() => handleQuickReply('duvidas')}
                  className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full transition-all active:scale-95 border border-gray-200 dark:border-gray-700 flex items-center gap-1"
                >
                  Duvidas
                </button>
                <button
                  onClick={() => handleQuickReply('blog')}
                  className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full transition-all active:scale-95 border border-gray-200 dark:border-gray-700 flex items-center gap-1"
                >
                  <ArrowUpRight size={12} />
                  Blog
                </button>
              </div>
            </div>

            {/* ====== INPUT AREA ====== */}
            <form
              onSubmit={handleInputSubmit}
              className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0"
            >
              <div className="relative flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={contextualPlaceholder}
                  disabled={isInputDisabled}
                  className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={isInputDisabled || (!inputValue.trim() && !currentStep?.allowSkip)}
                  className={`absolute right-2 p-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm ${
                    chatMode === 'support'
                      ? 'bg-indigo-600 hover:bg-indigo-700'
                      : 'bg-primary-600 hover:bg-primary-700'
                  }`}
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====== FLOATING TRIGGER ====== */}
      {!isOpen && (
        <div
          className={`fixed right-4 md:right-8 z-[90] transition-all duration-300 ${
            shouldElevate ? 'bottom-24' : 'bottom-8'
          }`}
        >
          <AnimatePresence>
            {showProactive && (
              <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.85 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
                className="absolute bottom-full mb-3 right-0 bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-br-sm shadow-xl border border-gray-100 dark:border-gray-700 max-w-[240px] origin-bottom-right"
              >
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {proactiveMessage}
                </p>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-white dark:bg-gray-800 translate-x-1 translate-y-1 rotate-45 border-r border-b border-gray-100 dark:border-gray-700" />
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full text-white shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50 hover:-translate-y-1 transition-all duration-300 active:scale-95"
          >
            <MessageCircle size={30} className="relative z-10" fill="currentColor" />

            {/* Unread badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-white dark:border-gray-900 animate-pulse z-20">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}

            {/* Online indicator */}
            <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 z-10">
              <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-white dark:border-gray-900" />
            </span>
          </button>
        </div>
      )}
    </>
  );
};
