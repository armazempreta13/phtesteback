
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Lightbulb } from 'lucide-react';
import { ViewType } from '../types';
import { useCookieConsent } from '../hooks/useCookieConsent';

interface BlogPromoProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  onVisibilityChange?: (visible: boolean) => void;
}

export const BlogPromo: React.FC<BlogPromoProps> = ({ currentView, onNavigate, onVisibilityChange }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { isVisible: isCookieVisible } = useCookieConsent();

  useEffect(() => {
    if (onVisibilityChange) {
      onVisibilityChange(isVisible);
    }
  }, [isVisible, onVisibilityChange]);

  useEffect(() => {
    // Não mostrar se já estiver no blog
    if (currentView === 'blog') {
      setIsVisible(false);
      return;
    }

    // Verificar se já foi fechado nesta sessão
    const hasClosed = sessionStorage.getItem('ph_blog_promo_closed');
    if (hasClosed) return;

    // Mostrar após 8 segundos de navegação
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 8000);

    return () => clearTimeout(timer);
  }, [currentView]);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('ph_blog_promo_closed', 'true');
  };

  const handleNavigate = () => {
    setIsVisible(false);
    onNavigate('blog');
  };

  // Logic for Vertical Position
  // Mobile: Needs to be above BottomNav (approx 80px) + potential cookie banner
  // Desktop: Bottom-6 + potential cookie banner
  const getBottomClass = () => {
      if (isCookieVisible) return 'bottom-32 md:bottom-36'; // Above Cookie Banner
      return 'bottom-20 md:bottom-6'; // Standard (Mobile Above Nav, Desktop Bottom)
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -50, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`fixed z-[45] max-w-[280px] w-auto left-4 transition-all duration-500 ease-in-out ${getBottomClass()}`}
        >
          <div className="bg-white border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-2xl p-4 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
            
            <button 
              onClick={handleClose}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors z-20"
            >
              <X size={16} />
            </button>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600">
                  <Lightbulb size={18} className="fill-primary-100" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-primary-600 uppercase tracking-wider">Dica do Especialista</p>
                  <h4 className="font-bold text-gray-900 text-xs leading-tight">Antes de contratar...</h4>
                </div>
              </div>

              <p className="text-gray-600 text-[11px] leading-relaxed mb-3">
                Entenda como a <strong>Engenharia de Frontend</strong> economiza seu dinheiro.
              </p>

              <button 
                onClick={handleNavigate}
                className="w-full flex items-center justify-between bg-gray-900 hover:bg-gray-800 text-white px-3 py-2 rounded-lg text-[10px] font-bold transition-all shadow-lg group/btn"
              >
                <span>Ler Artigo Completo</span>
                <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
