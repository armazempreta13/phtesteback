
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, ShieldCheck } from 'lucide-react';
import { useCookieConsent } from '../hooks/useCookieConsent';
import { Button } from './Button';

export const CookieBanner: React.FC = () => {
  const { isVisible, acceptCookies, declineCookies } = useCookieConsent();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 w-full z-[100] bg-white border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] px-4 py-6 md:py-5"
        >
          <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-5 md:gap-8">
            
            {/* Text Content */}
            <div className="flex items-start gap-4 flex-1 w-full md:w-auto">
               <div className="bg-primary-50 p-2.5 rounded-xl text-primary-600 hidden md:block shrink-0">
                  <Cookie size={24} />
               </div>
               <div className="flex-1">
                  <h4 className="text-gray-900 font-bold text-sm mb-1 flex items-center gap-2">
                    <span className="md:hidden bg-primary-50 p-1 rounded-md text-primary-600"><Cookie size={16} /></span>
                    Privacidade e Transparência
                  </h4>
                  <p className="text-gray-500 text-xs md:text-sm leading-relaxed max-w-3xl">
                    Utilizamos cookies para otimizar a performance, analisar o tráfego e oferecer uma experiência personalizada. 
                    Nenhum dado pessoal sensível é comercializado. Ao continuar navegando, você concorda com nossa Política de Privacidade.
                  </p>
               </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
               <button 
                  onClick={declineCookies}
                  className="flex-1 md:flex-none py-3 px-5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors border border-transparent hover:border-gray-200"
               >
                  Recusar
               </button>
               <Button 
                  onClick={acceptCookies}
                  className="flex-1 md:flex-none bg-gray-900 hover:bg-black text-white shadow-lg shadow-gray-900/10 py-3 rounded-xl"
                  size="md"
                  leftIcon={<ShieldCheck size={16} />}
               >
                  Aceitar Tudo
               </Button>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
