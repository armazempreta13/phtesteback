
import React, { useState, useRef, useEffect } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, AlertCircle, ArrowRight, ArrowUpRight, Zap } from 'lucide-react';
import { Button } from './Button';
import { useContent } from '../contexts/ContentContext';
import { ContactFormData } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export const Contact: React.FC = () => {
  const { content } = useContent();
  const CONTACT_CONFIG = content.contact;
  const SERVICE_PACKAGES = content.services;

  const [formData, setFormData] = useState<ContactFormData>({ 
      name: '', 
      email: '', 
      projectType: SERVICE_PACKAGES[0]?.title || 'Site Profissional', 
      budget: 'Não tenho certeza', 
      message: '' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Ref to track if component is mounted
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    
    if (!CONTACT_CONFIG.FORMSPREE_ID || CONTACT_CONFIG.FORMSPREE_ID === 'SEU_ID_AQUI') {
        if (isMounted.current) {
            setErrorMsg('Erro de configuração: ID do Formspree ausente no código.');
            setIsSubmitting(false);
        }
        return;
    }

    const payload = {
        "Nome do Cliente": formData.name,
        "E-mail de Contato": formData.email,
        "Tipo de Projeto": formData.projectType,
        "Orçamento Estimado": formData.budget,
        "Detalhes da Mensagem": formData.message,
        "_subject": `🚀 Novo Lead: ${formData.projectType} - ${formData.name}`,
        "_replyto": formData.email,
        "_template": "table"
    };
    
    try {
        const response = await fetch(`https://formspree.io/f/${CONTACT_CONFIG.FORMSPREE_ID}`, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        if (!isMounted.current) return;

        if (response.ok) {
            setIsSuccess(true);
            setFormData({ 
                name: '', 
                email: '', 
                projectType: SERVICE_PACKAGES[0]?.title || 'Site Profissional', 
                budget: 'Não tenho certeza', 
                message: '' 
            });
        } else {
            const data = await response.json();
            if (Object.prototype.hasOwnProperty.call(data, 'errors')) {
                 setErrorMsg(data.errors.map((error: any) => error.message).join(", "));
            } else {
                 setErrorMsg("Ocorreu um erro ao enviar o formulário. Tente novamente.");
            }
        }
    } catch (error) {
        if (isMounted.current) {
            setErrorMsg("Erro de conexão. Verifique sua internet.");
        }
    } finally {
        if (isMounted.current) {
            setIsSubmitting(false);
        }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleWhatsAppRedirect = () => {
      const text = `Olá! Acabei de enviar um formulário no seu site, mas gostaria de agilizar o atendimento por aqui.`;
      const url = `https://wa.me/${CONTACT_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
  };

  return (
    <section id="contact" className="py-24 md:py-32 bg-white relative overflow-hidden">
      
      {/* Background Texture (Consistent with Services/Hero) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#7c3aed 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary-50/50 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/4"></div>

      <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-7xl">
        
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          
          {/* Left Column: Info & Context */}
          <div className="lg:w-5/12 space-y-10">
            
            {/* Header Content */}
            <div>
               <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100 text-green-700 text-xs font-bold uppercase tracking-wider mb-6"
               >
                 <span className="relative flex h-2 w-2">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                 </span>
                 Disponível para novos projetos
               </motion.div>
               
               <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 tracking-tight text-gray-900">
                 Vamos construir o <span className="text-primary-600">futuro</span> juntos?
               </h2>
               
               <p className="text-gray-500 text-lg leading-relaxed max-w-md font-light">
                 Seu projeto merece engenharia de ponta. Preencha o formulário ou entre em contato direto pelos canais abaixo.
               </p>
            </div>

            {/* Contact Cards */}
            <div className="space-y-4">
               {/* WhatsApp Card */}
               <a 
                 href={`https://wa.me/${CONTACT_CONFIG.WHATSAPP_NUMBER}`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="group flex items-center gap-5 p-5 rounded-2xl bg-white border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow-md"
               >
                 <div className="w-12 h-12 rounded-xl bg-gray-50 text-green-600 border border-gray-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    <MessageSquare size={24} />
                 </div>
                 <div className="flex-1 relative z-10">
                    <p className="text-xs text-green-600 font-bold uppercase tracking-wider mb-0.5">Resposta Rápida</p>
                    <p className="text-gray-900 font-medium text-lg">WhatsApp</p>
                 </div>
                 <div className="text-gray-400 group-hover:text-green-600 transition-colors">
                    <ArrowRight size={20} />
                 </div>
               </a>

               {/* Email Card */}
               <a 
                 href={`mailto:${CONTACT_CONFIG.EMAIL}`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="group flex items-center gap-5 p-5 rounded-2xl bg-white border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow-md"
               >
                 <div className="w-12 h-12 rounded-xl bg-gray-50 text-primary-600 border border-gray-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    <Mail size={24} />
                 </div>
                 <div className="flex-1 relative z-10">
                    <p className="text-xs text-primary-600 font-bold uppercase tracking-wider mb-0.5">Propostas & Docs</p>
                    <p className="text-gray-900 font-medium text-lg break-all md:break-normal">{CONTACT_CONFIG.EMAIL}</p>
                 </div>
                 <div className="text-gray-400 group-hover:text-primary-600 transition-colors">
                    <ArrowRight size={20} />
                 </div>
               </a>
            </div>
            
            {/* Trust Badges */}
            <div className="pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                    <div className="p-1 rounded bg-yellow-50 text-yellow-600"><Zap size={14} className="fill-yellow-600" /></div>
                    <span>Orçamento em 24h</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                    <div className="p-1 rounded bg-blue-50 text-blue-600"><CheckCircle2 size={14} /></div>
                    <span>Garantia de Entrega</span>
                </div>
            </div>

          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:w-7/12">
            <div className="bg-white border border-gray-100 rounded-[2rem] p-1 shadow-xl shadow-gray-200/50">
                <div className="bg-white rounded-[1.8rem] p-6 md:p-10 border border-gray-100 relative overflow-hidden">
                    
                    <AnimatePresence mode="wait">
                        {isSuccess ? (
                             <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full min-h-[400px] flex flex-col items-center justify-center text-center py-10"
                             >
                                 <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 border border-green-100">
                                     <CheckCircle2 size={48} className="text-green-600" />
                                 </div>
                                 <h3 className="text-2xl font-bold text-gray-900 mb-2">Mensagem Enviada!</h3>
                                 <p className="text-gray-500 mb-8 max-w-sm">
                                     Recebi suas informações com sucesso. Retornarei seu contato o mais breve possível.
                                 </p>
                                 
                                 <div className="space-y-3 w-full max-w-xs">
                                     <Button onClick={handleWhatsAppRedirect} className="w-full bg-green-600 hover:bg-green-700 border-none text-white font-bold" rightIcon={<MessageSquare size={18}/>}>
                                         Agilizar no WhatsApp
                                     </Button>
                                     <button onClick={() => setIsSuccess(false)} className="w-full py-3 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                                         Enviar nova mensagem
                                     </button>
                                 </div>
                             </motion.div>
                        ) : (
                            <motion.form 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onSubmit={handleSubmit} 
                                className="space-y-6 relative z-10"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xl font-bold text-gray-900">Detalhes do Projeto</h3>
                                    <span className="text-xs text-gray-400">* Campos obrigatórios</span>
                                </div>

                                {errorMsg && (
                                    <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm flex items-start gap-2">
                                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                        <p>{errorMsg}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Nome</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all font-medium"
                                            placeholder="Seu nome completo"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">E-mail</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all font-medium"
                                            placeholder="seu@email.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="projectType" className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Interesse</label>
                                        <div className="relative">
                                            <select
                                                id="projectType"
                                                name="projectType"
                                                value={formData.projectType}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 appearance-none cursor-pointer focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all font-medium"
                                            >
                                                {SERVICE_PACKAGES.map((pkg) => (
                                                    <option key={pkg.id} value={pkg.title}>
                                                        {pkg.title}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                <ArrowUpRight size={16} className="rotate-90" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="budget" className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Investimento</label>
                                        <div className="relative">
                                            <select
                                                id="budget"
                                                name="budget"
                                                value={formData.budget}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 appearance-none cursor-pointer focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all font-medium"
                                            >
                                                <option>Não tenho certeza</option>
                                                <option>Até R$ 1.500</option>
                                                <option>R$ 1.500 - R$ 2.500</option>
                                                <option>R$ 2.500 - R$ 5.000</option>
                                                <option>Acima de R$ 5.000</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                <ArrowUpRight size={16} className="rotate-90" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Sobre o Projeto</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        required
                                        rows={4}
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all resize-none font-medium"
                                        placeholder="Conte um pouco sobre seus objetivos e ideias..."
                                    />
                                </div>

                                <Button 
                                    type="submit" 
                                    className="w-full py-4 text-base font-bold tracking-wide shadow-xl shadow-primary-600/20 bg-primary-600 hover:bg-primary-700 border-none text-white" 
                                    size="lg" 
                                    isLoading={isSubmitting}
                                    rightIcon={<Send size={18} />}
                                >
                                    Enviar Solicitação
                                </Button>
                                
                                <p className="text-center text-xs text-gray-400 mt-4">
                                    Seus dados estão seguros e serão utilizados apenas para contato comercial.
                                </p>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
