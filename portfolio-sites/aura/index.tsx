import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, Menu, X, Leaf, Wind, Heart, Sun, Moon, MapPin, Instagram } from 'lucide-react';

interface AuraProps {
  onBack?: () => void;
}

export const AuraSite: React.FC<AuraProps> = ({ onBack }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const scroll = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const links = ['Filosofia', 'Aulas', 'Horarios', 'Contato'];

  return (
    <div className="bg-[#faf8f0] text-[#4a443a] font-sans min-h-screen selection:bg-[#8faa73] selection:text-white overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap');
        .font-cormorant { font-family: 'Cormorant Garamond', serif; }
        @keyframes breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
      `}</style>

      {/* PREVIEW BANNER */}
      <div className="fixed top-0 left-0 w-full z-[100] bg-[#8faa73] text-white text-[10px] font-bold px-4 py-1.5 flex justify-between items-center shadow-md">
        <span className="tracking-[0.2em]">MODO VISUALIZAO DE PORTFOLIO</span>
        <button onClick={onBack} className="flex items-center gap-1.5 hover:bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider transition-all">
          <XCircle size={12} /> Fechar Demo
        </button>
      </div>

      {/* NAV */}
      <nav className="fixed top-6 left-0 w-full z-50 px-6 md:px-12 bg-[#faf8f0]/80 backdrop-blur-lg border-b border-[#8faa73]/10">
        <div className="max-w-6xl mx-auto flex justify-between items-center h-16">
          <button onClick={() => scroll('top')} className="text-2xl font-cormorant font-light text-[#8faa73] tracking-wider">
            aura<span className="text-[#8b6f47]">.</span>
          </button>

          <div className="hidden md:flex gap-10 text-sm font-light tracking-wide text-[#6b6254]">
            {links.map(l => (
              <button key={l} onClick={() => scroll(l.toLowerCase())} className="hover:text-[#8faa73] transition-colors">
                {l}
              </button>
            ))}
            <button className="px-6 py-2 bg-[#8faa73] text-white rounded-full text-xs font-medium tracking-wider hover:bg-[#7d9965] transition-colors">
              Agendar Aula
            </button>
          </div>

          <button onClick={() => setMenuOpen(!setMenuOpen)} className="md:hidden text-[#4a443a]">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden absolute top-full left-0 w-full bg-[#faf8f0] border-b border-[#8faa73]/20 p-6 flex flex-col gap-4 shadow-lg"
            >
              {links.map(l => (
                <button key={l} onClick={() => scroll(l.toLowerCase())} className="text-lg font-cormorant text-left text-[#4a443a] py-2">
                  {l}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO */}
      <header id="top" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-6">
        <div className="absolute inset-0 bg-gradient-to-br from-[#e8f0e0] via-[#faf8f0] to-[#f5ede0]" />
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-[#8faa73]/10 blur-3xl top-1/4 right-1/4"
          style={{ animation: 'breathe 8s ease-in-out infinite' }}
        />
        <motion.div
          className="absolute w-72 h-72 rounded-full bg-[#8b6f47]/10 blur-3xl bottom-1/4 left-1/4"
          style={{ animation: 'breathe 10s ease-in-out infinite 2s' }}
        />

        <div className="relative z-10 text-center px-6 max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-[#8b6f47] text-sm tracking-[0.25em] uppercase mb-8 font-light"
          >
            Yoga & Bem-estar
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="font-cormorant text-6xl md:text-8xl lg:text-9xl font-light text-[#4a443a] leading-[0.9] mb-8"
          >
            Respire.<br />
            <span className="italic text-[#8faa73]">Reconecte.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-[#6b6254] text-lg font-light max-w-xl mx-auto leading-relaxed mb-12"
          >
            Um espaco dedicado a pratica consciente do yoga, onde cada postura e um convite para estar presente.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button className="px-10 py-4 bg-[#8faa73] hover:bg-[#7d9965] text-white rounded-full text-sm tracking-wider transition-colors">
              Comece Sua Jornada
            </button>
            <button onClick={() => scroll('filosofia')} className="px-10 py-4 border border-[#8b6f47]/30 hover:border-[#8b6f47] text-[#8b6f47] rounded-full text-sm tracking-wider transition-colors">
              Nossa Filosofia
            </button>
          </motion.div>
        </div>
      </header>

      {/* INTRO QUOTE */}
      <section id="filosofia" className="py-24 md:py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Leaf className="mx-auto mb-8 text-[#8faa73] opacity-60" size={32} />
          <blockquote className="font-cormorant text-3xl md:text-5xl font-light text-[#4a443a] leading-tight mb-8">
            &ldquo;O corpo e o templo da alma. O yoga e a arte de cuidar deste templo com graca e consciencia.&rdquo;
          </blockquote>
          <p className="text-[#8b6f47] text-sm tracking-wider uppercase">Fundadora, Aura Studio</p>
        </div>
      </section>

      {/* IMAGE STRIP */}
      <section className="py-8 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?q=80&w=800&auto=format&fit=crop',
          ].map((img, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className="overflow-hidden rounded-2xl aspect-[4/5]"
            >
              <img src={img} alt={`Aura ${i + 1}`} className="w-full h-full object-cover" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* CLASSES */}
      <section id="aulas" className="py-24 md:py-32 px-6 mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <span className="text-[#8b6f47] text-xs tracking-[0.2em] uppercase mb-3 block">Nossas Praticas</span>
          <h2 className="font-cormorant text-4xl md:text-6xl font-light text-[#4a443a]">Aulas</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Sun size={32} className="text-[#c9a84c]" />,
              title: 'Vinyasa Flow',
              desc: 'Movimento fluido que conecta respiracao e postura. Para corpos ativos e mentes inquietas.',
              level: 'Intermediario',
            },
            {
              icon: <Moon size={32} className="text-[#8faa73]" />,
              title: 'Yin Yoga',
              desc: 'Posturas passivas mantidas por 3-5 minutos. Libertacao profunda do tecido conectivo.',
              level: 'Todos os niveis',
            },
            {
              icon: <Wind size={32} className="text-[#8b6f47]" />,
              title: 'Hatha Classico',
              desc: 'Fundamentos do yoga com alinhamento preciso. Ideal para quem esta comecando ou refinando a pratica.',
              level: 'Iniciante',
            },
          ].map((cls, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl p-8 border border-[#8faa73]/10 hover:border-[#8faa73]/30 hover:shadow-lg transition-all duration-500"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#faf8f0] flex items-center justify-center mb-6">
                {cls.icon}
              </div>
              <h3 className="font-cormorant text-2xl font-medium text-[#4a443a] mb-3">{cls.title}</h3>
              <span className="inline-block text-[10px] tracking-wider uppercase bg-[#e8f0e0] text-[#8faa73] px-3 py-1 rounded-full mb-4">
                {cls.level}
              </span>
              <p className="text-[#6b6254] text-sm leading-relaxed">{cls.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SCHEDULE */}
      <section id="horarios" className="py-24 px-6 bg-[#e8f0e0]/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#8b6f47] text-xs tracking-[0.2em] uppercase mb-3 block">Grade Semanal</span>
            <h2 className="font-cormorant text-4xl md:text-5xl font-light text-[#4a443a]">Horarios</h2>
          </div>

          <div className="bg-white rounded-3xl overflow-hidden border border-[#8faa73]/10">
            {[
              { day: 'Segunda', classes: [
                { time: '07:00', name: 'Hatha Classico', teacher: 'Ana' },
                { time: '18:30', name: 'Vinyasa Flow', teacher: 'Marcos' },
              ]},
              { day: 'Tera', classes: [
                { time: '06:30', name: 'Vinyasa Flow', teacher: 'Lucia' },
                { time: '19:00', name: 'Yin Yoga', teacher: 'Ana' },
              ]},
              { day: 'Quarta', classes: [
                { time: '07:00', name: 'Hatha Classico', teacher: 'Marcos' },
                { time: '12:00', name: 'Meditacao', teacher: 'Lucia' },
                { time: '18:30', name: 'Vinyasa Flow', teacher: 'Ana' },
              ]},
              { day: 'Quinta / Sexta', classes: [
                { time: '07:00', name: 'Hatha / Vinyasa', teacher: 'Marcos & Ana' },
                { time: '19:00', name: 'Yin + Meditacao', teacher: 'Lucia' },
              ]},
            ].map((day, i) => (
              <div key={i} className={`px-8 py-6 ${i !== 4 ? 'border-b border-[#8faa73]/10' : ''}`}>
                <h4 className="font-cormorant text-lg font-medium text-[#4a443a] mb-3">{day.day}</h4>
                <div className="flex flex-wrap gap-x-8 gap-y-2">
                  {day.classes.map((cls, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <span className="text-xs font-mono text-[#8faa73]">{cls.time}</span>
                      <span className="text-sm text-[#4a443a]">{cls.name}</span>
                      <span className="text-xs text-[#8b6f47]/60">com {cls.teacher}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 md:py-32 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              quote: 'O Aura transformou minha rotina. Depois de 6 meses de pratica, minhas dores nas costas sumiram e minha ansiedade diminuiu drasticamente.',
              name: 'Carolina M.',
              role: 'Aluna desde 2023',
            },
            {
              quote: 'Ambiente incrivelmente acolhedor. Professores atenciosos que adaptam cada aula as suas necessidades. Recomendo de olhos fechados.',
              name: 'Roberto S.',
              role: 'Aluno desde 2024',
            },
          ].map((t, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              className="bg-white rounded-3xl p-8 border border-[#8faa73]/10"
            >
              <Heart size={20} className="text-[#8faa73] mb-4 opacity-60" />
              <p className="font-cormorant text-lg italic text-[#4a443a] leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#8faa73]/20 flex items-center justify-center text-[#8faa73] font-bold text-sm">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#4a443a]">{t.name}</p>
                  <p className="text-xs text-[#8b6f47]/60">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="contato" className="py-24 px-6 bg-[#e8f0e0]">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-[#8b6f47] text-xs tracking-[0.2em] uppercase mb-4 block">Comece Hoje</span>
          <h2 className="font-cormorant text-4xl md:text-6xl font-light text-[#4a443a] mb-6">
            Sua primeira aula e gratuita
          </h2>
          <p className="text-[#6b6254] text-sm mb-10 max-w-lg mx-auto">
            Venha nos visitar. Sem compromisso. Apenas voce, sua respiracao e um espaco pensado para o seu bem-estar.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Seu melhor e-mail"
              className="flex-1 px-6 py-4 bg-white border border-[#8faa73]/20 rounded-full text-sm outline-none focus:border-[#8faa73] text-[#4a443a] placeholder:text-[#8b6f47]/40"
            />
            <button className="px-8 py-4 bg-[#8faa73] hover:bg-[#7d9965] text-white rounded-full text-sm tracking-wider transition-colors">
              Reservar Vaga
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 bg-[#f5f0e6]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-[#8b6f47]/60 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#8faa73]/20 flex items-center justify-center">
              <Leaf size={14} className="text-[#8faa73]" />
            </div>
            <span className="font-cormorant text-lg text-[#8faa73]">AURA</span>
          </div>
          <div className="flex items-center gap-4">
            <MapPin size={14} /> Rua das Flores, 42 - Itaim, SP
          </div>
          <div className="flex items-center gap-3">
            <Instagram size={16} /> @aura.studio
          </div>
          <p>&copy; 2024 Aura Studio. Designed by PH.dev</p>
        </div>
      </footer>
    </div>
  );
};
