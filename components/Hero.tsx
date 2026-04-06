
import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, MessageSquare, Zap, FileCode2, Cpu, Wind, Atom, 
  Files, Search as SearchIcon, GitBranch, Bug, Settings, ChevronDown, ChevronRight, X, FileCode
} from 'lucide-react';
import { Button } from './Button';
import { motion } from 'framer-motion';
import { ViewType } from '../types';
import { InteractiveBackground } from './InteractiveBackground';
import { useContent } from '../contexts/ContentContext';
import { SmartText } from './SmartText';
import { useMobile } from '../hooks/useMobile';
import { SEO } from './SEO';

interface HeroProps {
  onNavigate: (view: ViewType) => void;
  onOpenChat: () => void;
}

const useTypewriter = (words: string[], typeSpeed = 150, deleteSpeed = 100, pauseDuration = 2000) => {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  
  useEffect(() => {
    if (!words || words.length === 0) return;
    
    const currentWord = words[wordIndex % words.length];
    
    const handleTyping = () => {
      setText(current => {
        if (isDeleting) {
          return currentWord.substring(0, current.length - 1);
        } else {
          return currentWord.substring(0, current.length + 1);
        }
      });

      if (!isDeleting && text === currentWord) {
        setTimeout(() => setIsDeleting(true), pauseDuration);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length);
      }
    };

    const timer = setTimeout(handleTyping, isDeleting ? deleteSpeed : typeSpeed);

    return () => clearTimeout(timer);
  }, [text, isDeleting, wordIndex, words, typeSpeed, deleteSpeed, pauseDuration]);

  return text;
};

const MemoizedBackground = React.memo(InteractiveBackground);

const CodeTypewriter = ({ text }: { text: string }) => {
    return (
        <div className="font-mono text-xs sm:text-sm leading-relaxed min-h-[140px] md:min-h-[160px] w-full">
            <div className="flex items-center justify-between border-b border-gray-700 pb-3 mb-3 select-none">
                <div className="flex items-center gap-2">
                    <FileCode2 size={14} className="text-blue-400" />
                    <span className="text-gray-400 text-[10px] sm:text-xs font-medium">Hero.tsx</span>
                </div>
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-700"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-700"></div>
                </div>
            </div>
            
            <div className="whitespace-pre-wrap font-mono">
                <div className="flex items-center gap-2 text-gray-400">
                    <span className="text-purple-400">const</span> 
                    <span className="text-yellow-400">Exp</span> 
                    <span className="text-white">=</span> 
                    <span className="text-purple-400">{'=>'}</span> 
                    <span className="text-yellow-400">{'{'}</span>
                </div>
                <div className="pl-4 text-gray-300">
                    <span className="text-purple-400">return</span> <span className="text-gray-400">(</span>
                </div>
                <div className="pl-8 text-gray-300">
                    <span className="text-gray-500">{'<'}</span>
                    <span className="text-red-400">Hero</span>
                </div>
                <div className="pl-12 text-gray-300">
                    <span className="text-purple-300">trait</span>
                    <span className="text-white">=</span>
                    <span className="text-green-300">"</span>
                    <span className="text-green-300 font-bold tracking-wider inline-block min-w-[80px]">
                      {text}
                    </span>
                    <span className="inline-block w-1.5 h-3.5 bg-primary-400 ml-0.5 align-middle animate-pulse"></span>
                    <span className="text-green-300">"</span>
                </div>
                <div className="pl-8 text-gray-300">
                    <span className="text-gray-500">{'/>'}</span>
                </div>
                <div className="pl-4 text-gray-300">
                    <span className="text-gray-400">);</span>
                </div>
                <div className="text-gray-400">
                    <span className="text-yellow-400">{'}'}</span>
                </div>
            </div>
        </div>
    );
};

const TechIcon = ({ children, label, color, hoverColor }: { children?: React.ReactNode; label: string; color: string; hoverColor: string }) => (
  <div className="flex items-center gap-2 group cursor-default relative">
    <div className={`absolute inset-0 blur-lg rounded-full opacity-0 md:group-hover:opacity-40 transition-opacity duration-500`} style={{ backgroundColor: color }}></div>
    <div className={`relative z-10 transition-colors duration-300 text-gray-400 md:group-hover:text-[${hoverColor}]`} style={{ color: 'inherit' }}>
       <div className="md:group-hover:text-current transition-colors duration-300" style={{ color: undefined }}>
          {children}
       </div>
    </div>
    <span className={`text-sm font-semibold text-gray-400 transition-colors duration-300 hidden sm:block md:group-hover:text-gray-900`}>
      {label}
    </span>
  </div>
);

