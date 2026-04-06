
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { 
  ArrowLeft, 
  Clock, 
  Share2, 
  BookOpen, 
  Cpu, 
  Smartphone, 
  BarChart3, 
  FlaskConical,
  ChevronRight,
  Zap
} from 'lucide-react';
import { ViewType, BlogPost } from '../types';
import { Button } from './Button';
import { RealTimePerformanceDemo, AIArchitectureDemo, ResponsiveResizer } from './BlogInteractive';
import { AudioPlayer } from './AudioPlayer';
import { SEO } from './SEO';
import { useMobile } from '../hooks/useMobile';
import { SITE_CONFIG } from '../config';
import { useContent } from '../contexts/ContentContext';

interface BlogProps {
  onNavigate: (view: ViewType) => void;
}

// --- DATA ---
const LAB_CONTENT = {
    perf: {
        title: "A Matemática da Conversão",
        paragraphs: [
            "O Google utiliza métricas vitais (Core Web Vitals) para decidir quem aparece na primeira página. Duas das mais importantes são o LCP (Largest Contentful Paint) e o CLS (Cumulative Layout Shift).",
            "O LCP mede a velocidade percebida: quanto tempo leva para o conteúdo principal aparecer? Se passar de 2.5 segundos, você perde posições. O CLS mede a estabilidade: as coisas pulam de lugar enquanto carregam? Isso frustra o usuário e gera cliques errados.",
            "Minha arquitetura utiliza SSG (Static Site Generation) para pré-renderizar o HTML. Isso significa que o servidor não precisa 'pensar' quando alguém acessa seu site; ele apenas entrega o arquivo pronto. O resultado é um carregamento quase instantâneo, notas 90+ no PageSpeed e, estatisticamente, um aumento significativo na taxa de conversão."
        ]
    },
    ai: {
        title: "Código Assistido por Inteligência",
        paragraphs: [
            "A engenharia de software moderna não é mais artesanal no sentido de 'escrever cada byte manualmente'. É sobre orquestração. Utilizo Inteligência Artificial para gerar 'scaffolding' (estruturas base) de código, testes unitários e validações de tipos.",
            "O pipeline automatizado verifica acessibilidade (WCAG), segurança e boas práticas em tempo real. Enquanto um desenvolvedor tradicional gasta horas caçando bugs de sintaxe, eu utilizo esse tempo para refinar a Arquitetura da Informação e a Experiência do Usuário.",
            "O resultado final é um produto robusto, livre de 'dívida técnica' e preparado para escalar. Você não paga pelas horas que eu passo digitando, mas pela inteligência aplicada em resolver seu problema de negócio."
        ]
    },
    mobile: {
        title: "A Tela Principal é a Menor",
        paragraphs: [
            "Hoje, mais de 60% do tráfego web mundial ocorre em dispositivos móveis. Ainda assim, muitos sites são projetados primeiro para desktops e depois 'espremidos' para caber no celular. Isso é um erro fatal.",
            "A metodologia Mobile First inverte essa lógica. Começamos projetando para a menor tela possível. Isso nos força a priorizar o conteúdo absolutamente essencial, eliminando gordura e distrações.",
            "Um site Mobile First carrega menos dados, economiza a bateria do usuário e possui botões e áreas de toque otimizados para o dedo (touch-friendly), não para o mouse. Quando o site é escalado para telas maiores, ele ganha recursos progressivamente, mas a base sólida e performática permanece."
        ]
    }
};

const STATIC_MENU_ITEMS = [
    { id: 'perf', title: 'Performance Lab', subtitle: 'Simulador LCP/CLS', icon: BarChart3, type: 'lab' },
    { id: 'ai', title: 'Engenharia IA', subtitle: 'Pipeline Automatizado', icon: Cpu, type: 'lab' },
    { id: 'mobile', title: 'Mobile First', subtitle: 'Teste de Viewport', icon: Smartphone, type: 'lab' },
];

// --- VIEWS ---

