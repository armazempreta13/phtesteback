
import React from 'react';
import { motion } from 'framer-motion';
import { SectionTitle } from './SectionTitle';
import { 
  Check, ArrowRight, Lock, PieChart, CalendarClock, ArrowDown,
  Search, LayoutTemplate, Cpu, Rocket
} from 'lucide-react';
import { Button } from './Button';
import { SmartText } from './SmartText';
import { InteractiveBackground } from './InteractiveBackground';
import { useContent } from '../contexts/ContentContext';

interface ProcessProps {
  onOpenChat: () => void;
}

// Mapping to ensure icons work even if JSON loaded
const IconMap: any = {
    Search, LayoutTemplate, Cpu, Rocket
};

export const Process: React.FC<ProcessProps> = ({ onOpenChat }) => {
  const { content } = useContent();
  const processSteps = content.process;
  const financialNote = content.financialNote;

  return (
    <section id="process" className="py-24 md:py-32 bg-gray-50/50 relative border-t border-gray-200">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        
        <SectionTitle 
          title="Fluxo de Trabalho" 
          subtitle="Processo linear, previsível e transparente. Da concepção à entrega, sem caixas pretas."
        />

        {/* --- GRID DE PROCESSO (Bento Grid Style) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20 relative">
          
          {/* Linha conectora desktop (só visual) */}
          <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-gray-200 -z-10" />

          {processSteps.map((step, index) => {
            // Icon handling: if it's a function (component) use it, else try map string, else fallback
            const StepIcon = typeof step.icon === 'function' ? step.icon : (IconMap[step.icon as any] || Rocket);
            const isLast = index === processSteps.length - 1;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative flex flex-col h-full"
              >
                {/* Indicador de Passo */}
                <div className="flex items-center justify-between mb-6 bg-gray-50/50 p-2 rounded-lg lg:bg-transparent lg:p-0">
                   <div className="flex items-center gap-4 bg-white lg:bg-gray-50 px-4 py-2 rounded-full border border-gray-200 shadow-sm lg:shadow-none z-10 group-hover:border-primary-500 transition-colors duration-300">
                      <span className="font-mono text-sm font-bold text-gray-400 group-hover:text-primary-600 transition-colors">0{step.id}</span>
                      <div className="h-4 w-px bg-gray-200"></div>
                      <StepIcon size={18} className="text-gray-600 group-hover:text-primary-600 transition-colors" />
                   </div>
                   
                   {/* Seta Mobile */}
                   {!isLast && (
                     <div className="lg:hidden text-gray-300">
                        <ArrowDown size={20} />
                     </div>
                   )}
                </div>

                {/* Card de Conteúdo */}
                <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:shadow-gray-200/50 hover:border-primary-200 transition-all duration-300 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-700 transition-colors">
                    {step.title}
                  </h3>
                  
                  <p className="text-sm text-gray-500 leading-relaxed mb-6 flex-grow">
                    <SmartText>{step.description}</SmartText>
                  </p>

                  <div className="border-t border-gray-100 pt-5 space-y-3">
                    {step.checklist.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                         <div className="mt-0.5 p-0.5 rounded-full bg-green-50 text-green-600 shrink-0">
                           <Check size={10} strokeWidth={3} />
                         </div>
                         <span className="text-xs font-medium text-gray-600"><SmartText>{item}</SmartText></span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* --- SEÇÃO DE INVESTIMENTO --- */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="bg-gray-900 rounded-3xl overflow-hidden shadow-2xl shadow-gray-900/20 text-white relative"
        >
           <div className="absolute inset-0 z-0">
               <InteractiveBackground theme="dark" />
               <div className="absolute inset-0 bg-gray-900/40 pointer-events-none" />
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 relative z-10">
              
              <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-gray-800">
                  <div className="flex items-center gap-3 mb-6">
                     <div className="p-2 bg-primary-500/10 rounded-lg text-primary-400">
                        <Lock size={20} />
                     </div>
                     <span className="text-xs font-bold uppercase tracking-widest text-primary-400">Transação Segura</span>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-display font-bold mb-4 text-white">
                     Investimento Protegido
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-sm md:text-base mb-8">
                     <SmartText>
                       O modelo 50/50 garante compromisso mútuo. O sinal reserva sua prioridade na minha agenda de desenvolvimento, 
                       enquanto a parcela final garante que você só paga o total após ver o resultado aprovado.
                     </SmartText>
                  </p>
                  
                  {financialNote && (
                    <div className="mt-auto bg-gray-800/80 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50 flex gap-3 text-xs text-gray-400">
                       <span className="text-primary-400 shrink-0">ℹ</span>
                       <p>{financialNote}</p>
                    </div>
                  )}
              </div>

              <div className="lg:col-span-5 p-8 md:p-12 bg-gray-800/50 backdrop-blur-sm flex flex-col justify-center">
                  <div className="space-y-6">
                      <div className="flex justify-between items-center group cursor-default">
                          <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 group-hover:border-primary-500 group-hover:text-primary-400 transition-colors">
                                  <CalendarClock size={18} />
                              </div>
                              <div>
                                  <p className="text-xs text-gray-500 font-bold uppercase">Início do Projeto</p>
                                  <p className="font-bold text-white">Sinal de 50%</p>
                              </div>
                          </div>
                          <span className="text-gray-600 group-hover:text-primary-400 transition-colors">Reserva</span>
                      </div>

                      <div className="ml-5 w-px h-8 bg-gray-700 border-l border-dashed border-gray-600"></div>

                      <div className="flex justify-between items-center group cursor-default">
                          <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 group-hover:border-green-500 group-hover:text-green-400 transition-colors">
                                  <PieChart size={18} />
                              </div>
                              <div>
                                  <p className="text-xs text-gray-500 font-bold uppercase">Entrega Final</p>
                                  <p className="font-bold text-white">50% Restante</p>
                              </div>
                          </div>
                          <span className="text-gray-600 group-hover:text-green-400 transition-colors">Aprovação</span>
                      </div>
                  </div>

                  <div className="mt-10 pt-8 border-t border-gray-700">
                      <Button 
                         onClick={onOpenChat}
                         className="w-full bg-white !text-gray-900 hover:bg-gray-200 border-none font-bold py-4 shadow-lg shadow-white/5"
                         rightIcon={<ArrowRight size={18} />}
                      >
                         Solicitar Proposta Comercial
                      </Button>
                  </div>
              </div>

           </div>
        </motion.div>

      </div>
    </section>
  );
};
