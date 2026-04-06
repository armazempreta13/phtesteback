
import React from 'react';
import { Instagram, Mail, Code2, ArrowUpRight, Heart } from 'lucide-react';
import { NavigationProps } from '../types';
import { useContent } from '../contexts/ContentContext';

export const Footer: React.FC<Pick<NavigationProps, 'onNavigate'>> = ({ onNavigate }) => {
  const { content } = useContent(); // CONSUME CONTEXT
  const CONTACT_CONFIG = content.contact;
  const SITE_CONFIG = content.site;
  const NAV_ITEMS = content.navItems;
  const SERVICE_PACKAGES = content.services;

  const currentYear = new Date().getFullYear();
  const navLinks = NAV_ITEMS.filter(item => item.id !== 'contact');

  return (
    <footer className="bg-[#0a0a0a] text-gray-400 font-sans pt-20 pb-10 border-t border-gray-900 relative overflow-hidden">
      
      {/* Decorative Gradients & Glows */}
      <div className="absolute top-0 left-1/4 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-primary-900 to-transparent opacity-50"></div>
      <div className="absolute -top-[200px] -right-[200px] w-[500px] h-[500px] bg-primary-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">
          
          {/* 1. Brand Identity */}
          <div className="lg:col-span-4 space-y-8">
             <button onClick={() => onNavigate('home')} className="group flex items-center gap-2 focus:outline-none">
                <div className="bg-gray-900 p-2.5 rounded-xl border border-gray-800 group-hover:border-primary-900 group-hover:bg-gray-800 transition-all duration-300">
                   <Code2 size={24} className="text-white group-hover:text-primary-500 transition-colors" />
                </div>
                <div className="flex flex-col items-start">
                    <span className="text-xl font-display font-bold text-white tracking-tight leading-none">PH<span className="text-primary-600">.static</span></span>
                    <span className="text-[10px] font-medium text-gray-600 uppercase tracking-widest mt-0.5">{SITE_CONFIG.SUBTITLE}</span>
                </div>
             </button>
             
             <p className="text-gray-500 leading-relaxed max-w-sm text-sm font-light">
               {SITE_CONFIG.DESCRIPTION}
             </p>

             <div className="flex gap-4">
                {[
                  { Icon: Instagram, href: CONTACT_CONFIG.INSTAGRAM_URL, label: "Instagram" }
                ].map((social) => (
                  <a 
                    key={social.label}
                    href={social.href} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary-600 hover:border-primary-500 hover:-translate-y-1 transition-all duration-300 shadow-lg shadow-black/20"
                    aria-label={social.label}
                  >
                    <social.Icon size={18} />
                  </a>
                ))}
             </div>
          </div>

          {/* 2. Navigation */}
          <div className="lg:col-span-2 lg:col-start-6">
             <h4 className="text-white font-bold mb-8 text-xs uppercase tracking-widest flex items-center gap-2 before:w-1.5 before:h-1.5 before:bg-primary-600 before:rounded-full">
                Menu
             </h4>
             <ul className="space-y-4">
               {navLinks.map((item) => (
                 <li key={item.label}>
                   <button 
                      onClick={() => onNavigate(item.id)} 
                      className="text-sm text-gray-500 hover:text-primary-400 transition-all duration-300 flex items-center gap-3 group w-full text-left"
                   >
                      <span className="w-1 h-1 rounded-full bg-gray-800 group-hover:bg-primary-500 transition-colors"></span>
                      <span className="group-hover:translate-x-1 transition-transform">{item.label}</span>
                   </button>
                 </li>
               ))}
             </ul>
          </div>

          {/* 3. Services */}
          <div className="lg:col-span-3">
             <h4 className="text-white font-bold mb-8 text-xs uppercase tracking-widest flex items-center gap-2 before:w-1.5 before:h-1.5 before:bg-primary-600 before:rounded-full">
                Serviços
             </h4>
             <ul className="space-y-4">
                {SERVICE_PACKAGES.map((pkg) => (
                   <li key={pkg.id}>
                      <button 
                        onClick={() => onNavigate('services')}
                        className="text-sm text-gray-500 hover:text-white transition-all duration-300 flex items-center justify-between group w-full text-left border-b border-gray-900/50 pb-2 hover:border-gray-700"
                      >
                         <span>{pkg.title}</span>
                         <ArrowUpRight size={12} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary-500" />
                      </button>
                   </li>
                ))}
             </ul>
          </div>

          {/* 4. Contact */}
          <div className="lg:col-span-2">
             <h4 className="text-white font-bold mb-8 text-xs uppercase tracking-widest flex items-center gap-2 before:w-1.5 before:h-1.5 before:bg-primary-600 before:rounded-full">
                Contato
             </h4>
             <div className="flex flex-col gap-4">
                 <a 
                    href={`mailto:${CONTACT_CONFIG.EMAIL}`}
                    className="text-sm font-medium text-gray-300 hover:text-primary-400 transition-colors flex items-center gap-2 group"
                 >
                    <Mail size={16} className="text-gray-600 group-hover:text-primary-500 transition-colors" />
                    {CONTACT_CONFIG.EMAIL}
                 </a>
                 <button 
                    onClick={() => onNavigate('contact')}
                    className="mt-2 text-xs font-bold text-gray-900 bg-white hover:bg-gray-100 px-5 py-3 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-white/5 text-center"
                 >
                    Iniciar Projeto
                 </button>
             </div>
          </div>

        </div>
        
        {/* Footer Bottom */}
        <div className="pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center text-xs text-gray-600">
            <p>{SITE_CONFIG.COPYRIGHT}</p>
            <div className="flex gap-4">
                <button onClick={() => onNavigate('privacy')} className="hover:text-gray-400 transition-colors">Política de Privacidade</button>
                <button onClick={() => onNavigate('terms')} className="hover:text-gray-400 transition-colors">Termos de Uso</button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-700 bg-gray-900/50 px-3 py-1.5 rounded-full border border-gray-800">
              <span>Desenvolvido com</span>
              <Heart size={10} className="text-red-500 fill-red-500 animate-pulse" />
              <span>e muito café. TESTE</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
