import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Zap, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMobile } from '../hooks/useMobile';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const WELCOME_MESSAGE = 'Ola! Sou o **PH.bot IA**, assistente virtual do **PH.static**. 🚀\n\nPosso te ajudar com:\n- **Orcamentos** e precos\n- **Informacoes** sobre os servicos\n- **Prazos** de entrega\n- **Tecnologias** usadas\n- **Formas de pagamento**\n\nComo posso te ajudar?';

interface ChatbotV2Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const ChatbotV2: React.FC<ChatbotV2Props> = ({ isOpen, setIsOpen }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [history, setHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [showTrigger, setShowTrigger] = useState(false);
  const [activeTrigger, setActiveTrigger] = useState('');
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMounted = useRef(true);

  const isMobile = useMobile();

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage(WELCOME_MESSAGE);
      // Track chat open
      fetch(`${API_BASE}/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'chat_open', path: window.location.pathname, userAgent: navigator.userAgent, referrer: document.referrer }),
      }).catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setShowTrigger(false);
      return;
    }

    const triggers = [
      'Posso ajudar no seu projeto? ',
      'Vamos criar algo incrivel hoje? ',
      'Duvidas sobre os pacotes? ',
      'Faca um orcamento sem compromisso! ',
      'Transforme sua ideia em site ',
    ];
    const randomMsg = triggers[Math.floor(Math.random() * triggers.length)];
    setActiveTrigger(randomMsg);

    const delay = setTimeout(() => {
      if (!isMounted.current) return;
      setShowTrigger(true);
      setTimeout(() => {
        if (!isMounted.current) return;
        setShowTrigger(false);
      }, 5000);
    }, 3000);

    return () => clearTimeout(delay);
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const addBotMessage = (text: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text,
      isUser: false,
      timestamp: new Date(),
    }]);
  };

  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
    }]);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userText = inputValue.trim();
    setInputValue('');
    setError(null);
    addUserMessage(userText);
    setIsTyping(true);

    const newHistory = [...history, { role: 'user', content: userText }];

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);

      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, history: newHistory }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erro no servidor');
      }

      const data = await res.json();

      if (!data.success || !data.data?.reply) {
        throw new Error('Resposta vazia da IA');
      }

      addBotMessage(data.data.reply);
      setHistory(prev => [...prev.slice(-10), { role: 'user', content: userText }, { role: 'assistant', content: data.data.reply }]);
    } catch (err: any) {
      console.error('ChatbotV2 error:', err.message);
      if (err.name === 'AbortError') {
        addBotMessage('Desculpe, a IA demorou para responder. Tente novamente ou fale no **WhatsApp: +55 61 99325-4324**');
      } else {
        addBotMessage('Erro ao conectar com a IA. Verifique se o backend esta rodando ou fale no **WhatsApp: +55 61 99325-4324**');
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([]);
    setHistory([]);
    setInputValue('');
    setError(null);
    setTimeout(() => addBotMessage(WELCOME_MESSAGE), 300);
  };

  const renderMessageText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const rendered = parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index} className="font-bold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('---') && part.endsWith('---')) {
          return <hr key={index} className="my-2 border-gray-200 dark:border-gray-700" />;
        }
        return <span key={index}>{part}</span>;
      });
      return (
        <React.Fragment key={lineIdx}>
          {lineIdx > 0 && <br />}
          {rendered}
        </React.Fragment>
      );
    });
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-0 md:bottom-24 right-0 md:right-8 z-[100] w-full md:w-[420px] h-[100dvh] md:h-[700px] bg-white dark:bg-gray-900 md:rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="p-4 flex flex-col gap-3 shadow-md shrink-0 border-b border-gray-800 bg-gray-900">
              <div className="flex justify-between items-center text-white">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg shadow-inner bg-gradient-to-br from-primary-500 to-violet-600">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <div>
                    <span className="font-display font-bold text-lg text-white tracking-tight leading-none">
                      PH<span className="text-primary-400">.bot IA</span>
                    </span>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <Zap size={10} className="text-yellow-500" />
                      <span className="uppercase tracking-wide">Assistente Inteligente</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={handleReset}
                    className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                    title="Reiniciar conversa"
                  >
                    <RotateCcw size={18} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                    title="Fechar"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-[#0B0D12] space-y-4 scroll-smooth transition-colors">
              <AnimatePresence mode="popLayout">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    layout
                    className={`flex flex-col ${msg.isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} max-w-[90%]`}>
                      {!msg.isUser && (
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mr-2 mt-auto shrink-0 select-none bg-gradient-to-br from-primary-500 to-violet-600 text-white">
                          IA
                        </div>
                      )}
                      <div className={`px-4 py-3 text-sm shadow-sm leading-relaxed whitespace-pre-wrap transition-colors ${
                        msg.isUser
                          ? 'bg-primary-600 text-white rounded-2xl rounded-br-sm'
                          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-sm'
                      }`}>
                        {renderMessageText(msg.text)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-1.5 ml-8 bg-gray-200 dark:bg-gray-800 w-fit px-3 py-2 rounded-xl rounded-bl-sm"
                >
                  <div className="w-1.5 h-1.5 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 ml-1">Digitando...</span>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite sua mensagem..."
                  disabled={isTyping}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm rounded-xl py-3 pl-4 pr-4 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white dark:focus:bg-gray-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  className="p-3 bg-primary-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition-colors shadow-sm"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-2">
                PH.bot IA pode cometer erros. Verifique informacoes importantes.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger (Desktop) - V2 */}
      {!isOpen && !isMobile && (
        <div className="fixed right-8 z-[90] bottom-8">
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
            className="group relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-violet-600 rounded-full text-white shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50 hover:-translate-y-1 transition-all duration-300"
          >
            <span className="absolute inset-0 rounded-full border-2 border-primary-400 opacity-0 group-hover:opacity-100 group-hover:animate-ping duration-1000"></span>
            <Sparkles size={28} className="relative z-10" />
            <span className="absolute top-0 right-0 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-500 border-2 border-white dark:border-gray-900"></span>
            </span>
          </button>
        </div>
      )}
    </>
  );
};