const ArticleView = ({ post, isMobile, onBack, onNavigate }: { post: BlogPost, isMobile: boolean, onBack?: () => void, onNavigate: (view: ViewType) => void }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ container: scrollRef });
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    const copyToClipboard = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copiado!');
    };

    // SEO SPECIFIC FOR ARTICLE
    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "image": post.image,
        "author": {
            "@type": "Person",
            "name": post.author,
            "url": SITE_CONFIG.URL
        },
        "publisher": {
            "@type": "Organization",
            "name": "PH Development",
            "logo": {
                "@type": "ImageObject",
                "url": `${SITE_CONFIG.URL}/favicon.svg`
            }
        },
        "datePublished": post.date,
        "description": post.excerpt,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `${SITE_CONFIG.URL}/#article-${post.id}`
        }
    };

    return (
        <div className="flex flex-col h-full bg-white relative">
            <SEO 
                title={post.title}
                description={post.excerpt}
                type="article"
                image={post.image}
                breadcrumbs={[
                    { name: "Home", item: "/" },
                    { name: "Blog", item: "/#blog" },
                    { name: "Artigo", item: `/#article-${post.id}` }
                ]}
                schema={articleSchema}
            />

            {/* Reading Progress Bar */}
            <motion.div className="absolute top-0 left-0 right-0 h-1 bg-primary-600 origin-left z-[60]" style={{ scaleX }} />
            
            {/* Header Sticky */}
            <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                    {isMobile && onBack && (
                        <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div className="p-1.5 bg-primary-50 text-primary-600 rounded-lg">
                        <BookOpen size={18} />
                    </div>
                    <span className="font-bold text-sm text-gray-900 truncate max-w-[200px]">Artigo</span>
                </div>
                <button onClick={copyToClipboard} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors" title="Compartilhar">
                    <Share2 size={18} />
                </button>
            </div>

            {/* Content */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 md:px-12 md:py-10 custom-scrollbar">
                <div className="max-w-2xl mx-auto">
                    <header className="mb-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wider mb-4">
                            <Clock size={12} /> Leitura: {post.readTime}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 leading-tight mb-4">
                            {post.title}
                        </h1>
                        
                        <button 
                            onClick={() => onNavigate('about')}
                            className="flex items-center gap-3 group text-left transition-all hover:bg-gray-50 p-2 -ml-2 rounded-xl"
                            title="Ver perfil completo"
                        >
                            <img src="https://i.imgur.com/TNMBi27.jpeg" alt="Author" className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm group-hover:ring-primary-200 transition-all" />
                            <div>
                                <p className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{post.author}</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Engenheiro Frontend Sênior</p>
                            </div>
                        </button>
                    </header>

                    <div className="mb-8">
                        <AudioPlayer text={post.content} />
                    </div>

                    <div className="prose prose-slate prose-headings:font-display prose-a:text-primary-600 max-w-none prose-p:text-gray-600 prose-p:leading-relaxed whitespace-pre-line">
                        {post.content}
                    </div>
                    
                    <div className="mt-12 pt-8 border-t border-gray-100 flex justify-center">
                        <div className="text-center">
                            <p className="text-xs text-gray-400 mb-2">Gostou do conteúdo?</p>
                            <Button variant="outline" size="sm" onClick={copyToClipboard} leftIcon={<Share2 size={14}/>}>Compartilhar Artigo</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LabView = ({ id, isMobile, onBack }: { id: string, isMobile: boolean, onBack?: () => void }) => {
    let Component;
    let title;
    let desc;
    let Icon;

    switch(id) {
        case 'perf':
            Component = RealTimePerformanceDemo;
            title = "Performance Lab";
            desc = "Simulação em tempo real de LCP e CLS.";
            Icon = BarChart3;
            break;
        case 'ai':
            Component = AIArchitectureDemo;
            title = "Engenharia Aumentada";
            desc = "Pipeline de desenvolvimento assistido por IA.";
            Icon = Cpu;
            break;
        case 'mobile':
            Component = ResponsiveResizer;
            title = "Responsividade Fluida";
            desc = "Adaptação de interface para diferentes viewports.";
            Icon = Smartphone;
            break;
        default:
            return null;
    }

    const content = LAB_CONTENT[id as keyof typeof LAB_CONTENT];

    return (
        <div className="flex flex-col h-full bg-white relative">
            <SEO 
                title={`${title} | Knowledge Hub`} 
                description={`Simulação interativa: ${desc}`}
                breadcrumbs={[
                    { name: "Home", item: "/" },
                    { name: "Blog", item: "/#blog" },
                    { name: title, item: `/#${id}` }
                ]}
            />
            
            <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                    {isMobile && onBack && (
                        <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
                        <Icon size={18} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-gray-900">{title}</h3>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider hidden sm:block">Laboratório Interativo</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-8 bg-gray-50 custom-scrollbar flex items-start justify-center">
                <div className="max-w-4xl w-full">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-2">{title}</h1>
                        <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto">{desc}</p>
                    </div>
                    
                    <Component />

                    {content && (
                        <div className="mt-12 bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
                            <h2 className="text-xl font-display font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <div className="w-1 h-6 bg-primary-500 rounded-full"></div>
                                {content.title}
                            </h2>
                            <div className="prose prose-slate prose-sm md:prose-base max-w-none text-gray-600 leading-relaxed space-y-4">
                                {content.paragraphs.map((p, i) => (
                                    <p key={i}>{p}</p>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- MAIN CONTROLLER ---

export const Blog: React.FC<BlogProps> = ({ onNavigate }) => {
  const { content } = useContent();
  const [activeContentId, setActiveContentId] = useState<string | null>(null); // Start null unless logic overrides
  const isMobile = useMobile();

  // Select first article by default on desktop
  useEffect(() => {
      if (!isMobile && !activeContentId) {
          if (content.blogPosts.length > 0) {
              setActiveContentId(content.blogPosts[0].id);
          } else {
              setActiveContentId('perf'); // Fallback to lab
          }
      }
      if (isMobile) {
          setActiveContentId(null);
      }
  }, [isMobile, content.blogPosts]);

  const handleSelect = (id: string) => {
      setActiveContentId(id);
  };

  const handleBack = () => {
      setActiveContentId(null);
  };

  // Determine if active content is a post or a lab
  const activePost = content.blogPosts.find(p => p.id === activeContentId);
  const isLab = ['perf', 'ai', 'mobile'].includes(activeContentId || '');

  return (
    <div className="bg-gray-50 min-h-screen pt-20 md:pt-24 pb-0 flex flex-col h-screen overflow-hidden">
      {!activeContentId && (
          <SEO 
            title="Knowledge Hub | PH Development"
            description="Artigos técnicos e laboratórios interativos sobre desenvolvimento web, performance e IA."
            type="article"
          />
      )}

      <div className="flex-1 flex overflow-hidden max-w-[1920px] mx-auto w-full relative">
          
          {/* SIDEBAR (Navigation) */}
          <aside className={`
            bg-gray-50/50 border-r border-gray-200 flex-col
            ${isMobile ? 'w-full flex' : 'w-80 lg:w-96 flex shrink-0'}
          `}>
              <div className="p-6 border-b border-gray-200 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                  <h2 className="text-xl font-display font-bold text-gray-900 flex items-center gap-2">
                      Knowledge Hub
                      <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Beta</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">Artigos e Experimentos</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                  
                  {/* DYNAMIC POSTS */}
                  {content.blogPosts.map((post) => (
                      <button
                        key={post.id}
                        onClick={() => handleSelect(post.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group text-left border ${
                            activeContentId === post.id && !isMobile
                            ? 'bg-white border-gray-200 shadow-lg shadow-gray-100 scale-[1.02]' 
                            : 'bg-transparent border-transparent hover:bg-white hover:border-gray-100 hover:shadow-sm'
                        }`}
                      >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors overflow-hidden shrink-0 ${
                              activeContentId === post.id && !isMobile
                              ? 'bg-primary-50 text-primary-600'
                              : 'bg-white border border-gray-100 text-gray-400'
                          }`}>
                              {post.image ? <img src={post.image} className="w-full h-full object-cover" /> : <BookOpen size={20} />}
                          </div>
                          <div className="flex-1 min-w-0">
                              <h3 className={`text-sm font-bold truncate ${
                                  activeContentId === post.id && !isMobile ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                  {post.title}
                              </h3>
                              <p className="text-xs text-gray-500 truncate">{post.category}</p>
                          </div>
                          {activeContentId === post.id && !isMobile && (
                              <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                          )}
                          {isMobile && (
                              <ChevronRight size={16} className="text-gray-300" />
                          )}
                      </button>
                  ))}

                  <div className="my-4 border-t border-gray-200"></div>
                  <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Laboratório</p>

                  {/* STATIC LABS */}
                  {STATIC_MENU_ITEMS.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group text-left border ${
                            activeContentId === item.id && !isMobile
                            ? 'bg-white border-gray-200 shadow-lg shadow-gray-100 scale-[1.02]' 
                            : 'bg-transparent border-transparent hover:bg-white hover:border-gray-100 hover:shadow-sm'
                        }`}
                      >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                              activeContentId === item.id && !isMobile
                              ? 'bg-purple-50 text-purple-600'
                              : 'bg-white border border-gray-100 text-gray-400 group-hover:text-purple-600 group-hover:border-purple-100'
                          }`}>
                              <item.icon size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                              <h3 className={`text-sm font-bold truncate ${
                                  activeContentId === item.id && !isMobile ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                  {item.title}
                              </h3>
                              <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
                          </div>
                          {activeContentId === item.id && !isMobile && (
                              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                          )}
                      </button>
                  ))}

                  {/* External/Static Links */}
                  <div className="pt-4 mt-4 border-t border-gray-200">
                      <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Recursos Extras</p>
                      <button 
                        onClick={() => onNavigate('contact')}
                        className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-gray-900 hover:text-white transition-all duration-300 group text-left text-gray-600"
                      >
                          <Zap size={18} className="group-hover:fill-yellow-400 group-hover:text-yellow-400 transition-colors" />
                          <span className="text-xs font-bold">Solicitar Consultoria</span>
                      </button>
                  </div>
              </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className={`
            flex-1 bg-white relative overflow-hidden flex flex-col
            ${isMobile ? 'fixed inset-0 z-50 transition-transform duration-300' : ''}
          `}
          style={{ transform: isMobile ? (activeContentId ? 'translateX(0)' : 'translateX(100%)') : 'none' }}
          >
              <AnimatePresence mode="wait">
                  {activePost && (
                      <motion.div 
                        key={activePost.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                      >
                          <ArticleView post={activePost} isMobile={isMobile} onBack={handleBack} onNavigate={onNavigate} />
                      </motion.div>
                  )}
                  
                  {isLab && activeContentId && (
                      <motion.div 
                        key={activeContentId}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                      >
                          <LabView id={activeContentId} isMobile={isMobile} onBack={handleBack} />
                      </motion.div>
                  )}
              </AnimatePresence>
          </main>

      </div>
    </div>
  );
};
