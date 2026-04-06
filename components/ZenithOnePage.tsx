import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, Instagram, Linkedin, Mail, MapPin, XCircle } from 'lucide-react';

interface ZenithProps {
  onBack: () => void;
}

export const ZenithOnePage: React.FC<ZenithProps> = ({ onBack }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const navLinks = [
    { label: 'Projetos', href: '#projects' },
    { label: 'Studio', href: '#studio' },
    { label: 'Conceito', href: '#concept' },
    { label: 'Contato', href: '#contact' },
  ];

  return (
    <div className="bg-[#0a0a0a] text-[#e5e5e5] font-sans selection:bg-orange-500 selection:text-white min-h-screen relative overflow-x-hidden">
      
      {/* --- PREVIEW MODE HEADER --- */}
      <div className="fixed top-0 left-0 w-full z-[100] bg-red-600 text-white text-xs font-bold px-4 py-2 flex justify-between items-center shadow-lg">
        <span>MODO VISUALIZAÇÃO DE PORTFÓLIO</span>
        <button onClick={onBack} className="flex items-center gap-2 hover:underline bg-white text-red-600 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider">
          <XCircle size={12} /> Fechar Demo
        </button>
      </div>

      {/* --- NAVBAR --- */}
      <nav className="fixed top-8 left-0 w-full z-50 px-6 md:px-12 py-6 mix-blend-difference text-white">
        <div className="flex justify-between items-center">
          <a href="#" onClick={(e) => handleScroll(e, '#top')} className="text-2xl font-serif tracking-tighter font-bold z-50 relative">
            ZENITH<span className="text-orange-500">.</span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-8 items-center">
            {navLinks.map((link) => (
              <a 
                key={link.label} 
                href={link.href} 
                onClick={(e) => handleScroll(e, link.href)}
                className="text-sm uppercase tracking-widest hover:text-orange-500 transition-colors cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Mobile Toggle */}
          <button onClick={toggleMenu} className="md:hidden z-50 relative">
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* --- MOBILE MENU --- */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-[#0a0a0a] flex flex-col items-center justify-center gap-8 md:hidden"
          >
            {navLinks.map((link) => (
              <a 
                key={link.label} 
                href={link.href} 
                onClick={(e) => handleScroll(e, link.href)}
                className="text-3xl font-serif hover:text-orange-500 transition-colors cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- HERO SECTION --- */}
      <header id="top" className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2000&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-40 scale-105"
            alt="Architecture Hero"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-20">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-orange-500 text-sm md:text-base uppercase tracking-[0.3em] mb-4 font-bold"
          >
            Est. 2024
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-7xl lg:text-9xl font-serif font-thin tracking-tight leading-[0.9] mb-8"
          >
            Forma <span className="italic text-gray-500">&</span><br/> Função.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-gray-400 max-w-lg mx-auto leading-relaxed text-sm md:text-base font-light"
          >
            Redefinindo o espaço urbano através de uma arquitetura brutalista e minimalista. Criamos ambientes que contam histórias silenciosas.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <div className="w-[1px] h-16 bg-gradient-to-b from-orange-500 to-transparent"></div>
          <span className="text-[10px] uppercase tracking-widest text-gray-500">Scroll</span>
        </motion.div>
      </header>

      {/* --- CONCEPT / ABOUT / STUDIO --- */}
      {/* Assigning both IDs to this section or wrapping to handle both anchors */}
      <section id="studio" className="relative">
        <div id="concept" className="absolute -top-24"></div> {/* Anchor offset */}
        <div className="py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif mb-8 leading-tight">
                O vazio não é ausência.<br/>
                <span className="text-orange-500 italic">É potencial.</span>
              </h2>
              <p className="text-gray-400 leading-relaxed mb-6 font-light">
                Na Zenith, acreditamos que a arquitetura deve desaparecer para deixar a vida acontecer. Nossos projetos buscam a harmonia entre o concreto bruto e a luz natural, criando refúgios de contemplação em meio ao caos urbano.
              </p>
              <a 
                href="#projects" 
                onClick={(e) => handleScroll(e, '#projects')}
                className="inline-flex items-center gap-2 text-sm uppercase tracking-widest border-b border-orange-500 pb-1 hover:text-orange-500 transition-colors cursor-pointer"
              >
                Conheça nossos Projetos <ArrowRight size={14} />
              </a>
            </div>
            <div className="relative">
              <div className="absolute top-4 -right-4 w-full h-full border border-orange-500/30 z-0"></div>
              <img 
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop" 
                alt="Interior Minimalista"
                className="relative z-10 w-full h-[500px] object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- NUMBERS BANNER --- */}
      <section className="border-y border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
           {[
             { num: '45+', label: 'Projetos' },
             { num: '12', label: 'Prêmios' },
             { num: '08', label: 'Países' },
             { num: '100%', label: 'Autoral' },
           ].map((item, i) => (
             <div key={i}>
               <span className="block text-3xl md:text-5xl font-serif mb-2">{item.num}</span>
               <span className="text-xs uppercase tracking-widest text-gray-500">{item.label}</span>
             </div>
           ))}
        </div>
      </section>

      {/* --- PROJECTS GALLERY --- */}
      <section id="projects" className="py-24 px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 max-w-7xl mx-auto">
          <div>
            <span className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-2 block">Portfólio</span>
            <h2 className="text-3xl md:text-5xl font-serif">Obras Recentes</h2>
          </div>
          <button className="hidden md:block text-sm border border-white/20 px-6 py-3 hover:bg-white hover:text-black transition-all uppercase tracking-wider">
            Ver Todos
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4 max-w-7xl mx-auto">
          {[
            { title: "Casa Horizonte", loc: "São Paulo, BR", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop" },
            { title: "Galeria M", loc: "Lisboa, PT", img: "https://images.unsplash.com/photo-1518005052357-e9871951f3a2?q=80&w=800&auto=format&fit=crop" },
            { title: "Loft Industrial", loc: "New York, USA", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop" }
          ].map((project, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -10 }}
              className="group relative h-[400px] md:h-[500px] cursor-pointer overflow-hidden bg-gray-900"
            >
              <img 
                src={project.img} 
                alt={project.title}
                className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                 <span className="text-orange-500 text-xs uppercase tracking-wider mb-1">{project.loc}</span>
                 <h3 className="text-2xl font-serif">{project.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-8 text-center md:hidden">
            <button className="text-sm border border-white/20 px-8 py-4 uppercase tracking-wider w-full">
                Ver Todos os Projetos
            </button>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer id="contact" className="bg-[#111] py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          <div className="space-y-6">
            <h3 className="text-2xl font-serif">ZENITH.</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Arquitetura é a escultura habitada. Criamos espaços que inspiram e perduram.
            </p>
          </div>

          <div>
             <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-6">Contato</h4>
             <ul className="space-y-4 text-gray-400 text-sm">
               <li className="flex items-center gap-3"><Mail size={16} className="text-orange-500"/> ola@zenith.arch</li>
               <li className="flex items-center gap-3"><MapPin size={16} className="text-orange-500"/> Av. Paulista, 1000 - SP</li>
             </ul>
          </div>

          <div>
             <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-6">Social</h4>
             <div className="flex gap-4">
               <a href="#" className="w-10 h-10 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all rounded-full">
                 <Instagram size={18} />
               </a>
               <a href="#" className="w-10 h-10 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all rounded-full">
                 <Linkedin size={18} />
               </a>
             </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-6">Newsletter</h4>
            <div className="flex border-b border-white/20 pb-2">
              <input type="email" placeholder="Seu email" className="bg-transparent border-none outline-none w-full text-sm placeholder-gray-600"/>
              <button className="text-orange-500 text-sm font-bold uppercase">OK</button>
            </div>
          </div>

        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between text-xs text-gray-600">
           <p>© 2024 Zenith Architecture. All rights reserved.</p>
           <p>Designed by PH.dev</p>
        </div>
      </footer>
    </div>
  );
};