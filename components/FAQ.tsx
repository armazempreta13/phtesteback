
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, MessageSquare } from 'lucide-react';
import { SectionTitle } from './SectionTitle';
import { SEO } from './SEO';
import { Button } from './Button';
import { SmartText } from './SmartText';
import { useContent } from '../contexts/ContentContext';

interface FAQProps {
  onOpenChat: () => void;
}

export const FAQ: React.FC<FAQProps> = ({ onOpenChat }) => {
  const { content } = useContent();
  const faqData = content.faq;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-white relative overflow-hidden">
      <SEO 
        title="Perguntas Frequentes - FAQ" 
        description="Tire suas dúvidas sobre desenvolvimento de sites, prazos, custos e tecnologia."
        faq={faqData} 
      />

      <div className="container mx-auto px-4 md:px-8 max-w-4xl relative z-10">
        <SectionTitle 
          title="Dúvidas Frequentes" 
          subtitle="Respostas diretas para as perguntas mais comuns sobre o processo de desenvolvimento."
        />

        <div className="space-y-4">
          {faqData.map((item, index) => {
            const isOpen = openIndex === index;
            
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.05 }}
                className={`border rounded-2xl transition-all duration-300 ${isOpen ? 'border-primary-200 bg-primary-50/30 shadow-lg shadow-primary-900/5' : 'border-gray-200 bg-white hover:border-primary-100'}`}
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-left focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className={`text-base md:text-lg font-bold transition-colors ${isOpen ? 'text-primary-700' : 'text-gray-800'}`}>
                    {item.question}
                  </span>
                  <div className={`p-2 rounded-full transition-all duration-300 ${isOpen ? 'bg-primary-100 text-primary-600 rotate-180' : 'bg-gray-100 text-gray-400'}`}>
                    <ChevronDown size={20} />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 md:px-6 pb-6 pt-0">
                        <div className="h-px w-full bg-primary-100/50 mb-4" />
                        <p className="text-gray-600 leading-relaxed">
                          <SmartText>{item.answer}</SmartText>
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12 text-center bg-gray-50 rounded-2xl p-8 border border-gray-100">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-sm text-primary-600 mb-4">
                <HelpCircle size={24} />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Sua dúvida não está aqui?</h4>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Não se preocupe. Meu assistente virtual pode te ajudar ou você pode falar diretamente comigo.
            </p>
            <Button onClick={onOpenChat} rightIcon={<MessageSquare size={18} />}>
                Falar com Suporte
            </Button>
        </div>

      </div>
    </section>
  );
};
