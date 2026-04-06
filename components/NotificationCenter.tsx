
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, ArrowRight, Copy, Check, Calendar, BookOpen, Lightbulb } from 'lucide-react';
import { ViewType } from '../types';
import { useContent } from '../contexts/ContentContext';

interface NotificationCenterProps {
  onNavigate: (view: ViewType) => void;
}

// Helper to map string icon names back to components if needed, or fallback
const IconMap: any = {
    Calendar,
    BookOpen,
    Lightbulb,
    Bell
};

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNavigate }) => {
  const { content } = useContent();
  const { notifications: config } = content;
  
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  if (!config.ENABLED) return null;

  const hasUnread = config.ITEMS.length > 0;

  const handleAction = (item: any) => {
    if (item.code) {
      navigator.clipboard.writeText(item.code);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } else if (item.actionLink) {
      setIsOpen(false);
      onNavigate(item.actionLink as ViewType);
    }
  };

  const getStyles = (type: string) => {
    switch(type) {
      case 'promo': return 'bg-gray-900 text-white border border-gray-800 shadow-xl';
      case 'tip': return 'bg-yellow-50 border border-yellow-100 text-yellow-900';
      default: return 'bg-white border border-gray-100 text-gray-900 shadow-sm';
    }
  };

  return (
    <>
      {/* TRIGGER BUTTON */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-6 left-4 md:bottom-8 md:left-8 z-[90] w-12 h-12 rounded-full shadow-lg border border-gray-200 flex items-center justify-center transition-colors duration-300 ${isOpen ? 'bg-primary-600 text-white border-primary-500' : 'bg-white text-gray-600 hover:text-primary-600'}`}
      >
        {isOpen ? <X size={20} /> : <Bell size={20} />}
        {!isOpen && hasUnread && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center animate-pulse" />
        )}
      </motion.button>

      {/* OVERLAY */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[88] bg-transparent" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* FLOATING POPOVER CARD */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, originY: 1, originX: 0 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed bottom-20 left-4 md:bottom-24 md:left-8 z-[89] w-[340px] max-w-[calc(100vw-32px)]"
          >
            <div className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[60vh]">
              
              {/* Header */}
              <div className="p-4 border-b border-gray-100/50 flex justify-between items-center bg-white/50">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Central de Novidades</h3>
                  <p className="text-[10px] text-gray-500">Atualizações para você</p>
                </div>
                <div className="bg-primary-50 text-primary-600 text-[10px] font-bold px-2 py-1 rounded-full">
                  {config.ITEMS.length} novos
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {config.ITEMS.map((item: any) => {
                  // Fallback icon if saved as string in JSON or object
                  const Icon = typeof item.icon === 'string' ? (IconMap[item.icon] || Bell) : (item.icon || Bell);
                  const isPromo = item.type === 'promo';
                  
                  return (
                    <motion.div 
                      key={item.id}
                      layout
                      className={`p-4 rounded-xl relative overflow-hidden group ${getStyles(item.type)}`}
                    >
                      {isPromo && (
                         <div className="absolute top-0 right-0 w-20 h-20 bg-primary-500/20 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                      )}

                      <div className="flex items-start gap-3 relative z-10">
                        <div className={`p-2 rounded-lg shrink-0 ${isPromo ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-500'}`}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-bold text-xs mb-1 ${isPromo ? 'text-white' : 'text-gray-900'}`}>
                            {item.title}
                          </h4>
                          <p className={`text-[11px] leading-relaxed mb-3 ${isPromo ? 'text-gray-300' : 'text-gray-500'}`}>
                            {item.text}
                          </p>
                          
                          {(item.actionLabel) && (
                            <button 
                              onClick={() => handleAction(item)}
                              className={`
                                flex items-center gap-2 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all active:scale-95 w-full justify-center
                                ${isPromo 
                                  ? 'bg-white text-gray-900 hover:bg-gray-100' 
                                  : 'bg-gray-900 text-white hover:bg-black'
                                }
                              `}
                            >
                              {copiedId === item.id ? (
                                <>Copiado! <Check size={12} /></>
                              ) : (
                                <>
                                  {item.actionLabel} 
                                  {item.code ? <Copy size={12} /> : <ArrowRight size={12} />}
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
