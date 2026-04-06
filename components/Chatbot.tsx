
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, CheckSquare, Square, ChevronRight, Clock, ShieldAlert, RefreshCcw, Code2, Bot, Sparkles, HelpCircle, Briefcase, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { BudgetData, ChatMessage, ChatOption, ChatbotProps } from '../types';
import { PROCESS_STEPS, CONTACT_CONFIG } from '../constants';
import { CHAT_FLOW, INITIAL_BUDGET, generateWhatsAppLink } from '../chatbotFlow';
import { api } from '../lib/api';
import { useCookieConsent } from '../hooks/useCookieConsent';
import { useMobile } from '../hooks/useMobile';

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
  "Qual seu próximo desafio? 🏆"
];

const SUPPORT_KEYWORDS = [
  'ajuda', 'socorro', 'dúvida', 'duvida', 'suporte', 'problema', 
  'não entendi', 'como funciona', 'explica'
];

export const Chatbot: React.FC<ChatbotProps> = ({ isOpen, setIsOpen, onNavigate, contextService, extraElevation, initialMode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [budgetData, setBudgetData] = useState<BudgetData>(INITIAL_BUDGET);
  
  const [activeTrigger, setActiveTrigger] = useState<string>('');
  const [showTrigger, setShowTrigger] = useState(false);

  const [currentStepId, setCurrentStepId] = useState<string>('');
  const [selectedMultiOptions, setSelectedMultiOptions] = useState<string[]>([]);
  const [chatMode, setChatMode] = useState<'sales' | 'support'>('sales');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const isMounted = useRef(true);

  const { isVisible: isCookieVisible } = useCookieConsent();
  const isMobile = useMobile();
  
  const shouldElevate = isCookieVisible || extraElevation;

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
      fetch(`/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'chat_open', path: window.location.pathname, user_agent: navigator.userAgent }),
      }).catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setShowTrigger(false);
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout>;

    const showRandomMessage = () => {
      if (!isMounted.current) return;
      const randomMsg = CHAT_TRIGGERS[Math.floor(Math.random() * CHAT_TRIGGERS.length)];
      setActiveTrigger(randomMsg);
      setShowTrigger(true);

      timeoutId = setTimeout(() => {
        if (!isMounted.current) return;
        setShowTrigger(false);
        const randomDelay = Math.random() * 12000 + 8000;
        timeoutId = setTimeout(showRandomMessage, randomDelay);
      }, 5000);
    };

    const initialDelay = setTimeout(showRandomMessage, 3000);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(initialDelay);
    };
  }, [isOpen]);

  const initializeChat = () => {
    setBudgetData(INITIAL_BUDGET);
    setMessages([]);
    
    if (initialMode === 'support') {
        setChatMode('support');
        processStep('support_start', INITIAL_BUDGET);
        return;
    }

    setChatMode('sales');

    if (contextService) {
        setBudgetData(prev => ({ ...prev, projectType: contextService.title }));
        processStep('start_context', { ...INITIAL_BUDGET, projectType: contextService.title });
    } else {
        processStep('start', INITIAL_BUDGET);
    }
  };

  const handleSwitchMode = async (targetMode: 'sales' | 'support') => {
      if (chatMode === targetMode) return;

      setIsTyping(true);
      setMessages([]); 
      setChatMode(targetMode); 

      await new Promise(resolve => setTimeout(resolve, 600)); 
      
      if (!isMounted.current) return;
      
      if (targetMode === 'support') {
          processStep('support_start', budgetData);
      } else {
          if (budgetData.name) {
              processStep('welcome_back', budgetData);
          } else {
              processStep('start', INITIAL_BUDGET);
          }
      }
  };

  const processStep = async (stepId: string, currentData: BudgetData) => {
    const step = CHAT_FLOW[stepId];
    if (!step) return;

    setCurrentStepId(stepId);

    if (stepId === 'check_project_type' && currentData.projectType && currentData.projectType !== '') {
         processStep('design_status', currentData);
         return;
    }
    
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 600)); 
    
    if (!isMounted.current) return;
    
    setIsTyping(false);

    const messageText = typeof step.message === 'function' ? step.message(currentData) : step.message;
    
    let options = step.options;
    if (step.dynamicOptions) {
        options = step.dynamicOptions(currentData);
    }

    if (step.type === 'process-info') {
         addBotMessage(messageText, 'text', options);
         setTimeout(() => {
             if (!isMounted.current) return;
             addProcessInfoCard();
             setTimeout(() => {
                if(step.nextId && isMounted.current) processStep(step.nextId, currentData);
             }, 5000); 
         }, 800);
         return;
    }

    addBotMessage(messageText, step.type, options);

    if (step.type === 'input') {
        if (step.key && currentData[step.key as keyof BudgetData]) {
            const val = currentData[step.key as keyof BudgetData];
            if (typeof val === 'string') {
                setInputValue(val);
            }
        } else {
            setInputValue('');
        }
        setTimeout(() => inputRef.current?.focus(), 100);
    } else {
        setInputValue('');
    }
  };

  const addBotMessage = (text: string | React.ReactNode, type: any = 'text', options?: ChatOption[]) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text,
      isUser: false,
      type,
      options
    }]);
  };

  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text,
      isUser: true
    }]);
  };

  const addProcessInfoCard = () => {
      setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: '',
          isUser: false,
          type: 'process-info'
      }]);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const stepConfig = CHAT_FLOW[currentStepId];
    if (!inputValue.trim() && !stepConfig?.allowSkip) return;

    const value = inputValue;
    
    if (value.trim()) {
        addUserMessage(value);
    }
    
    setInputValue('');

    if (value.trim()) {
        const lowerValue = value.toLowerCase();
        
        // SAFEGUARD: Etapas de "Texto Livre" (Público, Detalhes, Referências) não devem gatilhar suporte.
        // Isso permite que o cliente escreva textos longos e técnicos sem ser interrompido.
        const isHeavyInputStep = ['define_audience', 'details', 'reference_note'].includes(currentStepId);

        const isSupportIntent = SUPPORT_KEYWORDS.some(keyword => lowerValue.includes(keyword));

        if (isSupportIntent && chatMode === 'sales' && !isHeavyInputStep) {
            // Se a mensagem for muito longa (> 50 chars), provavelmente é uma descrição e não um pedido de ajuda simples
            // Mas se estiver em uma "Heavy Input Step", ignoramos completamente o suporte.
            if (value.length < 50) {
                handleSwitchMode('support');
                return;
            }
        }
    }

    const currentStep = CHAT_FLOW[currentStepId];

    const newData = { ...budgetData };
    // Handle direct_message_custom step
    if (currentStepId === 'direct_message_custom' && value.trim()) {
      saveDirectMessage(value);
    }
    if (currentStep.key && value.trim()) {
        // @ts-ignore
        newData[currentStep.key] = value;
        setBudgetData(newData);
    }

    if (currentStep.nextId) {
        processStep(currentStep.nextId, newData);
    }
  };

  const handleOptionClick = (option: ChatOption) => {
      if (option.value === 'restart') {
          initializeChat();
          return;
      }

      if (option.value === 'Encerrar') {
          setIsOpen(false);
          return;
      }
      
      if (option.value === 'SwitchToSupport') {
          handleSwitchMode('support');
          return;
      }

      if (option.value === 'SwitchToSales' || option.value === 'Voltar Projeto') {
          handleSwitchMode('sales');
          return;
      }
      
      if (option.value === 'finish') {
          const link = generateWhatsAppLink(budgetData);
          window.open(link, '_self');
          return;
      }

      if (option.value === 'send_summary_msg' && option.nextId === 'direct_message_sent') {
          // Save summary as direct message to backend
          const estimate = calculateEstimate(budgetData);
          const summaryMessage = `Nome: ${budgetData.name}\nEmail: ${budgetData.email}\nTipo: ${budgetData.projectType}\nDesign: ${budgetData.designStatus}\nPrazo: ${budgetData.timeline}\nEstimativa: ${formatCurrency(estimate.min)} - ${formatCurrency(estimate.max)}`;
          saveDirectMessage(summaryMessage);
          addUserMessage('📋 Resumo do orçamento enviado!');
          processStep('direct_message_sent', budgetData);
          return;
      }

      if (option.value === 'direct_message') {
          addUserMessage('💬 Fale direto comigo');
          processStep('direct_message_confirm', budgetData);
          return;
      }

      addUserMessage(option.label);

      const currentStep = CHAT_FLOW[currentStepId];
      const newData = { ...budgetData };
      
      if (currentStep.key) {
           // @ts-ignore
           newData[currentStep.key] = option.value;
      } 
      else if (currentStepId === 'check_project_type') {
           newData.projectType = option.value;
      }

      setBudgetData(newData);

      const nextId = option.nextId || currentStep.nextId;
      
      if (nextId) {
          processStep(nextId, newData);
      }
  };

  const toggleMultiSelect = (value: string) => {
      setSelectedMultiOptions(prev => 
          prev.includes(value) 
            ? prev.filter(item => item !== value)
            : [...prev, value]
      );
  };

  const confirmMultiSelect = () => {
      const selections = selectedMultiOptions.length > 0 ? selectedMultiOptions : ['Básico'];
      const newData = { ...budgetData, functionalities: selections };
      setBudgetData(newData);
      
      addUserMessage(`Selecionados: ${selections.join(', ')}`);
      setSelectedMultiOptions([]);
      
      const currentStep = CHAT_FLOW[currentStepId];
      if (currentStep.nextId) {
          processStep(currentStep.nextId, newData);
      }
  };

  const saveDirectMessage = async (message: string) => {
    try {
      await api.chat.sendMessage({
        name: budgetData.name,
        email: budgetData.email,
        budget_data: budgetData,
        message,
      });
    } catch (e) {
      console.error('Failed to save direct message:', e);
    }
  };

  const handleDirectContact = () => {
    const message = `Olá! Vim pelo chat do site e gostaria de falar com um atendente.\n\nNome: ${budgetData.name || budgetData.inputValue || 'Não informado'}\n`;
    if (budgetData.projectType) {
      // Already has budget data — skip to confirm
      addUserMessage('💬 Falar com atendente');
      saveDirectMessage(message);
      addBotMessage('Entendido! Sua mensagem foi enviada. O PH vai te responder em breve. 🙌');
      return;
    }
    addUserMessage('💬 Falar com atendente');
    saveDirectMessage(message);
    addBotMessage('Entendido! Sua mensagem foi enviada. O PH vai te responder em breve. 🙌');
  };

  const handleWhatsAppShortcut = () => {
      const text = `Olá! Prefiro pular o chat e falar diretamente com um atendente sobre meu projeto.`;
      const url = `https://wa.me/${CONTACT_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
  };

  const renderMessageText = (text: string | React.ReactNode) => {
    if (typeof text !== 'string') return text;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="font-bold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
        }
        return <span key={index}>{part}</span>;
    });
  };

  const currentStep = CHAT_FLOW[currentStepId];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-0 md:bottom-24 right-0 md:right-8 z-[100] w-full md:w-[420px] h-[100dvh] md:h-[700px] bg-white dark:bg-gray-900 md:rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden font-sans transition-colors duration-300"
          >
            {/* Header */}
            <div className={`p-4 flex flex-col gap-3 shadow-md shrink-0 border-b border-gray-800 transition-colors duration-500 ${chatMode === 'support' ? 'bg-indigo-900' : 'bg-gray-900'}`}>
              
              <div className="flex justify-between items-center text-white">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg shadow-inner transition-colors duration-500 ${chatMode === 'support' ? 'bg-indigo-500' : 'bg-primary-600'}`}>
                        {chatMode === 'support' ? <HelpCircle size={20} /> : <Code2 size={20} />}
                    </div>
                    <div>
                        <span className="font-display font-bold text-lg text-white tracking-tight leading-none">
                            PH<span className={`transition-colors duration-500 ${chatMode === 'support' ? 'text-indigo-300' : 'text-primary-400'}`}>.bot</span>
                        </span>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <ShieldAlert size={10} className="text-green-500"/> 
                            <span className="uppercase tracking-wide">{chatMode === 'support' ? 'Suporte Técnico' : 'Orçamentos'}</span>
                        </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                      <button onClick={handleWhatsAppShortcut} className="text-green-400 hover:text-green-300 hover:bg-white/10 p-2 rounded-full transition-colors" title="Pular para WhatsApp">
                        <MessageCircle size={18} />
                      </button>
                      <button onClick={initializeChat} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full" title="Reiniciar">
                        <RefreshCcw size={18} />
                      </button>
                      <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full" title="Fechar">
                        <X size={24} />
                      </button>
                  </div>
              </div>

              <div className="bg-black/20 p-1 rounded-xl flex gap-1">
                  <button 
                    onClick={() => handleSwitchMode('sales')}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${
                        chatMode === 'sales' 
                        ? 'bg-white text-gray-900 shadow-md' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                      <Briefcase size={12} /> Projetos
                  </button>
                  <button 
                    onClick={() => handleSwitchMode('support')}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${
                        chatMode === 'support' 
                        ? 'bg-white text-indigo-900 shadow-md' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                      <Info size={12} /> Dúvidas
                  </button>
              </div>

            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-[#0B0D12] space-y-5 scroll-smooth relative pb-4 transition-colors duration-300">
              <AnimatePresence mode="popLayout">
                  {messages.map((msg, index) => {
                      const isLastMessage = index === messages.length - 1;
                      
                      return (
                        <motion.div 
                            key={msg.id} 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            layout
                            className={`flex flex-col ${msg.isUser ? 'items-end' : 'items-start'}`}
                        >
                          <div className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} max-w-[90%]`}>
                              {!msg.isUser && msg.type !== 'process-info' && (
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-gray-600 dark:text-gray-300 font-bold mr-2 mt-auto shrink-0 select-none transition-colors duration-500 ${chatMode === 'support' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300' : 'bg-gray-200 dark:bg-gray-800'}`}>
                                      AI
                                  </div>
                              )}
                              
                              {msg.type !== 'process-info' && (
                                <div className={`px-4 py-3 text-sm shadow-sm leading-relaxed whitespace-pre-wrap transition-colors duration-500 ${
                                    msg.isUser 
                                    ? `${chatMode === 'support' ? 'bg-indigo-600' : 'bg-primary-600'} text-white rounded-2xl rounded-br-sm` 
                                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-sm'
                                }`}>
                                    {renderMessageText(msg.text)}
                                </div>
                              )}
                          </div>
                          
                          {msg.type === 'process-info' && (
                              <div className="ml-0 md:ml-8 mt-2 w-[95%] bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                                    <div className="bg-primary-50 dark:bg-primary-900/20 p-3 border-b border-primary-100 dark:border-primary-800 flex justify-between items-center">
                                        <p className="text-xs font-bold text-primary-800 dark:text-primary-300 uppercase tracking-wider">Metodologia PH.Dev</p>
                                        <Clock size={12} className="text-primary-600 dark:text-primary-400"/>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        {PROCESS_STEPS.map((step, i) => (
                                            <div key={step.id} className="flex gap-3 relative">
                                                {i !== PROCESS_STEPS.length - 1 && (
                                                    <div className="absolute top-6 left-3 w-0.5 h-full bg-gray-100 dark:bg-gray-700 -z-0"></div>
                                                )}
                                                <div className="bg-white dark:bg-gray-700 border-2 border-primary-100 dark:border-primary-800 text-primary-600 dark:text-primary-400 font-bold w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 z-10">
                                                    {step.id}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-900 dark:text-white">{step.title}</p>
                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight mt-0.5">{step.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                              </div>
                          )}

                          {!msg.isUser && msg.options && msg.type === 'options' && (
                              <div className="flex flex-wrap gap-2 mt-3 ml-8 max-w-[90%]">
                                  {msg.options.map((opt, idx) => (
                                      <button
                                          key={idx}
                                          onClick={() => handleOptionClick(opt)}
                                          disabled={!isLastMessage && !['finish', 'review', 'SwitchToSupport', 'SwitchToSales', 'Voltar Projeto'].includes(opt.value)} 
                                          className={`text-xs font-medium py-2.5 px-4 rounded-xl border shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-left 
                                            ${chatMode === 'support' 
                                                ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300 hover:border-indigo-300 dark:hover:border-indigo-700' 
                                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-700 dark:hover:text-primary-300 hover:border-primary-300 dark:hover:border-primary-700'
                                            }`}
                                      >
                                          {opt.label}
                                      </button>
                                  ))}
                              </div>
                          )}

                          {!msg.isUser && msg.type === 'summary' && msg.options && (
                              <div className="mt-4 ml-8 flex flex-col gap-2 w-[85%]">
                                    {msg.options.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleOptionClick(opt)}
                                            className={`w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 ${
                                                opt.value === 'finish' 
                                                ? 'bg-green-600 text-white shadow-lg shadow-green-200 dark:shadow-green-900/20 hover:shadow-green-300 border-none' 
                                                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                            }`}
                                        >
                                            {opt.value === 'finish' && <CheckSquare size={16} />}
                                            {opt.label}
                                        </button>
                                    ))}
                              </div>
                          )}

                          {!msg.isUser && msg.type === 'multi-select' && msg.options && (
                              <div className="mt-4 ml-8 w-[90%]">
                                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                                      {msg.options.map((opt, idx) => {
                                          const isSelected = selectedMultiOptions.includes(opt.value);
                                          return (
                                              <button
                                                  key={idx}
                                                  onClick={() => toggleMultiSelect(opt.value)}
                                                  disabled={!isLastMessage}
                                                  className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors ${
                                                      isSelected 
                                                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100' 
                                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                  } ${!isLastMessage ? 'opacity-60 cursor-not-allowed' : ''}`}
                                              >
                                                  <span>{opt.label}</span>
                                                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                                                      isSelected 
                                                        ? 'bg-primary-600 border-primary-600 text-white' 
                                                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                                                  }`}>
                                                      {isSelected && <CheckSquare size={12} />}
                                                  </div>
                                              </button>
                                          )
                                      })}
                                      <div className="p-3 bg-gray-50 dark:bg-gray-800/80">
                                          <button 
                                              onClick={confirmMultiSelect}
                                              disabled={!isLastMessage}
                                              className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-2.5 rounded-lg text-sm font-bold hover:bg-black dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
                                          >
                                              Confirmar Seleção ({selectedMultiOptions.length})
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          )}
                        </motion.div>
                      );
                  })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
              
              {isTyping && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-1.5 ml-8 bg-gray-200 dark:bg-gray-800 w-fit px-3 py-2 rounded-xl rounded-bl-sm"
                  >
                      <div className="w-1.5 h-1.5 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </motion.div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleInputSubmit} className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0 transition-colors duration-300">
               <div className="relative flex items-center">
                   <input
                       ref={inputRef}
                       type="text"
                       value={inputValue}
                       onChange={(e) => setInputValue(e.target.value)}
                       placeholder={
                           currentStep?.inputPlaceholder || "Digite sua resposta..."
                       }
                       disabled={isTyping || currentStep?.type !== 'input'} 
                       className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white dark:focus:bg-gray-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                   />
                   <button
                       type="submit"
                       disabled={(!inputValue.trim() && !currentStep?.allowSkip) || isTyping}
                       className={`absolute right-2 p-1.5 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm ${chatMode === 'support' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-primary-600 hover:bg-primary-700'}`}
                   >
                       <Send size={16} />
                   </button>
               </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button (Desktop Only) */}
      {!isOpen && !isMobile && (
        <div className={`fixed right-8 z-[90] transition-all duration-300 ${shouldElevate ? 'bottom-24' : 'bottom-8'}`}>
           <AnimatePresence>
             {showTrigger && (
               <motion.div
                 initial={{ opacity: 0, x: 20, scale: 0.8 }}
                 animate={{ opacity: 1, x: 0, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                 className="absolute bottom-full mb-4 right-0 bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-br-sm shadow-xl border border-gray-100 dark:border-gray-700 whitespace-nowrap origin-bottom-right"
               >
                 <p className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    {activeTrigger}
                 </p>
               </motion.div>
             )}
           </AnimatePresence>

           <button
             onClick={() => setIsOpen(true)}
             className="group relative flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full text-white shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50 hover:-translate-y-1 transition-all duration-300"
           >
             <span className="absolute inset-0 rounded-full border-2 border-primary-400 opacity-0 group-hover:opacity-100 group-hover:animate-ping duration-1000"></span>
             
             <MessageCircle size={32} fill="currentColor" className="relative z-10" />
             
             <span className="absolute top-0 right-0 flex h-4 w-4">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white dark:border-gray-900"></span>
             </span>
           </button>
        </div>
      )}
    </>
  );
};
