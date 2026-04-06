
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, ChevronDown, Clock, Code2, HelpCircle, MessageSquare, ShieldCheck, XCircle, Zap } from 'lucide-react';
import { ServicePackage } from '../types';
import { Button } from './Button';
import { WHATSAPP_NUMBER } from '../constants';
import { SmartText } from './SmartText';
import { SEO } from './SEO';

interface ServiceDetailProps {
  service: ServicePackage;
  onBack: () => void;
  onHire: () => void;
}

export const ServiceDetail: React.FC<ServiceDetailProps> = ({ service, onBack, onHire }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'scope' | 'faq'>('overview');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Scroll to top when mounted
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleWhatsApp = () => {
    const text = `Olá! Vi os detalhes do pacote *${service.title}* no seu portfólio e gostaria de saber mais.`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, '_self');
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.title,
    "provider": {
        "@type": "Person",
        "name": "PH Development"
    },
    "description": service.purpose,
    "offers": {
        "@type": "Offer",
        "priceCurrency": "BRL",
        "price": service.price.replace(/[^0-9,]/g, '').replace(',', '.'), // Basic extraction, assumes "R$ 900" format
        "availability": "https://schema.org/InStock"
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-white pt-20 pb-20 relative z-40 font-sans w-full overflow-x-hidden"
    >
      <SEO 
        title={service.title}
        description={service.purpose}
        keywords={service.techStack}
        type="service"
        schema={serviceSchema}
        faq={service.faqs}
        breadcrumbs={[
            { name: "Home", item: "/" }, 
            { name: "Serviços", item: "/#services" },
            { name: service.title, item: `#service-${service.id}` }
        ]}
      />

      {/* Hero Header */}
      <div className="bg-gray-50 border-b border-gray-100 py-12 md:py-16 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          
          {/* Breadcrumb / Back */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-8">
            <button onClick={onBack} className="hover:text-primary-600 transition-colors flex items-center gap-1">
                <ArrowLeft size={14} /> Voltar
            </button>
            <span>/</span>
            <span>Serviços</span>
            <span>/</span>
            <span className="font-medium text-gray-900">{service.title}</span>
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
            <div className={`p-5 rounded-2xl shadow-lg shadow-primary-900/5 ${service.highlight ? 'bg-gray-900 text-white' : 'bg-white text-primary-600 border border-gray-100'}`}>
               <service.icon size={42} strokeWidth={1.5} />
            </div>
            <div>
               <div className="flex items-center gap-3 mb-2">
                 {service.highlight && (
                   <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                     Recomendado
                   </span>
                 )}
                 <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                   Frontend Only
                 </span>
               </div>
               <h1 className="text-3xl md:text-5xl font-display font-bold text-gray-900 mb-2">
                 {service.title}
               </h1>
               <p className="text-xl text-gray-500 max-w-2xl">
                 <SmartText>{service.subtitle}</SmartText>
               </p>
            </div>
          </div>
        </div>
        {/* Decorative BG */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-100/50 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          
          {/* Main Content Area */}
          <div className="lg:w-2/3">
            
            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-200 mb-8 overflow-x-auto scrollbar-hide">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`px-6 py-4 text-sm font-medium transition-colors relative whitespace-nowrap ${
                    activeTab === 'overview' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Visão Geral
                  {activeTab === 'overview' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600" />}
                </button>
                <button 
                  onClick={() => setActiveTab('scope')}
                  className={`px-6 py-4 text-sm font-medium transition-colors relative whitespace-nowrap ${
                    activeTab === 'scope' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  O que está incluso
                  {activeTab === 'scope' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600" />}
                </button>
                <button 
                  onClick={() => setActiveTab('faq')}
                  className={`px-6 py-4 text-sm font-medium transition-colors relative whitespace-nowrap flex items-center gap-2 ${
                    activeTab === 'faq' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Dúvidas Frequentes
                  {service.faqs && service.faqs.length > 0 && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === 'faq' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}>
                      {service.faqs.length}
                    </span>
                  )}
                  {activeTab === 'faq' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600" />}
                </button>
            </div>

            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                
                {/* TAB: OVERVIEW */}
                {activeTab === 'overview' && (
                  <motion.div 
                    key="overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-10"
                  >
                    <section>
                      <h3 className="text-xl font-bold font-display text-gray-900 mb-4">Sobre a Solução</h3>
                      <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
                        <SmartText>{service.fullDescription}</SmartText>
                      </p>
                    </section>

                    <section>
                      <h3 className="text-xl font-bold font-display text-gray-900 mb-4">Stack Tecnológica</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {service.techStack.map((tech) => (
                          <div key={tech} className="bg-gray-50 border border-gray-100 p-3 rounded-lg flex items-center gap-3">
                            <div className="bg-white p-1.5 rounded-md text-primary-600 shadow-sm shrink-0">
                              <Code2 size={16} />
                            </div>
                            <span className="font-medium text-gray-700 text-sm">{tech}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                    
                    <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-4">
                        <div className="bg-white p-2 rounded-full text-blue-600 shadow-sm shrink-0">
                             <ShieldCheck size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-blue-900 text-sm mb-1">Garantia de Entrega</h4>
                            <p className="text-blue-800/80 text-sm">
                                Este projeto inclui 30 dias de suporte gratuito para correção de bugs após a entrega. 
                                Código 100% seu, sem taxas mensais ocultas.
                            </p>
                        </div>
                    </div>
                  </motion.div>
                )}

                {/* TAB: SCOPE */}
                {activeTab === 'scope' && (
                  <motion.div 
                    key="scope"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Included Column */}
                        <div className="bg-green-50/50 border border-green-100 rounded-2xl p-6">
                            <h3 className="text-green-800 font-bold mb-6 flex items-center gap-2">
                                <CheckCircle2 size={20} className="text-green-600"/> O que está INCLUSO
                            </h3>
                            <ul className="space-y-4">
                                {service.deliverables.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-700 text-sm">
                                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                                        <span className="leading-snug">
                                          <SmartText>{item}</SmartText>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Not Included Column */}
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 opacity-80">
                            <h3 className="text-gray-700 font-bold mb-6 flex items-center gap-2">
                                <XCircle size={20} className="text-gray-400"/> O que NÃO está incluso
                            </h3>
                            <ul className="space-y-4">
                                {service.notIncluded?.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-500 text-sm">
                                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                                        <span className="leading-snug">
                                          <SmartText>{item}</SmartText>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <p className="text-xs text-center text-gray-400 mt-6 italic">
                        * Itens adicionais podem ser contratados à parte mediante novo orçamento.
                    </p>
                  </motion.div>
                )}

                {/* TAB: FAQ */}
                {activeTab === 'faq' && (
                  <motion.div 
                    key="faq"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                     <h3 className="text-xl font-bold font-display text-gray-900 mb-6">Dúvidas Comuns deste Pacote</h3>
                     
                     {service.faqs && service.faqs.length > 0 ? (
                       service.faqs.map((faq, index) => (
                         <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                             <button 
                                onClick={() => toggleFaq(index)}
                                className="w-full flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition-colors text-left"
                             >
                                 <span className="font-semibold text-gray-800 text-sm md:text-base"><SmartText>{faq.question}</SmartText></span>
                                 <ChevronDown 
                                    size={20} 
                                    className={`text-gray-400 shrink-0 transition-transform duration-300 ${openFaqIndex === index ? 'rotate-180' : ''}`}
                                 />
                             </button>
                             <AnimatePresence>
                                 {openFaqIndex === index && (
                                     <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="bg-gray-50 px-5 pb-5 pt-0 text-sm text-gray-600 leading-relaxed border-t border-gray-100"
                                     >
                                         <div className="pt-4"><SmartText>{faq.answer}</SmartText></div>
                                     </motion.div>
                                 )}
                             </AnimatePresence>
                         </div>
                       ))
                     ) : (
                       <p className="text-gray-500 text-center py-8">Nenhuma dúvida cadastrada para este pacote.</p>
                     )}

                     <div className="mt-8 p-6 bg-primary-50 rounded-xl text-center">
                         <p className="text-primary-800 font-medium mb-2">Ainda tem dúvidas?</p>
                         <button onClick={onHire} className="text-sm text-primary-600 hover:text-primary-800 underline underline-offset-4">
                             Pergunte ao Chatbot
                         </button>
                     </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>

          {/* Sidebar (Sticky) */}
          <div className="lg:w-1/3">
             <div className="sticky top-24 space-y-6">
               
               {/* Pricing Card */}
               <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 md:p-8 overflow-hidden relative">
                 <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-400 to-primary-600"></div>
                 
                 <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Investimento Estimado</p>
                 <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">{service.price}</span>
                 </div>
                 
                 <div className="space-y-3 mb-6">
                    <Button onClick={onHire} className="w-full font-bold shadow-lg shadow-primary-600/20" size="lg" rightIcon={<MessageSquare size={18} />}>
                      Solicitar Orçamento
                    </Button>
                    <Button onClick={handleWhatsApp} variant="outline" className="w-full bg-white hover:bg-gray-50">
                      Falar no WhatsApp
                    </Button>
                 </div>

                 <div className="flex items-center justify-center gap-2 text-xs font-medium text-gray-500 pt-4 border-t border-gray-100">
                    <Clock size={14} className="text-primary-500" />
                    <span>Entrega: <span className="text-gray-900">{service.timeline}</span></span>
                 </div>
               </div>

               {/* Next Steps Mini-Widget */}
               <div className="bg-white rounded-2xl border border-gray-200 p-6">
                   <h4 className="font-bold text-gray-900 mb-4 text-sm">Como contratar:</h4>
                   <div className="space-y-4">
                       <div className="flex gap-3">
                           <div className="flex flex-col items-center">
                               <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 font-bold text-xs flex items-center justify-center">1</div>
                               <div className="w-0.5 h-full bg-gray-100 mt-1"></div>
                           </div>
                           <div>
                               <p className="text-xs font-bold text-gray-800">Briefing (Chatbot)</p>
                               <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Conte sobre o projeto no chat.</p>
                           </div>
                       </div>
                       <div className="flex gap-3">
                           <div className="flex flex-col items-center">
                               <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 font-bold text-xs flex items-center justify-center">2</div>
                               <div className="w-0.5 h-full bg-gray-100 mt-1"></div>
                           </div>
                           <div>
                               <p className="text-xs font-bold text-gray-800">Proposta & Pagamento</p>
                               <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Receba o orçamento final e pague o sinal.</p>
                           </div>
                       </div>
                       <div className="flex gap-3">
                           <div className="flex flex-col items-center">
                               <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 font-bold text-xs flex items-center justify-center">3</div>
                           </div>
                           <div>
                               <p className="text-xs font-bold text-gray-800">Início Imediato</p>
                               <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Começo o desenvolvimento.</p>
                           </div>
                       </div>
                   </div>
               </div>

             </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};
