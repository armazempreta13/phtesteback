import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, Menu, X, Zap, Shield, BarChart3, Layers, Globe, Rocket, ArrowRight, Check, Star, Users } from 'lucide-react';

interface VertexProps {
  onBack?: () => void;
}

export const VertexSite: React.FC<VertexProps> = ({ onBack }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const scroll = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const links = ['Recursos', 'Precos', 'Depoimentos'];

  return (
    <div className="bg-[#0f172a] text-white font-sans min-h-screen selection:bg-[#3b82f6] selection:text-white overflow-x-hidden">
      <style>{`
        @keyframes gradient-shift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animate-gradient { background-size: 200% 200%; animation: gradient-shift 4s ease infinite; }
      `}</style>

      {/* PREVIEW BANNER */}
      <div className="fixed top-0 left-0 w-full z-[100] bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white text-[10px] font-bold px-4 py-1.5 flex justify-between items-center shadow-lg">
        <span className="tracking-[0.2em]">MODO VISUALIZACAO DE PORTFOLIO</span>
        <button onClick={onBack} className="flex items-center gap-1.5 hover:bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider transition-all">
          <XCircle size={12} /> Fechar Demo
        </button>
      </div>

      {/* NAV */}
      <nav className="fixed top-8 left-0 w-full z-50 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex justify-between items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3">
          <button onClick={() => scroll('top')} className="text-xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            VERTEX
          </button>

          <div className="hidden md:flex gap-8 text-sm text-slate-400">
            {links.map(l => (
              <button key={l} onClick={() => scroll(l.toLowerCase())} className="hover:text-white transition-colors">
                {l}
              </button>
            ))}
            <button className="px-5 py-2 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#2563eb] hover:to-[#7c3aed] text-white rounded-xl text-xs font-bold tracking-wider transition-all">
              Teste Gratis
            </button>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden absolute top-full left-0 w-full bg-[#0f172a] border border-white/10 mt-2 p-6 flex flex-col gap-4 rounded-2xl shadow-2xl"
            >
              {links.map(l => (
                <button key={l} onClick={() => scroll(l.toLowerCase())} className="text-lg text-left text-white py-2">
                  {l}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO */}
      <header id="top" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-12">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-[#3b82f6]/20 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#8b5cf6]/15 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f172a]/50 to-[#0f172a]" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#3b82f6]/10 border border-[#3b82f6]/30 rounded-full text-xs font-bold tracking-wider text-[#3b82f6] mb-8">
              <Rocket size={14} /> NOVO: Vertex 3.0 Lancado
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight mb-8"
          >
            Escale seu negocio<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3b82f6] via-[#8b5cf6] to-[#06b6d4] animate-gradient">
              com inteligencia.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-light"
          >
            Plataforma all-in-one para gestao, automacao e analise de dados. Transforme informacao em lucro.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button className="px-10 py-4 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#2563eb] hover:to-[#7c3aed] text-white rounded-xl font-bold tracking-wider transition-all shadow-xl shadow-[#3b82f6]/30 hover:shadow-[#3b82f6]/50 hover:scale-105 flex items-center justify-center gap-2">
              Comecar Gratis <ArrowRight size={16} />
            </button>
            <button className="px-10 py-4 border border-white/10 hover:border-white/30 text-white rounded-xl font-bold tracking-wider transition-all backdrop-blur-sm">
              Ver Demo
            </button>
          </motion.div>
        </div>
      </header>

      {/* STATS BAR */}
      <section className="py-16 mx-auto max-w-5xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '12K+', label: 'Empresas ativas' },
            { value: '99.99%', label: 'Uptime SLA' },
            { value: '340%', label: 'ROI medio' },
            { value: '<100ms', label: 'Tempo de resposta' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-3xl md:text-4xl font-black text-white mb-2">{s.value}</div>
              <div className="text-xs text-slate-500 tracking-wider uppercase">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="recursos" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#3b82f6] text-xs tracking-[0.2em] uppercase mb-3 block">Capacidades</span>
            <h2 className="text-4xl md:text-6xl font-black mb-4">Tudo que voce precisa</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Uma plataforma. Seis modulos. Zero complicacao.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Zap size={24} />, title: 'Automacao', desc: 'Workflows inteligentes que eliminam tarefas repetitivas.', gradient: 'from-[#3b82f6]/20 to-[#3b82f6]/5' },
              { icon: <Shield size={24} />, title: 'Seguranca', desc: 'Criptografia militar, logs de auditoria e compliance SOC2.', gradient: 'from-[#8b5cf6]/20 to-[#8b5cf6]/5' },
              { icon: <BarChart3 size={24} />, title: 'Analytics', desc: 'Dashboards em tempo real com insights gerados por IA.', gradient: 'from-[#06b6d4]/20 to-[#06b6d4]/5' },
              { icon: <Layers size={24} />, title: 'Integracoes', desc: 'Conecte com 200+ ferramentas: Slack, Stripe, Notion.', gradient: 'from-[#f59e0b]/20 to-[#f59e0b]/5' },
              { icon: <Users size={24} />, title: 'Colaboracao', desc: 'Espacos de trabalho compartilhados com permissoes granulares.', gradient: 'from-[#10b981]/20 to-[#10b981]/5' },
              { icon: <Globe size={24} />, title: 'Multi-idioma', desc: 'Interface em 15 idiomas com traducao automatica em tempo real.', gradient: 'from-[#ec4899]/20 to-[#ec4899]/5' },
            ].map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className={`bg-gradient-to-br ${feat.gradient} rounded-2xl p-8 border border-white/5 hover:border-white/10 transition-all duration-500`}
              >
                <div className="text-white mb-4">{feat.icon}</div>
                <h3 className="text-lg font-bold mb-2">{feat.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="precos" className="py-24 px-6 bg-[#0c1220]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#8b5cf6] text-xs tracking-[0.2em] uppercase mb-3 block">Planos</span>
            <h2 className="text-4xl md:text-5xl font-black">Precos simples</h2>
            <p className="text-slate-400 mt-4">Sem surpresas. Sem contratos obrigatorios.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {[
              {
                name: 'Starter',
                price: 'Gratis',
                desc: 'Para quem esta comecando.',
                features: ['Ate 3 usuarios', '1GB armazenamento', '5 automacoes', 'Email suporte'],
                cta: 'Comecar Gratis',
                highlight: false,
              },
              {
                name: 'Pro',
                price: 'R$ 97',
                desc: 'Para equipes em crescimento.',
                features: ['Ate 25 usuarios', '50GB armazenamento', 'Automacoes ilimitadas', 'Suporte prioritario', 'Integracoes avancadas'],
                cta: 'Teste 14 Dias Gratis',
                highlight: true,
                badge: 'MAIS POPULAR',
              },
              {
                name: 'Enterprise',
                price: 'Sob consulta',
                desc: 'Para grandes operacoes.',
                features: ['Usuarios ilimitados', 'Armazenamento ilimitado', 'SLA 99.99%', 'Gerente dedicado', 'API customizada', 'On-premise disponivel'],
                cta: 'Falar com Vendas',
                highlight: false,
              },
            ].map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className={`relative rounded-2xl p-8 ${
                  plan.highlight
                    ? 'bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] border-2 border-transparent shadow-2xl shadow-[#3b82f6]/20 scale-105'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-[#3b82f6] text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-wider">
                    {plan.badge}
                  </div>
                )}

                <h3 className={`text-lg font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-slate-300'}`}>
                  {plan.name}
                </h3>
                <p className={`text-xs mb-6 ${plan.highlight ? 'text-white/70' : 'text-slate-500'}`}>
                  {plan.desc}
                </p>
                <div className="mb-8">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  {plan.price !== 'Sob consulta' && plan.price !== 'Gratis' && (
                    <span className={`text-sm ${plan.highlight ? 'text-white/60' : 'text-slate-500'}`}>/mes</span>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <Check size={14} className={plan.highlight ? 'text-white' : 'text-[#3b82f6]'} />
                      <span className={plan.highlight ? 'text-white/80' : 'text-slate-400'}>{f}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-3 rounded-xl font-bold text-sm tracking-wider transition-all ${
                  plan.highlight
                    ? 'bg-white text-[#3b82f6] hover:bg-slate-100'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                }`}>
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="depoimentos" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#06b6d4] text-xs tracking-[0.2em] uppercase mb-3 block">Depoimentos</span>
            <h2 className="text-4xl font-black">O que dizem nossos clientes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                quote: 'O Vertex triplicou nossa produtividade em 3 meses. A automacao de workflows economizou 200h/mes da nossa equipe.',
                name: 'Juliana Costa',
                role: 'CTO, TechBR',
                avatar: 'JC',
                rating: 5,
              },
              {
                quote: 'Melhor investimento do ano. ROI de 340% em apenas 6 meses. O suporte e excepcional, sempre disponivel.',
                name: 'Ricardo Almeida',
                role: 'CEO, StartupX',
                avatar: 'RA',
                rating: 5,
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="bg-white/5 border border-white/10 rounded-2xl p-8"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={16} className="text-[#f59e0b]" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-6">
            Pronto para <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6]">decolar</span>?
          </h2>
          <p className="text-slate-400 text-lg mb-12 max-w-xl mx-auto">
            Junte-se a 12.000+ empresas que ja estao escalando com Vertex.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Seu melhor e-mail"
              className="flex-1 px-6 py-4 bg-white/5 border border-white/10 hover:border-white/30 focus:border-[#3b82f6] outline-none rounded-xl text-sm placeholder:text-slate-500 transition-colors"
            />
            <button className="px-8 py-4 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#2563eb] hover:to-[#7c3aed] text-white rounded-xl font-bold text-sm tracking-wider transition-all shadow-lg shadow-[#3b82f6]/25 whitespace-nowrap">
              Teste Gratis
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] rounded-lg flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="font-bold text-white">VERTEX</span>
          </div>
          <div className="flex gap-6">
            <span>Termos</span>
            <span>Privacidade</span>
            <span>Status</span>
            <span>Docs</span>
          </div>
          <p>&copy; 2024 Vertex. Designed by PH.dev</p>
        </div>
      </footer>
    </div>
  );
};
