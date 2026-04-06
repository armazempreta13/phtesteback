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
import {
  CHAT_FLOW, INITIAL_BUDGET, generateWhatsAppLink,
  validateInput, detectIntent, QUICK_ANSWERS, getWhatsAppResponse,
  ConversationMemory, initialMemory, updateMemory,
} from '../chatbotFlow';
import { api } from '../lib/api';
import { useMobile } from '../hooks/useMobile';

// ============================================================
// CONSTANTS
// ============================================================
const CHAT_TRIGGERS_BEFORE = [
  "Posso ajudar no seu projeto? 👋",
  "Vamos criar algo incr\u00edvel hoje? \ud83d\ude80",
  "D\u00favidas sobre os pacotes? \ud83e\udd14",
  "Fa\u00e7a um or\u00e7amento sem compromisso! \ud83d\udcb0",
  "Transforme sua ideia em site \ud83c\udf10",
  "Sites r\u00e1pidos e modernos aqui \u26a1",
  "Me chama para conversar! \ud83d\udcac",
  "Qual seu pr\u00f3ximo desafio? \ud83c\udfc6",
];

const CHAT_TRIGGERS_RETURN = [
  "Seu or\u00e7amento est\u00e1 te esperando! \ud83d\udc40",
  "Ainda tem interesse no projeto? \ud83d\udcad",
  "Volte quando quiser, estou aqui! \u2728",
];

