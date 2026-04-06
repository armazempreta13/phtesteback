import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, ArrowRight, Layers, PenTool, Monitor,
  Users, ChevronDown, Mail, MapPin, Star, XCircle, Sparkles
} from 'lucide-react';

interface NexusProps {
  onBack?: () => void;
}

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 } as any,
  transition: { duration: 0.7, ease: 'easeOut' as const },
};

export const NexusSite: React.FC<NexusProps> = ({ onBack }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Projects', href: '#projects' },
    { label: 'Team', href: '#team' },
  ];

  return (
    <div className="bg-[#1a1a2e] text-white font-sans min-h-screen overflow-x-hidden selection:bg-[#c9a84c] selection:text-black">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
        @keyframes slow-drift { 0%,100% { transform: translate(0,0); } 50% { transform: translate(15px,-20px); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
      `}</style>

      {/* PREVIEW BANNER */}
      <div className="fixed top-0 left-0 w-full z-[100] bg-gradient-to-r from-[#c9a84c] to-[#a88a3a] text-black text-[10px] font-bold px-5 py-1.5 flex justify-between items-center shadow-2xl">
        <span className="font-inter tracking-[0.2em]">MODO VISUALIZAÇÃO</span>
        <button onClick={onBack} className="flex items-center gap-1.5 hover:bg-black/10 px-3 py-1 rounded-full transition-all">
          <XCircle size={12} /> Fechar Demo
        </button>
      </div>

      {/* NAVIGATION */}
      <nav className="fixed top-8 left-0 w-full z-50 px-6 md:px-12 py-5 bg-[#1a1a2e]/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="#top" onClick={(e) => handleScroll(e, '#top')} className="text-2xl font-playfair font-bold tracking-tight z-50 relative">
            NEXUS<span className="text-[#c9a84c]">.</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} onClick={(e) => handleScroll(e, link.href)}
                className="font-inter text-xs uppercase tracking-[0.2em] text-white/60 hover:text-[#c9a84c] transition-colors relative group">
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#c9a84c] group-hover:w-full transition-all duration-300"/>
              </a>
            ))}
            <button className="font-inter px-6 py-2.5 border border-[#c9a84c]/40 text-[#c9a84c] hover:bg-[#c9a84c] hover:text-black transition-all text-[10px] font-semibold uppercase tracking-[0.2em]">
              Get in Touch
            </button>
          </div>

          <button className="md:hidden text-white z-50 relative" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[#1a1a2e] flex flex-col items-center justify-center gap-8 md:hidden">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} onClick={(e) => handleScroll(e, link.href)}
                className="font-playfair text-4xl text-white hover:text-[#c9a84c] transition-colors">
                {link.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO */}
      <section id="top" className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2400&auto=format&fit=crop"
            alt="" className="w-full h-full object-cover scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-[#1a1a2e]/80 to-[#1a1a2e]/40" />
          <div className="absolute inset-0 bg-[#c9a84c]/5 mix-blend-overlay" />
        </div>

        <div className="absolute top-1/4 right-10 w-72 h-72 bg-[#c9a84c]/10 rounded-full blur-[120px]" style={{ animation: 'slow-drift 8s ease-in-out infinite' }} />
        <div className="absolute bottom-1/4 left-10 w-96 h-96 bg-white/5 rounded-full blur-[140px]" style={{ animation: 'slow-drift 10s ease-in-out infinite reverse' }} />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="font-inter text-[#c9a84c] text-xs uppercase tracking-[0.4em] mb-6 font-semibold">
            Architecture & Design Studio
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}
            className="font-playfair text-5xl md:text-7xl lg:text-8xl font-thin tracking-tight leading-[0.95] mb-8">
            Crafting Spaces<br/>
            <span className="italic text-[#c9a84c]/80">That Endure</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="font-inter text-white/50 max-w-xl mx-auto text-sm md:text-base font-light leading-relaxed mb-12">
            Where architectural vision meets meticulous design. We shape environments
            that transcend the ordinary and leave lasting impressions.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="group font-inter px-10 py-4 bg-[#c9a84c] text-black text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#dbc060] transition-all flex items-center justify-center gap-3">
                View Our Work <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
              </button>
              <button className="font-inter px-10 py-4 border border-white/15 text-white/70 text-xs uppercase tracking-[0.2em] hover:border-[#c9a84c]/50 hover:text-[#c9a84c] transition-all">
                Our Story
              </button>
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-px h-14 bg-gradient-to-b from-[#c9a84c] to-transparent"/>
          <span className="font-inter text-[9px] uppercase tracking-[0.3em] text-white/30">Scroll</span>
        </motion.div>
      </section>

      {/* STATS */}
      <section className="py-14 bg-[#161625] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {[
            { icon: Layers, value: '120+', label: 'Projects Delivered' },
            { icon: Star, value: '15', label: 'Design Awards' },
            { icon: Users, value: '40+', label: 'Team Members' },
            { icon: Sparkles, value: '98%', label: 'Client Retention' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i}>
                <Icon className="mx-auto mb-3 text-[#c9a84c]/60" size={24} />
                <div className="font-playfair text-3xl md:text-4xl mb-1">{s.value}</div>
                <div className="font-inter text-[10px] uppercase tracking-[0.25em] text-white/40">{s.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-28 md:py-36 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <motion.p {...fadeUp} className="font-inter text-[#c9a84c] text-[10px] uppercase tracking-[0.4em] mb-4 font-semibold">
              Our Philosophy
            </motion.p>
            <motion.h2 {...{...fadeUp, transition: { delay: 0.1 }}} className="font-playfair text-3xl md:text-5xl font-normal leading-snug mb-8">
              Design rooted in<br/>purpose, refined by <span className="italic text-[#c9a84c]/70">detail</span>
            </motion.h2>
            <motion.p {...{...fadeUp, transition: { delay: 0.2 }}} className="font-inter text-white/40 leading-relaxed mb-6 font-light text-sm">
              At Nexus, we believe architecture is the art of making space meaningful.
              Every line we draw, every material we choose, every shadow we cast is
              deliberate—an intentional act of creation that bridges function and beauty.
            </motion.p>
            <motion.p {...{...fadeUp, transition: { delay: 0.3 }}} className="font-inter text-white/40 leading-relaxed mb-8 font-light text-sm">
              Our multidiplinary team brings together architects, interior designers, and
              visual thinkers who share a singular obsession: spaces that move people.
            </motion.p>
            <a href="#services" onClick={(e) => handleScroll(e, '#services')}
              className="font-inter inline-flex items-center gap-2 text-[#c9a84c] text-xs uppercase tracking-[0.2em] border-b border-[#c9a84c]/30 pb-1 hover:border-[#c9a84c] transition-colors">
              Explore Our Services <ArrowRight size={14}/>
            </a>
          </div>
          <motion.div {...{...fadeUp, transition: { delay: 0.2 }}} className="relative">
            <div className="absolute top-3 -right-3 w-full h-full border border-[#c9a84c]/20 z-0"/>
            <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop"
              alt="" className="relative z-10 w-full h-[450px] object-cover" />
          </motion.div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-28 px-6 bg-[#161625]">
        <div className="max-w-6xl mx-auto">
          <motion.div {...{...fadeUp, transition: { delay: 0 }}} className="text-center mb-20">
            <span className="font-inter text-[#c9a84c] text-[10px] uppercase tracking-[0.4em] font-semibold">What We Do</span>
            <h2 className="font-playfair text-4xl md:text-5xl mt-4 mb-6">Our Services</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: PenTool, title: 'Interior Design', desc: 'Curating interiors that balance aesthetics and livability. From concept to final styling, we craft spaces that feel both intentional and effortless.' },
              { icon: Monitor, title: 'Digital Visualization', desc: 'Photorealistic renders, VR walkthroughs, and interactive prototypes. See your space before it exists, iterate with confidence.' },
              { icon: Layers, title: 'Spatial Planning', desc: 'Strategic space optimization for residential and commercial projects. Every square meter designed to serve a purpose.' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={i} {...fadeUp} whileHover={{ y: -8 }} transition={{ duration: 0.3 }}
                  className="group bg-[#1a1a2e] border border-white/5 rounded-2xl p-10 hover:border-[#c9a84c]/30 transition-all duration-500">
                  <div className="w-14 h-14 rounded-xl bg-[#c9a84c]/10 flex items-center justify-center mb-6 group-hover:bg-[#c9a84c]/20 transition-colors">
                    <Icon className="text-[#c9a84c]" size={26} />
                  </div>
                  <h3 className="font-playfair text-xl mb-4 group-hover:text-[#c9a84c] transition-colors">{s.title}</h3>
                  <p className="font-inter text-white/35 text-sm leading-relaxed">{s.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects" className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div>
              <span className="font-inter text-[#c9a84c] text-[10px] uppercase tracking-[0.4em] font-semibold block mb-2">Portfolio</span>
              <h2 className="font-playfair text-4xl md:text-5xl">Featured Projects</h2>
            </div>
            <button className="hidden md:block font-inter text-xs uppercase tracking-[0.2em] border border-white/15 px-8 py-3 hover:border-[#c9a84c] hover:text-[#c9a84c] transition-all">
              View All
            </button>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Casa Serenidade', loc: 'Lisbon, Portugal', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop', year: '2024' },
              { title: 'The Glass Pavilion', loc: 'Milan, Italy', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop', year: '2023' },
              { title: 'Horizon Tower', loc: 'Dubai, UAE', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop', year: '2024' },
            ].map((p, i) => (
              <motion.div key={i} {...{...fadeUp, transition: { delay: i * 0.15 }}} whileHover={{ y: -10 }} transition={{ duration: 0.4 }}
                className="group relative h-[420px] overflow-hidden cursor-pointer">
                <img src={p.img} alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"/>
                <motion.div className="absolute top-5 right-5 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full"
                  initial={{ opacity: 0 }} whileHover={{ opacity: 1 }}>
                  <span className="font-inter text-[10px] text-[#c9a84c] tracking-widest">{p.year}</span>
                </motion.div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <span className="font-inter text-[#c9a84c] text-[10px] uppercase tracking-[0.3em] block mb-2">{p.loc}</span>
                  <h3 className="font-playfair text-2xl">{p.title}</h3>
                  <motion.div initial={{ width: 0, opacity: 0 }} whileHover={{ width: 40, opacity: 1 }} transition={{ duration: 0.3 }}
                    className="h-px bg-[#c9a84c] mt-4"/>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section id="team" className="py-28 px-6 bg-[#161625]">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span className="font-inter text-[#c9a84c] text-[10px] uppercase tracking-[0.4em] font-semibold">The People</span>
            <h2 className="font-playfair text-4xl md:text-5xl mt-4 mb-4">Leadership</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { name: 'Elena Voss', role: 'Founding Architect', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop' },
              { name: 'Marcus Chen', role: 'Design Director', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop' },
              { name: 'Sofia Reyes', role: 'Creative Lead', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop' },
            ].map((m, i) => (
              <motion.div key={i} {...{...fadeUp, transition: { delay: i * 0.15 }}} whileHover={{ y: -6 }}
                className="group text-center">
                <div className="relative w-56 h-56 mx-auto mb-6 overflow-hidden rounded-full">
                  <img src={m.img} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-[#c9a84c]/0 group-hover:bg-[#c9a84c]/10 transition-all duration-500 rounded-full"/>
                </div>
                <h3 className="font-playfair text-xl mb-1">{m.name}</h3>
                <p className="font-inter text-white/35 text-xs uppercase tracking-[0.2em]">{m.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="py-20 px-6">
        <motion.div {...fadeUp} className="max-w-5xl mx-auto bg-gradient-to-r from-[#c9a84c]/10 to-[#c9a84c]/5 border border-[#c9a84c]/20 rounded-2xl p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="font-playfair text-3xl md:text-4xl mb-3">Ready to Build Something <span className="italic text-[#c9a84c]">Iconic</span>?</h2>
            <p className="font-inter text-white/40 text-sm font-light">Let's discuss your next project. We'd love to hear your vision.</p>
          </div>
          <button className="group font-inter flex items-center gap-3 px-10 py-4 bg-[#c9a84c] text-black text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#dbc060] transition-all whitespace-nowrap">
            Start a Conversation <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
          </button>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-14 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="font-playfair text-xl font-bold">NEXUS<span className="text-[#c9a84c]">.</span></span>
            <span className="font-inter text-[10px] text-white/25 uppercase tracking-[0.2em]">Studio</span>
          </div>
          <div className="flex items-center gap-6 text-white/30">
            <span className="font-inter text-xs flex items-center gap-2"><Mail size={14} className="text-[#c9a84c]/50"/> hello@nexus.studio</span>
            <span className="font-inter text-xs flex items-center gap-2"><MapPin size={14} className="text-[#c9a84c]/50"/> Lisbon, Portugal</span>
          </div>
          <p className="font-inter text-[10px] text-white/20 tracking-wider">© 2024 Nexus Studio. Designed by PH.dev</p>
        </div>
      </footer>
    </div>
  );
};

export default NexusSite;