const DefaultHeroLayout: React.FC<HeroProps> = ({ onNavigate, onOpenChat }) => {
  const { content } = useContent();
  const HERO_CONFIG = content.hero;
  
  const dynamicText = useTypewriter(HERO_CONFIG.DYNAMIC_WORDS, 100, 50, 2000);
  const isMobile = useMobile();

  return (
    <section className="relative min-h-screen flex flex-col pt-24 md:pt-28 pb-10 overflow-hidden font-sans">
      <SEO 
        title="Desenvolvedor Frontend & UI Specialist"
        description="Especialista em criar sites de alta performance, Landing Pages que vendem e aplicações React modernas. Transforme seu negócio digital."
        keywords={["Freelancer Frontend", "Programador React", "Criação de Landing Page", "Desenvolvedor Web Brasil"]}
      />
      
      <MemoizedBackground />
      
      <div className="container mx-auto px-4 md:px-8 flex-grow flex flex-col justify-center relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 xl:gap-20">
          
          <div className="flex-1 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-[10px] md:text-xs font-bold tracking-wide uppercase mb-6 shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              {HERO_CONFIG.STATUS_BADGE}
            </motion.div>

            {/* Adjusted typography for notebook screens (lg:text-6xl instead of 7xl) */}
            <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-gray-900 leading-[1.15] mb-4 md:mb-6 tracking-tight relative z-20">
              <motion.span
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ duration: 0.5, delay: 0.1 }}
              >
                  {HERO_CONFIG.TITLE_PREFIX} <br className="hidden lg:block"/> {HERO_CONFIG.TITLE_HIGHLIGHT}{' '}
              </motion.span>
              
              <div className="block md:inline-block relative w-full md:w-auto md:min-w-[350px] text-center md:text-left align-top cursor-default h-[1.15em] mt-1 md:mt-0">
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-blue-600 pb-2 whitespace-nowrap">
                    {dynamicText}
                    <span className="inline-block w-[2px] md:w-[6px] h-[0.8em] bg-primary-500 ml-1 animate-pulse align-middle"></span>
                  </span>
              </div>
            </h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light px-2 md:px-0"
            >
              <SmartText>
                 {`${HERO_CONFIG.SUBTITLE_START} ${HERO_CONFIG.SUBTITLE_HIGHLIGHT_1} ${HERO_CONFIG.SUBTITLE_MIDDLE} ${HERO_CONFIG.SUBTITLE_HIGHLIGHT_2} ${HERO_CONFIG.SUBTITLE_END}`}
              </SmartText>
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 px-4 sm:px-0"
            >
              <Button 
                size="lg" 
                rightIcon={<MessageSquare size={18} />} 
                onClick={onOpenChat}
                className="shadow-xl shadow-primary-600/20 w-full sm:w-auto min-h-[48px] text-sm md:text-base"
              >
                {HERO_CONFIG.CTA_PRIMARY}
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                leftIcon={<ArrowRight size={18} />}
                onClick={() => onNavigate('portfolio')}
                className="bg-white/80 backdrop-blur-sm hover:bg-white w-full sm:w-auto min-h-[48px] text-sm md:text-base"
              >
                {HERO_CONFIG.CTA_SECONDARY}
              </Button>
            </motion.div>
          </div>

          {/* CODE BLOCK AREA */}
          <div className="flex-1 w-full flex justify-center relative min-h-[280px] lg:min-h-[350px] items-center mt-8 lg:mt-0 px-4">
                 
             <motion.div 
                initial={{ opacity: 0, x: 50, y: 20 }}
                animate={{ opacity: 1, x: 0, y: [0, -10, 0] }} // Reduced float distance
                transition={{ 
                       opacity: { duration: 0.8, delay: 0.4 },
                       x: { duration: 0.8, delay: 0.4 },
                       y: { duration: 6, repeat: Infinity, ease: "easeInOut" } 
                }}
                className="relative z-10 bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-700 p-5 shadow-2xl w-full max-w-[420px]"
             >
                <div className="flex gap-2 mb-4 border-b border-gray-800 pb-3">
                   <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                   <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                   <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                </div>

                <CodeTypewriter text={dynamicText} />
                
                <div className="absolute -bottom-3 -right-3 bg-white text-gray-900 px-3 py-1.5 rounded-lg shadow-xl border border-gray-100 flex items-center gap-2 font-bold text-[10px] md:text-xs">
                   <Zap size={12} className="text-yellow-500 fill-yellow-500"/> Live Coding
                </div>
             </motion.div>

             {/* Reduced Blur Size for Performance */}
             <div className="absolute top-10 right-10 w-32 h-32 md:w-48 md:h-48 bg-primary-500/15 rounded-full blur-[40px] -z-10"></div>
          </div>
        </div>

        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.8, duration: 1 }}
           className="mt-12 md:mt-20 border-t border-gray-100 pt-6 md:pt-8 pb-4"
        >
           <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">
              Stack de Alta Performance
           </p>
           <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 opacity-90 px-4">
              <div className="text-blue-400 transform scale-90 md:scale-100">
                <TechIcon label="React" color="#60a5fa" hoverColor="#60a5fa">
                  <Atom className="w-7 h-7 md:w-9 md:h-9" strokeWidth={1.5} />
                </TechIcon>
              </div>
              <div className="text-blue-600 transform scale-90 md:scale-100">
                <TechIcon label="TypeScript" color="#2563eb" hoverColor="#2563eb">
                  <FileCode2 className="w-[26px] h-[26px] md:w-[34px] md:h-[34px]" strokeWidth={1.5} />
                </TechIcon>
              </div>
              <div className="text-cyan-400 transform scale-90 md:scale-100">
                <TechIcon label="Tailwind" color="#22d3ee" hoverColor="#22d3ee">
                  <Wind className="w-[26px] h-[26px] md:w-[34px] md:h-[34px]" strokeWidth={1.5} />
                </TechIcon>
              </div>
              <div className="text-gray-800 transform scale-90 md:scale-100">
                <TechIcon label="Next.js" color="#1f2937" hoverColor="#000000">
                  <Cpu className="w-7 h-7 md:w-9 md:h-9" strokeWidth={1.5} />
                </TechIcon>
              </div>
           </div>
        </motion.div>
      </div>
    </section>
  );
};

export const Hero = DefaultHeroLayout;
