import React, { useState } from 'react';
import { Rocket, MapPin, Wind, Shield, Star, Menu, X, ArrowRight, ChevronDown, Thermometer, Zap, XCircle, Sparkles, Globe, Users } from 'lucide-react';

interface AetherProps {
  onBack: () => void;
}

export const AetherOnePage: React.FC<AetherProps> = ({ onBack }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <div className="bg-black text-slate-100 font-sans min-h-screen selection:bg-orange-500 selection:text-white overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        .font-space { font-family: 'Space Grotesk', sans-serif; }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(234,88,12,0.3); } 50% { box-shadow: 0 0 40px rgba(234,88,12,0.6); } }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(12px); } }
      `}</style>

      {/* PREVIEW BANNER */}
      <div className="fixed top-0 left-0 w-full z-[100] bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 text-white text-[10px] font-bold px-4 py-1.5 flex justify-between items-center shadow-2xl">
        <span className="font-space tracking-[0.2em]">PREVIEW MODE</span>
        <button onClick={onBack} className="flex items-center gap-1.5 hover:bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider transition-all">
          <XCircle size={12} /> SAIR
        </button>
      </div>

      {/* NAVIGATION */}
      <nav className="fixed top-8 left-0 w-full z-50 px-6 py-4 transition-all duration-300 bg-black/60 backdrop-blur-xl border-b border-orange-500/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2.5 text-2xl font-space font-bold text-white tracking-tight">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30" style={{animation: 'pulse-glow 3s infinite'}}>
              <Rocket size={18} className="text-white" />
            </div>
            AETHER
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {['Destinos', 'Domos', 'Lifestyle', 'Contato'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} onClick={(e) => handleScroll(e, item.toLowerCase())} 
                className="hover:text-orange-400 transition-colors relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"/>
              </a>
            ))}
            <button className="px-6 py-2.5 border border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white transition-all rounded-full uppercase text-xs font-bold tracking-widest shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40">
              Visita Orbital
            </button>
          </div>

          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-slate-950/95 backdrop-blur-xl border-b border-orange-500/20 p-6 flex flex-col gap-4 shadow-2xl">
            {['Destinos', 'Domos', 'Lifestyle', 'Contato'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} onClick={(e) => handleScroll(e, item.toLowerCase())} 
                className="text-lg font-space hover:text-orange-400 transition-colors">{item}</a>
            ))}
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=2400&auto=format&fit=crop" 
            alt="Mars" className="w-full h-full object-cover scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-900/20 to-transparent" />
        </div>

        <div className="absolute top-1/4 left-10 w-64 h-64 bg-orange-600/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-red-600/10 rounded-full blur-[120px]" />

        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto mt-16">
          <div className="opacity-0 animate-[fadeIn_1s_ease-out_forwards]">
            <span className="inline-flex items-center gap-2 py-2 px-4 border border-orange-500/50 rounded-full text-orange-400 text-xs font-bold tracking-[0.25em] uppercase mb-8 bg-orange-950/30 backdrop-blur-md">
              <Sparkles size={14}/> FASE 1: VENDAS ABERTAS
            </span>
            <h1 className="font-space text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.9] mb-8 tracking-tighter">
              Seu Futuro Está a<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-amber-500 animate-pulse">
                225 Milhões de km
              </span>
            </h1>
            <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed mb-12 tracking-wide">
              Habitats de luxo com gravidade ajustável, atmosfera premium e vista privilegiada do Olympus Mons. 
              <span className="text-orange-400 font-semibold"> A nova era da humanidade.</span>
            </p>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-5">
               <button className="group px-10 py-5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-full font-bold uppercase tracking-widest transition-all shadow-2xl shadow-orange-600/40 hover:shadow-orange-500/60 hover:scale-105 flex items-center gap-3">
                 Ver Disponibilidade 
                 <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
               </button>
               <button className="px-10 py-5 bg-white/5 border-2 border-white/20 hover:bg-white/10 hover:border-orange-500/50 text-white rounded-full font-bold uppercase tracking-widest transition-all backdrop-blur-md">
                 Tour Virtual 360°
               </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-orange-500/60" style={{animation: 'bounce-slow 2.5s ease-in-out infinite'}}>
          <ChevronDown size={36} />
        </div>
      </section>

      {/* STATS BAR */}
      <section className="py-12 bg-gradient-to-r from-slate-950 via-orange-950/20 to-slate-950 border-y border-orange-500/10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-4">
          {[
            {icon: Globe, value: '1,247', label: 'Colonos Registrados'},
            {icon: Rocket, value: '38%', label: 'Gravidade Terrestre'},
            {icon: Users, value: '156', label: 'Domos Vendidos'},
            {icon: Star, value: '4.9', label: 'Avaliação Galáctica'}
          ].map((stat, i) => {
            const IconComponent = stat.icon;
            return (
              <div key={i} className="text-center">
                <IconComponent className="mx-auto mb-3 text-orange-500" size={28} />
                <div className="font-space text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-slate-400 text-xs uppercase tracking-widest">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* DOMES SECTION */}
      <section id="domos" className="py-32 px-4 md:px-8 bg-black relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-600/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <span className="text-orange-500 font-mono text-xs uppercase tracking-[0.3em] mb-4 block">Arquitetura Marciana</span>
            <h2 className="font-space text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">Habitats Premium</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Domos impressos em 3D com regolito marciano refinado e tecnologia de ponta.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Crater Villa",
                desc: "Proteção máxima contra radiação. Jardim hidropônico privado com 80+ espécies terrestres.",
                price: "₿ 4.2",
                specs: "240m² • 4 Suites • O2 Premium • Gravidade Ajustável",
                img: "https://images.unsplash.com/photo-1635322966219-b75ed372eb01?q=80&w=800&auto=format&fit=crop",
                badge: "FAMÍLIA"
              },
              {
                title: "Olympus Penthouse",
                desc: "Vista panorâmica para o maior vulcão do sistema solar. Vidro nano-diamante.",
                price: "₿ 8.5",
                specs: "450m² • Duplex • Gravidade 1G • Sky Lounge",
                img: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=80&w=800&auto=format&fit=crop",
                badge: "LUXO"
              },
              {
                title: "Red Dust Loft",
                desc: "Compacto e conectado. Ideal para nômades digitais interplanetários.",
                price: "₿ 1.8",
                specs: "85m² • Studio • Starlink V8 • Smart Home IA",
                img: "https://images.unsplash.com/photo-1614728423169-3f65fd722b7e?q=80&w=800&auto=format&fit=crop",
                badge: "STARTER"
              }
            ].map((dome, i) => (
              <div key={i} 
                className="group relative bg-gradient-to-b from-slate-900/50 to-slate-950/50 border border-slate-800 rounded-3xl overflow-hidden hover:border-orange-500/50 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-orange-500/20 backdrop-blur-sm">
                
                <div className="absolute top-4 left-4 z-20 bg-orange-600 text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {dome.badge}
                </div>
                
                <div className="relative h-72 overflow-hidden">
                  <img src={dome.img} alt={dome.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md text-orange-400 px-4 py-2 rounded-2xl text-sm font-bold border border-orange-500/30">
                    {dome.price}
                  </div>
                </div>
                
                <div className="p-8">
                  <h3 className="font-space text-2xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">{dome.title}</h3>
                  <p className="text-slate-400 text-sm mb-6 leading-relaxed">{dome.desc}</p>
                  
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-6 pb-6 border-b border-slate-800">
                    {dome.specs.split('•').map((spec, idx) => (
                      <span key={idx} className="bg-slate-800/50 px-3 py-1.5 rounded-full">{spec.trim()}</span>
                    ))}
                  </div>

                  <button className="w-full py-3.5 border-2 border-slate-700 text-white rounded-xl hover:bg-orange-600 hover:border-orange-600 transition-all text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 group/btn">
                    Explorar Unidade 
                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform"/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIFESTYLE BENTO */}
      <section id="lifestyle" className="py-32 px-4 md:px-8 relative bg-gradient-to-b from-black via-slate-950 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-orange-500 font-mono text-xs uppercase tracking-[0.3em] mb-4 block">Viver em Marte</span>
            <h2 className="font-space text-5xl md:text-6xl font-bold text-white tracking-tight">Lifestyle Planetário</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 h-auto md:h-[700px]">
            
            <div className="md:row-span-2 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-10 flex flex-col justify-between relative overflow-hidden group hover:border-orange-500/30 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
              <img src="https://images.unsplash.com/photo-1610296669228-602fa827fc1f?q=80&w=800&auto=format&fit=crop" 
                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700" alt="Gravity" />
              
              <div className="relative z-20">
                <div className="bg-gradient-to-br from-orange-600 to-red-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-600/40">
                  <Zap size={28} className="text-white" />
                </div>
                <h3 className="font-space text-4xl font-bold text-white mb-4 leading-tight">38% de Gravidade</h3>
                <p className="text-slate-300 text-lg leading-relaxed">Sinta-se leve. Adeus dores nas costas. Esportes aéreos revolucionários.</p>
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-8 flex flex-col justify-center hover:border-orange-500/30 hover:bg-slate-900 transition-all duration-300 group">
              <div className="bg-blue-600/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield size={28} className="text-blue-400" />
              </div>
              <h3 className="font-space text-2xl font-bold text-white mb-3">Segurança Total</h3>
              <p className="text-slate-400 leading-relaxed">Escudos contra radiação militar. Monitoramento IA 24/7.</p>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-8 flex flex-col justify-center hover:border-orange-500/30 hover:bg-slate-900 transition-all duration-300 group">
              <div className="bg-yellow-600/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Star size={28} className="text-yellow-400" />
              </div>
              <h3 className="font-space text-2xl font-bold text-white mb-3">Céu Exclusivo</h3>
              <p className="text-slate-400 leading-relaxed">Pôr do sol azul marciano. Fenômeno único no sistema solar.</p>
            </div>

            <div className="md:col-span-2 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 p-10 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden hover:border-orange-500/30 transition-all duration-300">
               <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600/10 rounded-full blur-[100px]" />
               <div className="z-10 flex-1">
                 <div className="bg-red-600/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                   <Thermometer size={28} className="text-red-400" />
                 </div>
                 <h3 className="font-space text-3xl font-bold text-white mb-4">Clima Perfeito</h3>
                 <p className="text-slate-400 text-lg leading-relaxed">Enquanto lá fora é -60°C, dentro é primavera eterna. Temperatura de 22°C, umidade ideal.</p>
               </div>
               <div className="hidden md:flex relative w-40 h-40 items-center justify-center" style={{animation: 'float 6s ease-in-out infinite'}}>
                  <div className="absolute w-40 h-40 rounded-full border-2 border-dashed border-orange-500/30 animate-[spin_20s_linear_infinite]"></div>
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-orange-500/30 to-red-500/30 backdrop-blur-md"></div>
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA & FOOTER */}
      <footer id="contato" className="bg-gradient-to-b from-black to-slate-950 pt-32 border-t border-orange-500/10">
        <div className="max-w-5xl mx-auto text-center px-4 mb-32">
           <div>
             <h2 className="font-space text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight leading-tight">
               Pronto para <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Decolar?</span>
             </h2>
             <p className="text-slate-400 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
               Unidades da primeira fase são limitadas. Garanta seu lugar na história da humanidade.
             </p>
             
             <div className="flex flex-col md:flex-row justify-center gap-4 max-w-2xl mx-auto">
                <input type="email" placeholder="Seu e-mail interplanetário" 
                  className="flex-1 px-8 py-5 bg-white/5 border-2 border-slate-800 rounded-full text-white placeholder:text-slate-500 outline-none focus:border-orange-500 transition-all backdrop-blur-sm" />
                <button className="px-10 py-5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold rounded-full uppercase tracking-widest transition-all shadow-xl shadow-orange-600/40 hover:scale-105">
                  Receber Prospecto
                </button>
             </div>
           </div>
        </div>

        <div className="border-t border-slate-900 py-10 px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-slate-600">
            <div className="flex items-center gap-2.5 mb-6 md:mb-0 font-space font-semibold">
               <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                 <Rocket size={14} className="text-white" />
               </div>
               AETHER ESTATES
            </div>
            <div className="text-center md:text-right space-y-1">
               <p>© 2054 Aether Estates • Terraforming não incluso</p>
               <p className="text-slate-700">Designed with <span className="text-orange-500">♥</span> by PH.dev</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};