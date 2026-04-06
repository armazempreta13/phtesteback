
import React from 'react';
import { motion } from 'framer-motion';
import { SectionTitle } from './SectionTitle';
import { Check, ArrowUpRight, ShieldCheck, Box, Rocket, Briefcase, Settings } from 'lucide-react';
import { Button } from './Button';
import { ServicePackage } from '../types';
import { SmartText } from './SmartText';
import { SEO } from './SEO';
import { useContent } from '../contexts/ContentContext';

interface ServicesProps {
  onSelectService?: (service: ServicePackage) => void;
}

// Icon Map fallback in case JSON loses the function reference
const IconMap: any = {
    Rocket, Briefcase, Settings, Box
};

export const Services: React.FC<ServicesProps> = ({ onSelectService }) => {
  const { content } = useContent();
  const services = content.services;
  
  const handleServiceClick = (pkg: ServicePackage) => {
    if (onSelectService) {
      onSelectService(pkg);
    }
  };

  return (
    <section id="services" className="py-24 md:py-32 bg-gray-50 relative overflow-hidden">
      <SEO 
        title="Serviços de Desenvolvimento Web"
        description="Landing Pages, Sites Institucionais e Projetos Sob Medida. Soluções focadas em conversão e velocidade."
        keywords={["Preço Landing Page", "Orçamento Site", "Desenvolvimento Web Freelancer"]}
      />

      {/* Texture Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

      <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-7xl">
        <SectionTitle 
          title="Soluções Digitais" 
          subtitle="Pacotes desenhados para escalar seu negócio, sem complexidade técnica desnecessária."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {services.map((pkg, index) => {
             const isDark = pkg.highlight;
             // Handle Icon Persistence Issue (JSON)
             const ServiceIcon = typeof pkg.icon === 'function' ? pkg.icon : (IconMap[pkg.icon] || Box);

             return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`group relative flex flex-col h-full rounded-[2rem] transition-all duration-500 hover:-translate-y-2
                  ${isDark 
                    ? 'bg-[#0f172a] text-white shadow-2xl shadow-primary-900/20' 
                    : 'bg-white text-gray-900 border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50'
                  }`}
              >
                {/* Highlight Badge */}
                {pkg.highlight && (
                    <div className="absolute top-6 right-6 bg-primary-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-primary-500/30 animate-pulse">
                        Popular
                    </div>
                )}

                <div className="p-8 md:p-10 flex flex-col h-full">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 text-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${
                      isDark ? 'bg-white/10 text-white' : 'bg-primary-50 text-primary-600'
                  }`}>
                      <ServiceIcon size={32} strokeWidth={1.5} />
                  </div>
                  
                  {/* Header */}
                  <div className="mb-6">
                    <h3 className="text-3xl font-display font-bold mb-2 tracking-tight">{pkg.title}</h3>
                    <p className={`text-sm font-medium uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
                      {pkg.subtitle}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-8 pb-8 border-b border-gray-200/10">
                      <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold tracking-tighter">{pkg.price}</span>
                      </div>
                      <p className={`text-sm mt-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                          <SmartText>{pkg.purpose}</SmartText>
                      </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-10 flex-grow">
                       {pkg.features.slice(0, 5).map((feature, i) => (
                         <div key={i} className="flex items-start gap-3 text-sm">
                           <div className={`mt-0.5 p-0.5 rounded-full shrink-0 ${isDark ? 'bg-primary-500/20 text-primary-400' : 'bg-primary-50 text-primary-600'}`}>
                               <Check size={14} strokeWidth={3} />
                           </div>
                           <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                               <SmartText>{feature}</SmartText>
                           </span>
                         </div>
                       ))}
                  </div>
                  
                  {/* Button */}
                  <div className="mt-auto">
                      <Button 
                        className={`w-full py-4 text-sm font-bold tracking-wide rounded-xl ${isDark ? 'bg-white text-black hover:bg-gray-200' : ''}`}
                        variant={isDark ? 'primary' : 'outline'}
                        onClick={() => handleServiceClick(pkg)}
                      >
                          <span className="flex items-center justify-center gap-2">
                            Ver Detalhes <ArrowUpRight size={18} />
                          </span>
                      </Button>
                  </div>
                </div>
              </motion.div>
             )
          })}
        </div>
      </div>
    </section>
  );
};
