
import React from 'react';
import { motion } from 'framer-motion';
import { Home, AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface NotFoundProps {
  onHome: () => void;
}

export const NotFound: React.FC<NotFoundProps> = ({ onHome }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark p-4 font-sans text-center relative overflow-hidden">
        
        {/* Background Glitch Effect */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 max-w-md w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-2xl"
        >
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={40} className="text-red-500" />
            </div>
            
            <h1 className="text-6xl font-display font-bold text-gray-900 dark:text-white mb-2">404</h1>
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-4">Página não encontrada</h2>
            
            <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                Parece que você navegou para uma área desconhecida do sistema. O link pode estar quebrado ou a página foi removida.
            </p>
            
            <Button onClick={onHome} className="w-full justify-center" size="lg" leftIcon={<Home size={18} />}>
                Voltar para o Início
            </Button>
        </motion.div>
    </div>
  );
};