// ============================================================
// COMPONENT
// ============================================================
export const Chatbot: React.FC<ChatbotProps> = ({ isOpen, setIsOpen, onNavigate, contextService, extraElevation, initialMode }) => {
  // State
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
  const [totalSteps, setTotalSteps] = useState(0); // for progress indicator
  const [answeredSteps, setAnsweredSteps] = useState(0);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const quickMessageRef = useRef<HTMLTextAreaElement>(null);
  const isMounted = useRef(true);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isHandlingInput = useRef(false);
  const isComponentOpen = useRef(false);
  const conversationMemoryRef = useRef<ConversationMemory>(initialMemory());
  const pendingIntentRef = useRef<{ intent: string; stepId: string; value: string } | null>(null);
  const leadIdRef = useRef<string | null>(null);

  const isMobile = useMobile();
  const shouldElevate = !!extraElevation;

  // --- Mount/Unmount ---
  useEffect(() => { isMounted.current = true; return () => { isMounted.current = false; if (pollingRef.current) clearInterval(pollingRef.current); }; }, []);

  useEffect(() => { isComponentOpen.current = isOpen; }, [isOpen]);

  useEffect(() => { if (isOpen) setUnreadCount(0); }, [isOpen]);

  // --- Scroll ---
  const scrollToBottom = useCallback(() => {
    setTimeout(() => { if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, 100);
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isTyping, scrollToBottom]);

  // --- Proactive ---
  useEffect(() => {
    if (isOpen) { setShowProactive(false); return; }
    const savedName = localStorage.getItem('chat_name');
    const savedType = localStorage.getItem('chat_project_type');
    let triggerIdx = 0;

    const showRandom = () => {
      if (!isMounted.current) return;
      const pool = savedName && savedType
        ? [...CHAT_TRIGGERS_RETURN, `${savedName}, seu or\u00e7amento de ${savedType} est\u00e1 te esperando! \ud83d\udc40`]
        : CHAT_TRIGGERS_BEFORE;
      setProactiveMessage(pool[triggerIdx % pool.length]);
      setShowProactive(true);
      triggerIdx++;

      const hideId = setTimeout(() => {
        if (!isMounted.current) return;
        setShowProactive(false);
        const d = Math.random() * 12000 + 8000;
        const showId = setTimeout(showRandom, d);
        return () => clearTimeout(showId);
      }, 5000);
      return () => clearTimeout(hideId);
    };

    const showId = setTimeout(showRandom, 3000);
    return () => clearTimeout(showId);
  }, [isOpen]);

  // --- Polling for admin replies (works with name + email, or just name) ---
  useEffect(() => {
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
    const runCheck = async () => {
      const email = budgetData.email || localStorage.getItem('chat_email');
      const name = budgetData.name || localStorage.getItem('chat_name');
      if (name || email) await checkAdminReplies(email, name);
    };
    if (budgetData.name || localStorage.getItem('chat_name')) { runCheck(); pollingRef.current = setInterval(runCheck, 10000); }
    return () => { if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budgetData.name, budgetData.email]);

  // --- LocalStorage helpers ---
  const getSavedBudget = (): Partial<BudgetData> => {
    try { const s = localStorage.getItem('chat_budget'); return s ? JSON.parse(s) : {}; } catch { return {}; }
  };
  const saveBudget = (data: BudgetData) => {
    try {
      localStorage.setItem('chat_budget', JSON.stringify({ name: data.name, email: data.email, projectType: data.projectType, designStatus: data.designStatus, budgetRange: data.budgetRange, timeline: data.timeline, details: data.details, functionalities: data.functionalities, targetAudience: data.targetAudience }));
      if (data.name) localStorage.setItem('chat_name', data.name);
      if (data.email) localStorage.setItem('chat_email', data.email);
      if (data.projectType) localStorage.setItem('chat_project_type', data.projectType);
    } catch { /* silent */ }
  };

  // --- Admin replies ---
  const checkAdminReplies = async (email: string | null) => {
    try {
      const checkEmail = email || localStorage.getItem('chat_email');
      if (!checkEmail) return;
      const res = await fetch(`/api/chat/messages?email=${encodeURIComponent(checkEmail)}`);
      if (!res.ok) return;
      const data = await res.json();
      const repliedMessages = (data.messages || []).filter((m: any) => m.status === 'replied' && m.admin_reply);
      if (!repliedMessages.length) { setUnreadCount(0); return; }
      const lastSeenId = localStorage.getItem('chat_seen_reply_id');
      const lastReply = repliedMessages[0];
      if (String(lastReply.id) !== lastSeenId) {
        const newCount = repliedMessages.filter((m: any) => String(m.id) !== lastSeenId).length;
        if (lastSeenId !== null && isComponentOpen.current) {
          addBotMessage(`O PH respondeu sua mensagem! \ud83d\udce9\n\n"${lastReply.admin_reply}"`, 'text');
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

  // ============================================================
  // LEAD CAPTURE — silent, robust, best-effort
  // ============================================================
  const captureLeadInitial = async (name: string) => {
    try {
      const alreadyLead = localStorage.getItem('chat_lead_id');
      await api.contact.submit({
        name,
        email: '',
        subject: `Lead Chatbot — ${name}`,
        message: `Lead inicial: ${name} iniciou um or\u00e7amento.\nOrigem: chatbot\nStatus: iniciou_briefing`,
        service_interest: 'chatbot_lead',
      });
      // store a simple ID for dedup
      localStorage.setItem('chat_lead_id', Date.now().toString());
    } catch { /* silent */ }
  };

  const captureLeadComplete = async (data?: BudgetData) => {
    const d = data || budgetData;
    try {
      const estimate = calculateEstimate(d);
      const briefingJson = JSON.stringify({
        name: d.name,
        email: d.email,
        projectType: d.projectType,
        designStatus: d.designStatus,
        functionalities: d.functionalities,
        timeline: d.timeline,
        targetAudience: d.targetAudience,
        details: d.details,
        budgetRange: d.budgetRange,
        hasDomain: d.hasDomain,
      });
      await api.contact.submit({
        name: d.name || 'An\u00f4nimo',
        email: d.email || '',
        subject: `Lead Chatbot Completo — ${d.name} — ${d.projectType || 'Em def.'}`,
        message: `OR\u00c7AMENTO COMPLETO\n${'─'.repeat(30)}\n${briefingJson}\n\nEstimativa: R$ ${estimate.min.toLocaleString('pt-BR')} — R$ ${estimate.max.toLocaleString('pt-BR')}\n\nOrigem: chatbot\nStatus: briefing_completo`,
        service_interest: d.projectType || 'Indefinido',
      });
    } catch { /* silent */ }
  };

  // ============================================================
  // ESTIMATE (local copy — mirrors chatbotFlow)
  // ============================================================
  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const calculateEstimate = (data: BudgetData): { min: number; max: number } => {
    let base = 800;
    if (data.projectType) {
      const pkg = SERVICE_PACKAGES.find(p => p.title === data.projectType);
      if (pkg) { const s = pkg.price.replace(/[^0-9]/g, ''); if (s) base = parseInt(s, 10); }
    }
    if (data.functionalities?.length) base += data.functionalities.length * 150;
    if (data.designStatus?.toLowerCase().includes('nao tenho') || data.designStatus?.toLowerCase().includes('preciso criar')) base += 500;
    else if (data.designStatus?.toLowerCase().includes('refer')) base += 200;
    if (data.timeline?.toLowerCase().includes('urgente')) base *= 1.25;
    else if (data.timeline?.toLowerCase().includes('flex')) base *= 0.9;
    return { min: Math.round(base * 0.85), max: Math.round(base * 1.15) };
  };

  // ============================================================
  // Initialize chat
  // ============================================================
  const initializeChat = () => {
    setMessages([]); setSelectedMultiOptions([]); setQuickMessageText(''); setShowQuickMessage(false); isHandlingInput.current = false;

    if (initialMode === 'support') { setChatMode('support'); processStep('support_start', { ...INITIAL_BUDGET }); return; }

    setChatMode('sales');

    if (contextService) {
      setBudgetData(prev => ({ ...prev, projectType: contextService.title }));
      processStep('start_context', { ...INITIAL_BUDGET, projectType: contextService.title });
      return;
    }

    const saved = getSavedBudget();
    if (saved.name && saved.projectType && !saved.email) {
      // Abandonou no meio — recovery
      setChatMode('sales');
      setBudgetData({ ...INITIAL_BUDGET, ...saved });
      conversationMemoryRef.current = initialMemory();
      processStep('recovery_middle', { ...INITIAL_BUDGET, ...saved });
      return;
    }
    if (saved.name && !saved.projectType) {
      // Deu nome mas nao escolheu projeto
      setChatMode('sales');
      setBudgetData({ ...INITIAL_BUDGET, ...saved });
      conversationMemoryRef.current = initialMemory();
      processStep('recovery_stuck', { ...INITIAL_BUDGET, ...saved });
      return;
    }
    if (saved.name && saved.projectType && saved.email) {
      // Ja completou antes — welcome back
      setBudgetData({ ...INITIAL_BUDGET, ...saved });
      processStep('welcome_back', { ...INITIAL_BUDGET, ...saved });
      return;
    }

    processStep('start', INITIAL_BUDGET);
  };

  useEffect(() => { if (isOpen && messages.length === 0 && currentStepId === '') initializeChat(); /* eslint-disable */ }, [isOpen]);

  // ============================================================
  // Message helpers
  // ============================================================
  const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

  const addBotMessage = (text: string | React.ReactNode, type: any = 'text', options?: ChatOption[]) => {
    setMessages(prev => [...prev, { id: `bot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, text, isUser: false, type, options }]);
  };

  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, { id: `user-${Date.now()}`, text, isUser: true }]);
  };

  // ============================================================
  // Process step from CHAT_FLOW
  // ============================================================
  const processStep = async (stepId: string, currentData: BudgetData) => {
    const step = CHAT_FLOW[stepId];
    if (!step) return;

    setCurrentStepId(stepId);

    // Auto-skip
    if (stepId === 'check_project_type' && currentData.projectType) { processStep('design_status', currentData); return; }

    // Support: check project status
    if (stepId === 'support_check_project' && currentData.email) {
      setIsTyping(true); await delay(800);
      if (!isMounted.current) return; setIsTyping(false);
      try {
        const res = await api.projects.getAll();
        const allProjects = res.data?.projects || [];
        const userProjects = allProjects.filter((p: any) => p.client_email?.toLowerCase() === currentData.email?.toLowerCase());
        if (userProjects.length > 0) {
          const p = userProjects[0];
          const labels: Record<string, string> = { new: 'Novo Lead', briefing: 'Em Briefing', development: 'Em Desenvolvimento', review: 'Em Revisao', completed: 'Concluido' };
          addBotMessage(`Encontrei seu projeto! \ud83c\udf89\n\n\ud83d\udce6 ${p.title}\n\ud83d\udcca Status: ${labels[p.status] || p.status}\n\ud83d\udcc8 Progresso: ${p.progress}%\n\ud83d\udc50 Entrega: ${p.deadline ? new Date(p.deadline).toLocaleDateString('pt-BR') : 'A definir'}\n\nQualquer duvida, e so perguntar! \ud83d\ude0a`);
        } else {
          addBotMessage(`Nao encontrei projetos com esse email. \ud83d\ude15\n\nQuer fazer um orcamento? Comece me dizendo seu nome!`, 'text', [{ label: '\ud83d\ude80 Quero orcamento!', value: 'start_budget', nextId: 'start' }]);
        }
      } catch { addBotMessage('Nao consegui buscar os projetos no momento. Tente novamente!'); }
      return;
    }

    setIsTyping(true);
    // Variable typing delay based on message length (more natural)
    const msgText = typeof step.message === 'function' ? step.message(currentData) : step.message;
    const typingDelay = Math.min(1200, Math.max(500, (typeof msgText === 'string' ? msgText.length : 50) * 3));
    await delay(typingDelay);
    if (!isMounted.current) return;
    setIsTyping(false);

    let options = step.options;
    if (step.dynamicOptions) options = step.dynamicOptions(currentData);

    // Apply message variant based on user profile
    const variantMsg = getMessageVariant(msgText, conversationMemoryRef.current);
    addBotMessage(variantMsg, step.type, options);

    // Update progress
    if (stepId.startsWith('recovery_')) { setAnsweredSteps(0); setTotalSteps(0); }
    else {
      const allSteps = Object.keys(CHAT_FLOW).filter(k => !k.startsWith('support_') && !k.startsWith('direct_') && k !== 'show_summary' && k !== 'review_menu' && k !== 'finalize');
      const mainFlowSteps = ['start', 'check_project_type', 'design_status', 'design_note', 'transition_func', 'ack_funcs', 'timeline', 'urgency_note', 'transition_email', 'details', 'ask_email'];
      setTotalSteps(mainFlowSteps.length);
    }

    // Focus input
    if (step.type === 'input') {
      const val = currentData[step.key as keyof BudgetData];
      setInputValue(typeof val === 'string' && val ? val : '');
      setTimeout(() => inputRef.current?.focus(), 100);
    } else { setInputValue(''); }
  };

  // ============================================================
  // HANDLE INTENT — smart interpretation layer
  // ============================================================
  const handleIntent = (input: string, stepId: string): { handled: boolean; shouldAdvance: boolean } => {
    const intent = detectIntent(input);

    // Quick answers for questions (return to current step after)
    const quickAnswer = getWhatsAppResponse(intent.type);
    if (quickAnswer) {
      addBotMessage(quickAnswer, 'text');
      if (intent.type === 'off_topic' || intent.type === 'hesitation') {
        pendingIntentRef.current = { intent: intent.type, stepId, value: input };
        return { handled: true, shouldAdvance: false };
      }
      return { handled: true, shouldAdvance: false };
    }

    // Hesitation — offer help without advancing
    if (intent.type === 'hesitation') {
      conversationMemoryRef.current.hesitations++;
      return { handled: true, shouldAdvance: false };
    }

    // Correction — user wants to go back
    if (intent.type === 'correction') {
      conversationMemoryRef.current.corrections++;
      if (stepId === 'details' || stepId === 'ask_email' || stepId === 'transition_email') {
        addBotMessage('Sem problema! Pode mudar o que quiser. O que prefere?', 'text');
      } else {
        processStep('review_menu', budgetData);
      }
      return { handled: true, shouldAdvance: false };
    }

    // Short answer — confirm
    if (intent.type === 'answer_short') {
      const currentStep = CHAT_FLOW[stepId];
      if (currentStep?.options?.length) {
        addUserMessage('\u2705 Sim!');
        processStep(currentStep.options[0].nextId || currentStep.nextId || '', budgetData);
        return { handled: true, shouldAdvance: false };
      }
      // Otherwise treat as valid answer (skip ahead)
      return { handled: false, shouldAdvance: true };
    }

    // Negation
    if (intent.type === 'negation') {
      if (stepId === 'functionnalities' || stepId === 'transition_func') { addUserMessage('Nenhum por enquanto'); processStep('ack_funcs', { ...budgetData, functionalities: [] }); return { handled: true, shouldAdvance: false }; }
      if (stepId === 'design_status') { addUserMessage('Prefiro nao decidir agora'); processStep('design_status', budgetData); return { handled: true, shouldAdvance: false }; }
      // General negation — keep asking
      addUserMessage(input);
      addBotMessage('Entendi. Sem problema, seguimos assim entao!', 'text');
      const currentStep = CHAT_FLOW[stepId];
      if (currentStep?.nextId) { setTimeout(() => processStep(currentStep.nextId!, budgetData), 500); }
      return { handled: true, shouldAdvance: false };
    }

    return { handled: false, shouldAdvance: true };
  };

  // ============================================================
  // HANDLE INPUT
  // ============================================================
  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isHandlingInput.current) return;

    const stepConfig = CHAT_FLOW[currentStepId];
    const trimmedValue = inputValue.trim();
    if (!trimmedValue && !stepConfig?.allowSkip) return;

    isHandlingInput.current = true;
    setInputValue('');

    // ---- Special steps ----
    if (currentStepId === 'direct_message_custom' && trimmedValue) {
      addUserMessage(trimmedValue);
      await saveDirectMessage(trimmedValue);
      createProjectFromBudget(budgetData);
      processStep('direct_message_sent', budgetData);
      isHandlingInput.current = false;
      return;
    }

    // ---- Support mode ----
    if (chatMode === 'support') {
      addUserMessage(trimmedValue);
      sendSupportResponse(trimmedValue);
      isHandlingInput.current = false;
      return;
    }

    // ---- Check navigation intents ----
    const intent = detectIntent(trimmedValue);
    if (intent.type === 'navigation') {
      addUserMessage(trimmedValue);
      handleSwitchMode('sales');
      const navView = detectNavView(trimmedValue);
      if (navView) onNavigate(navView);
      isHandlingInput.current = false;
      return;
    }

    // ---- Validation ----
    if (stepConfig?.key) {
      const validation = validateInput(currentStepId, trimmedValue);
      if (!validation.accepted && validation.feedback) {
        addUserMessage(trimmedValue);
        addBotMessage(validation.feedback, 'text');
        setInputValue('');
        setTimeout(() => inputRef.current?.focus(), 200);
        isHandlingInput.current = false;
        return;
      }
      // Use cleaned value if provided
      const finalValue = validation.cleaned || trimmedValue;
      addUserMessage(finalValue);
      conversationMemoryRef.current = updateMemory(conversationMemoryRef.current, finalValue);

      // Smart intent mid-flow (questions during input steps)
      const qAnswer = getWhatsAppResponse(intent.type);
      if (qAnswer && intent.confidence === 'high') {
        addBotMessage(qAnswer, 'text');
      }

      // Save data
      const newData = { ...budgetData };
      // @ts-ignore dynamic key
      newData[stepConfig.key] = finalValue;
      setBudgetData(newData);
      saveBudget(newData);

      // Lead capture: initial (name only)
      if (stepConfig.key === 'name') {
        captureLeadInitial(finalValue);
      }
      // Lead capture: complete (email step) — use newData instead of stale budgetData
      if (stepConfig.key === 'email' && budgetData.name) {
        captureLeadCompleteWithData(newData);
      }

      // Advance
      if (stepConfig.nextId) {
        setAnsweredSteps(prev => prev + 1);
        processStep(stepConfig.nextId, newData);
      }
      isHandlingInput.current = false;
      return;
    }

    // No key (shouldn't happen for input, but handle gracefully)
    addUserMessage(trimmedValue);
    conversationMemoryRef.current = updateMemory(conversationMemoryRef.current, trimmedValue);
    if (stepConfig?.nextId) {
      setAnsweredSteps(prev => prev + 1);
      processStep(stepConfig.nextId, budgetData);
    }
    isHandlingInput.current = false;
  };

  // Navigation view detection
  const detectNavView = (input: string): ViewType | null => {
    const lower = input.toLowerCase().trim();
    if (/portfolio|projetos|trabalhos/.test(lower)) return 'portfolio';
    if (/blog|artigo|post/.test(lower)) return 'blog';
    if (/servico|servicos|pacotes|precos/.test(lower)) return 'services';
    if (/contato|whatsapp|zap/.test(lower)) return 'contact';
    if (/sobre|quem e/.test(lower)) return 'about';
    if (/processo|como funciona/.test(lower)) return 'process';
    if (/faq|duvidas/.test(lower)) return 'faq';
    return null;
  };

  // ============================================================
  // OPTION CLICK
  // ============================================================
  const handleOptionClick = async (option: ChatOption) => {
    if (isHandlingInput.current) return;
    isHandlingInput.current = true;

    addUserMessage(option.label);

    if (option.value === 'restart') { initializeChat(); isHandlingInput.current = false; return; }
    if (option.value === 'SwitchToSupport') { handleSwitchMode('support'); isHandlingInput.current = false; return; }
    if (option.value === 'SwitchToSales' || option.value === 'Voltar Projeto') { handleSwitchMode('sales'); isHandlingInput.current = false; return; }

    if (option.value === 'finish') {
      captureLeadComplete();
      createProjectFromBudget(budgetData);
      const link = generateWhatsAppLink(budgetData);
      window.open(link, '_blank');
      isHandlingInput.current = false;
      return;
    }

    if (option.value === 'direct_message') { processStep('direct_message_confirm', budgetData); isHandlingInput.current = false; return; }

    if (option.value === 'send_summary_msg') {
      const est = calculateEstimate(budgetData);
      const msg = `Resumo — ${budgetData.name || 'Cliente'}\n\nTipo: ${budgetData.projectType || 'N/A'}\nDesign: ${budgetData.designStatus || 'N/A'}\nPrazo: ${budgetData.timeline || 'A definir'}\nEstimativa: R$ ${est.min.toLocaleString('pt-BR')} — R$ ${est.max.toLocaleString('pt-BR')}\nFuncionalidades: ${budgetData.functionalities?.join(', ') || 'Nenhuma'}\nDetalhes: ${budgetData.details || 'Nenhum'}`;
      await saveDirectMessage(msg);
      createProjectFromBudget(budgetData);
      processStep('direct_message_sent', budgetData);
      isHandlingInput.current = false;
      return;
    }

    // Normal option — save data and advance
    const currentStep = CHAT_FLOW[currentStepId];
    const newData = { ...budgetData };
    if (currentStep?.key) {
      // @ts-expect-error dynamic key
      newData[currentStep.key] = option.value;
    } else if (currentStepId === 'check_project_type') {
      newData.projectType = option.value;
    }
    setBudgetData(newData);
    saveBudget(newData);

    conversationMemoryRef.current = updateMemory(conversationMemoryRef.current, option.label);
    setAnsweredSteps(prev => prev + 1);

    const nextId = option.nextId || currentStep?.nextId;
    if (nextId) processStep(nextId, newData);

    isHandlingInput.current = false;
  };

  // ============================================================
  // MULTI-SELECT
  // ============================================================
  const toggleMultiSelect = (value: string) => setSelectedMultiOptions(prev => prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]);

  const confirmMultiSelect = () => {
    const selections = selectedMultiOptions.length > 0 ? selectedMultiOptions : ['Basico'];
    const newData = { ...budgetData, functionalities: selections };
    setBudgetData(newData);
    addUserMessage(selections.join(', '));
    saveBudget(newData);
    setSelectedMultiOptions([]);
    conversationMemoryRef.current = updateMemory(conversationMemoryRef.current, selections.join(', '));
    setAnsweredSteps(prev => prev + 1);
    const currentStep = CHAT_FLOW[currentStepId];
    if (currentStep?.nextId) processStep(currentStep.nextId, newData);
  };

  // ============================================================
  // MODE SWITCHING
  // ============================================================
  const handleSwitchMode = async (targetMode: 'sales' | 'support') => {
    if (chatMode === targetMode) return;
    isHandlingInput.current = true;
    const savedData = { ...budgetData };
    setMessages([]); setSelectedMultiOptions([]); setCurrentStepId(''); setChatMode(targetMode);
    await delay(400);
    if (!isMounted.current) { isHandlingInput.current = false; return; }
    if (targetMode === 'support') processStep('support_start', savedData);
    else { if (savedData.name) processStep('welcome_back', savedData); else processStep('start', INITIAL_BUDGET); }
    isHandlingInput.current = false;
  };

  // ============================================================
  // QUICK REPLIES
  // ============================================================
  const handleQuickReply = (action: string) => {
    if (action === 'orcamento') { if (!messages.length || !currentStepId) initializeChat(); else handleSwitchMode('sales'); }
    if (action === 'mensagem') handleDirectMessageInline();
    if (action === 'duvidas') handleSwitchMode('support');
    if (action === 'blog') onNavigate('blog');
  };

  // ============================================================
  // DIRECT MESSAGE INLINE
  // ============================================================
  const handleDirectMessageInline = () => { setShowQuickMessage(prev => !prev); if (!showQuickMessage) setTimeout(() => quickMessageRef.current?.focus(), 100); };

  const handleQuickMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickMessageText.trim();
    if (!trimmed) return;
    addUserMessage(trimmed);
    setQuickMessageText('');
    setShowQuickMessage(false);
    const email = budgetData.email || localStorage.getItem('chat_email') || '';
    const name = budgetData.name || localStorage.getItem('chat_name') || 'Cliente';
    const msgBody = `Nome: ${name}\nEmail: ${email}\nTipo: ${budgetData.projectType || 'N/A'}\n\nMensagem: ${trimmed}`;
    try { await saveDirectMessage(msgBody); createProjectFromBudget(budgetData); addBotMessage('Entendido! Sua mensagem foi enviada. O PH vai responder em breve. \ud83d\ude4c'); } catch { addBotMessage('Houve um problema. Tente novamente ou fale pelo WhatsApp. \u26a0\ufe0f'); }
  };

  // ============================================================
  // SAVE DIRECT MESSAGE / CREATE PROJECT
  // ============================================================
  const saveDirectMessage = async (message: string) => {
    await api.chat.sendMessage({ name: budgetData.name || 'An\u00f4nimo', email: budgetData.email || '', budget_data: budgetData, message });
  };

  const createProjectFromBudget = (_data: BudgetData) => {
    const data = _data || budgetData;
    api.projects.create({
      client_name: data.name, client_email: data.email || '', client_cpf: '',
      title: `Projeto: ${data.projectType || 'N/A'}`, financial_total: 0, financial_paid: 0, financial_status: 'pending',
      status: data.projectType ? 'briefing' : 'new', progress: 0,
      briefing: { projectType: data.projectType, designStatus: data.designStatus, functionalities: data.functionalities, budgetRange: data.budgetRange, timeline: data.timeline, targetAudience: data.targetAudience, details: data.details, referenceLinks: data.referenceLinks, hasDomain: data.hasDomain, designFormat: data.designFormat, backendNeeds: data.backendNeeds, contactMethod: data.contactMethod, businessSummary: '', objective: '', usp: '', competitors: '', brandingStatus: '', colors: '', typographyPreference: '', logoStatus: '', visualVibe: '', sitemap: '', copyStatus: '', mediaStatus: '', referenceSites: data.referenceLinks || '', referenceDislikes: '', integrations: '', hostingStatus: '', domainName: '', deadline: data.timeline || '', notes: data.details || '' },
    }).catch(() => {});
  };

  // ============================================================
  // KEYWORD-BASED SUPPORT
  // ============================================================
  const KEYWORD_RESPONSES: Record<string, { kw: string[]; response: string }>[] = [
    { kw: ['pre\u00e7o', 'preco', 'valor', 'quanto custa', 'orcamento', 'or\u00e7amento', 'pago'], response: `**Nossos Pacotes:**\n\n\ud83d\ude80 Landing Page Express — a partir de R$ 900\n\ud83c\udfe2 Site Profissional — a partir de R$ 2.000\n\ud83d\udee0\ufe0f Sistema Web — sob consulta\n\nTodos incluem design responsivo, ot\u00edmiza\u00e7\u00e3o SEO e suporte inicial. Quer fazer um or\u00e7amento?` },
    { kw: ['prazo', 'tempo', 'demora', 'quando fica pronto', 'entrega'], response: `**Prazos Estimados:**\n\n\ud83d\ude80 Landing Page — 5 a 10 dias\n\ud83c\udfe2 Site Institucional — 15 a 30 dias\n\ud83d\udd27 Urgente — metade do prazo\n\nQuer um or\u00e7amento personalizado?` },
    { kw: ['tecnologia', 'stack', 'framework', 'ferramenta', 'linguagem', 'react', 'next'], response: `**Tecnologias:**\n\n\ud83c\udf10 React.js / Next.js\n\ud83c\udfa8 Tailwind CSS\n\u26a1 TypeScript\n\ud83d\udce6 Vite\n\ud83d\ude80 Vercel\n\nSites at\u00e9 **10x mais r\u00e1pidos** que WordPress.` },
    { kw: ['pagamento', 'pagar', 'pix', 'parcela', 'desconto'], response: `**Formas de Pagamento:**\n\n\ud83d\udcb3 Cart\u00e3o (at\u00e9 12x)\n\ud83d\udcf1 PIX (5% desc.)\n\ud83d\udcb0 Transfer\u00eancia\n\n50% entrada + 50% entrega.` },
    { kw: ['contato', 'whatsapp', 'falar', 'ligar', 'email', 'telefone', 'zap'], response: `**Fale com o PH:**\n\n\ud83d\udcf1 WhatsApp: (61) 99358-8455\n\ud83d\udce7 Email: contato@phstatic.com.br\n\nWhatsApp e o mais r\u00e1pido! \ud83d\ude0a` },
    { kw: ['portfolio', 'projetos', 'trabalhos', 'case', 'exemplo'], response: `**Confira nossos projetos!** \ud83c\udf89\n\nDiga **\"quero ver o portfolio\"** e eu te levo l\u00e1!` },
    { kw: ['processo', 'como funciona', 'etapas', 'm\u00e9todo', 'metodo'], response: `**Nosso Processo:**\n\n1\u20e3 **Briefing** — Entendemos suas necessidades\n2\u20e3 **Design** — Criamos e aprovamos\n3\u20e3 **Devsenvolvimento** — Codificamos\n4\u20e3 **Lan\u00e7amento** — Publicamos\n\nQuer come\u00e7ar?` },
    { kw: ['blog', 'artigo', 'post', 'conte\u00fado', 'conteudo', 'dica'], response: `\ud83d\udcdd Diga **\"quero ver o blog\"** para acessar nosso conte\u00fado!` },
    { kw: ['suporte', 'ajuda', 'manuten\u00e7\u00e3o', 'manutencao'], response: `**Suporte e Manuten\u00e7\u00e3o:**\n\nSuporte inicial gratuito incluido.\n\nManuten\u00e7\u00e3o mensal a partir de R$ 99.\n\nQuer detalhes? Fale com o PH!` },
  ];

  const sendSupportResponse = (userMessage: string) => {
    const lower = userMessage.toLowerCase().trim();
    for (const item of KEYWORD_RESPONSES) {
      if (item.kw.some(kw => lower.includes(kw))) { addBotMessage(item.response, 'text'); return; }
    }
    addBotMessage(`Entendi sua duvida! Para te dar a melhor resposta, recomendo falar direto com o PH.\n\nClique em "Mensagem" abaixo ou v\u00e1 para o WhatsApp. \ud83d\ude0a`, 'text');
  };

  // ============================================================
  // WHATSAPP SHORTCUT
  // ============================================================
  const handleWhatsAppShortcut = () => {
    const text = `Ola! Vim pelo chat do site e gostaria de falar sobre meu projeto.`;
    window.open(`https://wa.me/${CONTACT_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // ============================================================
  // RENDER HELPERS
  // ============================================================
  const renderMessageText = (text: string | React.ReactNode) => {
    if (typeof text !== 'string') return text;
    if (text.includes('**')) {
      const parts = text.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="font-bold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
        return <span key={i}>{part}</span>;
      });
    }
    return text;
  };

  const RocketIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => <Globe size={size} className={className} />;

  // ============================================================
  // MESSAGE VARIANTS — adapt based on user profile
  // ============================================================
  const getMessageVariant = (baseMsg: string, memory?: ConversationMemory): string => {
    if (!memory) return baseMsg;
    const { seemsRushing, seemsUnsure, seemsTechnical } = memory.detectedProfile;

    // User is rushing — add calming detail
    if (seemsRushing) {
      if (baseMsg.includes('So mais') || baseMsg.includes('perguntas rapidas')) {
        return baseMsg + ' Sem pressa, va no seu ritmo. 🧘';
      }
    }

    // User seems unsure — add reassurance
    if (seemsUnsure) {
      if (baseMsg.includes('estimativa') || baseMsg.includes('orcamento ficou assim')) {
        return baseMsg.replace(`Can enviar esse pro PH?`, `Sem compromisso! Posso enviar pro PH ou voce pode ajustar. O que prefere?`);
      }
      if (baseMsg.includes('funcionar de verdade')) {
        return `Vamos escolher juntos — nao se preocupe, pode selecionar poucos ou nenhum. Sem errar aqui. 😊\n\nSelecione o que fizer sentido:`;
      }
    }

    // User seems technical — use more direct language
    if (seemsTechnical) {
      if (baseMsg.includes('assistente do PH')) {
        return `Boa! Sou o sistema de orcamento automatizado do PH. Parseio keywords e monto estimativas em tempo real.\n\nComo posso te chamar?`;
      }
      if (baseMsg.includes('10 perguntas e eu te dou')) {
        return `Flow: 8 inputs → estimativa real-time. Sem IA, tudo rule-based.\n\nComo posso te chamar?`;
      }
    }

    return baseMsg;
  };

  const currentStep = CHAT_FLOW[currentStepId];
  const isInputDisabled = isTyping || currentStep?.type !== 'input';

  const contextualPlaceholder = currentStep?.inputPlaceholder || (chatMode === 'support' ? 'Digite sua duvida...' : 'Digite sua resposta...');

  // Progressive indicator
  const renderProgressIndicator = () => {
    if (!totalSteps || answeredSteps < 1) return null;
    const pct = Math.min(100, (answeredSteps / totalSteps) * 100);
    return (
      <div className="px-4 py-2 bg-white/5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-gray-500">Progresso</span>
          <span className="text-[10px] text-gray-500">{Math.round(pct)}%</span>
        </div>
        <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div className="h-full bg-primary-600 rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} />
        </div>
      </div>
    );
  };

  const currentOptions = messages.length > 0 ? messages[messages.length - 1].options : undefined;

  // ============================================================
  // RENDER
  // ============================================================
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
            {/* HEADER */}
            <div className={`p-4 flex flex-col gap-3 border-b shrink-0 transition-colors duration-500 ${chatMode === 'support' ? 'bg-indigo-900 border-indigo-800' : 'bg-gray-900 border-gray-800'}`}>
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg shadow-inner transition-colors duration-500 ${chatMode === 'support' ? 'bg-indigo-500' : 'bg-primary-600'}`}>
                    {chatMode === 'support' ? <HelpCircle size={18} className="text-white" /> : <Bot size={18} className="text-white" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-display font-bold text-lg text-white tracking-tight leading-none">PH<span className={`transition-colors duration-500 ${chatMode === 'support' ? 'text-indigo-300' : 'text-primary-400'}`}>.bot</span></span>
                      <Sparkles size={14} className="text-primary-400 dark:text-primary-300" />
                    </div>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <ShieldAlert size={10} className="text-green-500" />
                      <span className="uppercase tracking-wide">{chatMode === 'support' ? 'Suporte T\u00e9cnico' : 'Or\u00e7amentos'}</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 items-center">
                  <button onClick={handleWhatsAppShortcut} className="text-green-400 hover:text-green-300 hover:bg-white/10 p-2 rounded-full transition-colors" title="Falar no WhatsApp"><MessageCircle size={18} /></button>
                  <button onClick={initializeChat} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full" title="Reiniciar"><RefreshCcw size={16} /></button>
                  <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full" title="Fechar"><X size={20} /></button>
                </div>
              </div>
              <div className="bg-white/10 p-1 rounded-xl flex gap-1">
                <button onClick={() => handleSwitchMode('sales')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${chatMode === 'sales' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}><Briefcase size={12} />Projetos</button>
                <button onClick={() => handleSwitchMode('support')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${chatMode === 'support' ? 'bg-white text-indigo-900 shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}><Info size={12} />Duvidas</button>
              </div>
            </div>

            {/* Progress Indicator */}
            {renderProgressIndicator()}

            {/* MESSAGES AREA */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-[#0B0D12] space-y-3 scroll-smooth relative pb-2">
              {/* "Falar com PH" inline */}
              <div className="flex items-center justify-center py-1">
                <AnimatePresence mode="wait">
                  {!showQuickMessage ? (
                    <motion.button key="trigger-btn" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} onClick={handleDirectMessageInline} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full transition-all active:scale-95 shadow-sm border border-gray-300 dark:border-gray-600">
                      <MessageSquare size={12} />Falar com PH
                    </motion.button>
                  ) : (
                    <motion.form key="inline-form" initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} onSubmit={handleQuickMessageSubmit} className="w-full max-w-[90%] flex items-center gap-1.5">
                      <textarea ref={quickMessageRef} value={quickMessageText} onChange={e => setQuickMessageText(e.target.value)} placeholder="Escreva sua mensagem..." rows={1} className="flex-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none border border-gray-200 dark:border-gray-700" />
                      <button type="submit" disabled={!quickMessageText.trim()} className="p-1.5 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm bg-primary-600 hover:bg-primary-700 shrink-0"><Send size={14} /></button>
                      <button type="button" onClick={() => { setShowQuickMessage(false); setQuickMessageText(''); }} className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg transition-colors shrink-0"><X size={14} /></button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>

              {/* Messages */}
              <AnimatePresence mode="popLayout">
                {messages.map((msg, index) => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }} layout className={`flex flex-col ${msg.isUser ? 'items-end' : 'items-start'}`}>
                    {!msg.isUser && msg.type !== 'process-info' && (
                      <div className="flex items-start max-w-[90%]">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold mr-2 mt-1 shrink-0 select-none transition-colors duration-500 ${chatMode === 'support' ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300' : 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'}`}>
                          PH
                        </div>
                        <div className={`px-4 py-3 text-sm shadow-sm leading-relaxed whitespace-pre-wrap break-words ${msg.isUser ? chatMode === 'support' ? 'bg-indigo-600 text-white rounded-2xl rounded-br-sm' : 'bg-primary-600 text-white rounded-2xl rounded-br-sm' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-sm'}`}>
                          {renderMessageText(msg.text)}
                        </div>
                      </div>
                    )}
                    {msg.isUser && (
                      <div className="max-w-[85%]">
                        <div className={`px-4 py-3 text-sm shadow-sm leading-relaxed whitespace-pre-wrap break-words rounded-2xl rounded-br-sm ${chatMode === 'support' ? 'bg-indigo-600 text-white' : 'bg-primary-600 text-white'}`}>
                          {renderMessageText(msg.text)}
                        </div>
                      </div>
                    )}

                    {/* Options */}
                    {!msg.isUser && msg.type === 'options' && msg.options && (
                      <div className="flex flex-wrap gap-2 mt-3 ml-9 max-w-[90%]">
                        {msg.options.map((opt, idx) => (
                          <button key={idx} onClick={() => handleOptionClick(opt)} className={`text-xs font-medium py-2.5 px-4 rounded-xl border shadow-sm transition-all active:scale-95 text-left ${chatMode === 'support' ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300 hover:border-indigo-300 dark:hover:border-indigo-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-700 dark:hover:text-primary-300 hover:border-primary-300 dark:hover:border-primary-700'}`}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Summary */}
                    {!msg.isUser && msg.type === 'summary' && msg.options && (
                      <div className="mt-4 ml-9 flex flex-col gap-2 w-[85%]">
                        {msg.options.map((opt, idx) => {
                          const isFinish = opt.value === 'finish';
                          return (
                            <button key={idx} onClick={() => handleOptionClick(opt)} className={`w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 ${isFinish ? 'bg-green-600 text-white shadow-lg shadow-green-200 dark:shadow-green-900/20' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                              {isFinish && <CheckSquare size={16} />}{opt.label}
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
                              <button key={idx} onClick={() => toggleMultiSelect(opt.value)} className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors ${isSelected ? 'bg-primary-50 dark:bg-primary-900/20 text-gray-900 dark:text-primary-100' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                                <span>{opt.label}</span>
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'}`}>
                                  {isSelected ? <CheckSquare size={12} /> : <Square size={12} />}
                                </div>
                              </button>
                            );
                          })}
                          <div className="p-3 bg-gray-50 dark:bg-gray-800/80">
                            <button onClick={confirmMultiSelect} className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-2.5 rounded-lg text-sm font-bold hover:bg-black dark:hover:bg-gray-200 transition-colors">Confirmar Selecao ({selectedMultiOptions.length})</button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Process info */}
                    {!msg.isUser && msg.type === 'process-info' && (
                      <div className="mx-0 md:mx-0 mt-2 w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                        <div className="bg-primary-50 dark:bg-primary-900/20 p-3 border-b border-primary-100 dark:border-primary-800 flex justify-between items-center">
                          <p className="text-xs font-bold text-primary-800 dark:text-primary-300 uppercase tracking-wider">Metodologia PH.Dev</p>
                          <Clock size={12} className="text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="p-4 space-y-4">
                          {PROCESS_STEPS.map((step, i) => (
                            <div key={step.id} className="flex gap-3 relative">
                              {i !== PROCESS_STEPS.length - 1 && <div className="absolute top-6 left-3 w-0.5 h-full bg-gray-100 dark:bg-gray-700 -z-0" />}
                              <div className="bg-white dark:bg-gray-700 border-2 border-primary-100 dark:border-primary-800 text-primary-600 dark:text-primary-400 font-bold w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 z-10">{step.id}</div>
                              <div className="flex-1">
                                <p className="text-xs font-bold text-gray-900 dark:text-white">{step.title}</p>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight mt-0.5">{step.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 ml-9 bg-gray-200 dark:bg-gray-800 w-fit px-4 py-2.5 rounded-2xl rounded-bl-sm">
                    <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* QUICK REPLIES BAR */}
            <div className="px-3 py-2 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0">
              <div className="flex gap-1.5 justify-center flex-wrap">
                <button onClick={() => handleQuickReply('orcamento')} className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full transition-all active:scale-95 border border-gray-200 dark:border-gray-700 flex items-center gap-1"><FileText size={12} />Orcamento</button>
                <button onClick={() => handleQuickReply('mensagem')} className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full transition-all active:scale-95 border border-gray-200 dark:border-gray-700 flex items-center gap-1"><MessageSquare size={12} />Mensagem</button>
                <button onClick={() => handleQuickReply('duvidas')} className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full transition-all active:scale-95 border border-gray-200 dark:border-gray-700 flex items-center gap-1">Duvidas</button>
                <button onClick={() => handleQuickReply('blog')} className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full transition-all active:scale-95 border border-gray-200 dark:border-gray-700 flex items-center gap-1"><ArrowUpRight size={12} />Blog</button>
              </div>
            </div>

            {/* INPUT */}
            <form onSubmit={handleInputSubmit} className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0">
              <div className="relative flex items-center">
                <input ref={inputRef} type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder={contextualPlaceholder} disabled={isInputDisabled} className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed" />
                <button type="submit" disabled={isInputDisabled || (!inputValue.trim() && !currentStep?.allowSkip)} className={`absolute right-2 p-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm ${chatMode === 'support' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-primary-600 hover:bg-primary-700'}`}>
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING TRIGGER */}
      {!isOpen && (
        <div className={`fixed right-4 md:right-8 z-[90] transition-all duration-300 ${shouldElevate ? 'bottom-24' : 'bottom-8'}`}>
          <AnimatePresence>
            {showProactive && (
              <motion.div initial={{ opacity: 0, x: 20, scale: 0.85 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }} className="absolute bottom-full mb-3 right-0 bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-br-sm shadow-xl border border-gray-100 dark:border-gray-700 max-w-[240px] origin-bottom-right">
                <p className="text-sm font-medium text-gray-800 dark:text-white">{proactiveMessage}</p>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-white dark:bg-gray-800 translate-x-1 translate-y-1 rotate-45 border-r border-b border-gray-100 dark:border-gray-700" />
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={() => setIsOpen(true)} className="group relative flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full text-white shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50 hover:-translate-y-1 transition-all duration-300 active:scale-95">
            <MessageCircle size={30} className="relative z-10" fill="currentColor" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-white dark:border-gray-900 animate-pulse z-20">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
            <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 z-10">
              <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
              <span className="relative inline-flex Rounded-full h-3 w-3 bg-green-500 border-2 border-white dark:border-gray-900" />
            </span>
          </button>
        </div>
      )}
    </>
  );
};
