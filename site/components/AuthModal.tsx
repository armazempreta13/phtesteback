import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Lock, User, ArrowRight, AlertCircle, Zap } from 'lucide-react';
import { Button } from './Button';
import { InteractiveBackground } from './InteractiveBackground';
import { api } from '../lib/api';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (role: 'admin' | 'client') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
        const response = await api.auth.login(email, password);
        onLoginSuccess(response.role);
    } catch (err: any) {
        setError(err.message || 'Falha na autenticacao.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-[#0F1115] rounded-3xl shadow-2xl border border-white/20 overflow-hidden max-h-[90vh] overflow-y-auto"
        >
            <div className="relative h-32 bg-gradient-to-br from-primary-600 to-indigo-800 flex items-center justify-center overflow-hidden shrink-0">
                <div className="absolute inset-0 z-0">
                    <InteractiveBackground theme="dark" />
                </div>
                <div className="absolute inset-0 bg-primary-900/20 z-0 pointer-events-none"></div>

                <h2 className="text-3xl font-display font-bold text-white relative z-10 tracking-tight drop-shadow-md">
                    Painel de Controle
                </h2>

                <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/20 rounded-full p-2 transition-colors z-20">
                    <X size={20} />
                </button>
            </div>

            <div className="p-8">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm"
                    >
                        <AlertCircle size={18} />
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleAuth} className="space-y-5">
                    <div className="space-y-2 opacity-60 hover:opacity-100 transition-opacity">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-12 pr-4 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="admin@phstatic.com.br"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 opacity-60 hover:opacity-100 transition-opacity">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-12 pr-4 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="Sua senha"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full shadow-xl shadow-primary-600/20 py-3.5 rounded-xl font-bold bg-gray-900 text-white hover:bg-black"
                        isLoading={loading}
                        rightIcon={<ArrowRight size={18} />}
                    >
                        Entrar
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                        <Zap size={12} className="text-yellow-500"/> Backend Express conectado
                    </p>
                </div>
            </div>
        </motion.div>
    </div>
  );
};
