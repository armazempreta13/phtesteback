
import React, { useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useMobile } from '../hooks/useMobile';

// Dicionário de Termos Técnicos
const TECHNICAL_DICTIONARY: Record<string, string> = {
  "ROI": "Retorno sobre Investimento. Métricas que calculam o lucro obtido em relação ao custo do projeto.",
  "SEO": "Search Engine Optimization. Técnicas para fazer seu site aparecer no topo do Google organicamente.",
  "Boilerplate": "Código base padrão e reutilizável que serve como ponto de partida para acelerar o desenvolvimento.",
  "React": "Biblioteca JavaScript criada pelo Facebook para construir interfaces de usuário modernas e reativas.",
  "Frontend": "A parte visual e interativa do site, tudo aquilo que o usuário vê e interage.",
  "Backend": "A parte lógica que roda no servidor (banco de dados, regras de negócio), invisível ao usuário final.",
  "Pixel-Perfect": "Desenvolvimento com precisão milimétrica, reproduzindo exatamente o design original.",
  "UX/UI": "User Experience (Experiência do Usuário) e User Interface (Interface do Usuário). Foco em usabilidade e beleza.",
  "API": "Interface que permite que diferentes sistemas 'conversem' entre si e troquem dados.",
  "Deploy": "O ato de publicar o site, colocando-o no ar para acesso público na internet.",
  "CMS": "Sistema de Gerenciamento de Conteúdo (ex: WordPress), que permite editar textos sem mexer no código.",
  "Responsivo": "Capacidade do site se adaptar automaticamente a telas de celulares, tablets e computadores.",
  "TypeScript": "Uma evolução do JavaScript que adiciona tipagem estática, garantindo código mais seguro e sem erros.",
  "Next.js": "Framework baseado em React que oferece performance superior e otimização para motores de busca.",
  "Performance": "Velocidade de carregamento e resposta do site. Fator crucial para retenção de usuários e Google.",
  "Web Vitals": "Métricas oficiais do Google para medir a qualidade da experiência do usuário na web.",
  "Lead": "Um visitante que demonstrou interesse no seu serviço, geralmente preenchendo um formulário.",
  "Conversão": "Quando um visitante realiza a ação específica desejada (compra, contato, cadastro).",
  "SaaS": "Software as a Service. Aplicações web vendidas como serviço (assinatura), não como produto instalado.",
  "Landing Page": "Página única focada em uma ação específica, como vender um produto ou capturar um lead.",
  "PWA": "Progressive Web App. Sites que se comportam como aplicativos nativos (instalam no celular, funcionam offline).",
  "Escalável": "Sistema preparado para crescer (mais usuários, mais dados) sem perder performance ou quebrar.",
  "QA": "Quality Assurance. Processos de garantia de qualidade para assegurar que o software não tenha defeitos.",
  "C-Suite": "Executivos de alto nível (CEO, CTO, CFO). Refere-se a um padrão de qualidade executiva.",
  "Algorítmica": "Baseada em regras lógicas e matemáticas precisas, eliminando a subjetividade humana.",
  "Engenharia Aumentada": "Uso estratégico de IA para potencializar a velocidade e precisão do desenvolvimento de software.",
  "Bug": "Falha ou erro no código que causa comportamento inesperado.",
  "Freelancer": "Profissional independente que trabalha por projetos, oferecendo flexibilidade e especialização.",
  "One Page": "Site onde todo o conteúdo está em uma única página longa, com navegação por rolagem.",
  "Tailwind": "Framework CSS utilitário que permite estilização rápida e consistente direto no HTML.",
  "Vite": "Ferramenta de construção de projetos web extremamente rápida para desenvolvimento moderno.",
  "Zero-bug": "Estado ideal onde o software foi testado exaustivamente e não apresenta falhas conhecidas."
};

interface SmartTextProps {
  children: string;
  className?: string;
}

type Placement = 'top' | 'bottom' | 'left' | 'right';

interface TooltipPosition {
  x: number;
  y: number;
  placement: Placement;
}

// Portal with existence check optimization
const Portal = ({ children }: { children?: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  if (!mounted || typeof document === 'undefined') return null;
  // Fix #306: Ensure children is not undefined
  return createPortal(children || null, document.body);
};

// Memoized Tooltip Component to prevent re-renders of the logic
const TermTooltip = React.memo(({ term, definition }: { term: string; definition: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<TooltipPosition | null>(null);
  
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const GAP = 12; 
  const TOOLTIP_MAX_WIDTH = 280;
  const SCREEN_PADDING = 12;

  // Optimized Position Calculation
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Pre-calculate centers to avoid repetitive math
    const triggerCenterX = triggerRect.left + (triggerRect.width / 2);
    const triggerCenterY = triggerRect.top + (triggerRect.height / 2);
    const halfTooltipHeight = tooltipRect.height / 2;
    const halfTooltipWidth = tooltipRect.width / 2;

    const positions: Record<Placement, TooltipPosition> = {
      right: {
        x: triggerRect.right + GAP,
        y: triggerCenterY - halfTooltipHeight,
        placement: 'right'
      },
      left: {
        x: triggerRect.left - tooltipRect.width - GAP,
        y: triggerCenterY - halfTooltipHeight,
        placement: 'left'
      },
      top: {
        x: triggerCenterX - halfTooltipWidth,
        y: triggerRect.top - tooltipRect.height - GAP,
        placement: 'top'
      },
      bottom: {
        x: triggerCenterX - halfTooltipWidth,
        y: triggerRect.bottom + GAP,
        placement: 'bottom'
      }
    };

    const isMobile = viewportWidth < 768;
    // Prefer vertical on mobile to avoid off-screen horizontal issues
    const preferenceOrder: Placement[] = isMobile 
      ? ['bottom', 'top', 'right', 'left'] 
      : ['right', 'left', 'bottom', 'top'];

    let bestPos: TooltipPosition | null = null;

    for (const place of preferenceOrder) {
      const pos = positions[place];
      
      // Boundary checks
      const fitsLeft = pos.x >= SCREEN_PADDING;
      const fitsRight = pos.x + tooltipRect.width <= viewportWidth - SCREEN_PADDING;
      const fitsTop = pos.y >= SCREEN_PADDING;
      const fitsBottom = pos.y + tooltipRect.height <= viewportHeight - SCREEN_PADDING;

      if (fitsLeft && fitsRight && fitsTop && fitsBottom) {
        bestPos = pos;
        break;
      }
    }

    // Fallback strategy if no perfect fit
    if (!bestPos) {
       if (triggerRect.top > viewportHeight / 2) {
          bestPos = positions.top;
       } else {
          bestPos = positions.bottom;
       }
       // Horizontal Clamp
       bestPos.x = Math.max(SCREEN_PADDING, Math.min(bestPos.x, viewportWidth - tooltipRect.width - SCREEN_PADDING));
    }

    setCoords(bestPos);
  }, []);

  // Performance Optimization: Use RequestAnimationFrame for scroll events
  useEffect(() => {
    if (!isOpen) return;

    let rAFId: number;
    
    const onFrame = () => {
      calculatePosition();
    };

    const onScrollOrResize = () => {
      cancelAnimationFrame(rAFId);
      rAFId = requestAnimationFrame(onFrame);
    };

    // Use passive listeners for better scroll performance on mobile
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });
    
    // Initial calculation
    calculatePosition();

    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      cancelAnimationFrame(rAFId);
    };
  }, [isOpen, calculatePosition]);

  // Handle Hover Logic
  const handleMouseEnter = useCallback(() => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setIsOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => setIsOpen(false), 250);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(prev => !prev);
  }, []);

  // Define spring animation for fluid entrance
  const springTransition = { type: "spring" as const, stiffness: 400, damping: 25 };

  const getAnimationVariants = (placement: Placement) => {
    const d = 10; // slightly larger distance for clearer movement
    const variants = {
      top: { y: d, x: 0 },
      bottom: { y: -d, x: 0 },
      left: { x: d, y: 0 },
      right: { x: -d, y: 0 }
    };
    
    return {
      initial: { opacity: 0, scale: 0.9, ...variants[placement] },
      animate: { opacity: 1, scale: 1, x: 0, y: 0 }
    };
  };

  const BG_COLOR = "bg-[#0B0D12]";

  return (
    <>
      <span 
        ref={triggerRef}
        className="
          group relative inline-block cursor-help font-medium
          text-gray-700 transition-all duration-300
          border-b border-dashed border-gray-400/60 hover:border-primary-500 
          hover:text-primary-700 hover:bg-primary-50/50 rounded-sm px-0.5 mx-0.5
          tap-highlight-transparent
        "
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {term}
      </span>
      
      <Portal>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={tooltipRef}
              initial={coords ? getAnimationVariants(coords.placement).initial : { opacity: 0 }}
              animate={coords ? getAnimationVariants(coords.placement).animate : { opacity: 0 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              transition={springTransition}
              style={{ 
                position: 'fixed',
                top: coords ? coords.y : 0,
                left: coords ? coords.x : 0,
                width: TOOLTIP_MAX_WIDTH,
                zIndex: 99999,
                visibility: coords ? 'visible' : 'hidden', // Avoid flash of unpositioned content
                pointerEvents: 'none' // Wrapper shouldn't block, inner div handles events
              }}
              className="drop-shadow-2xl" 
            >
              <div 
                className={`
                  ${BG_COLOR}/95 backdrop-blur-xl 
                  border border-white/10 
                  rounded-xl overflow-hidden relative text-left
                  shadow-[0_8px_32px_rgba(0,0,0,0.5)]
                  ring-1 ring-white/5
                `}
                style={{ pointerEvents: 'auto' }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {/* Accent Line Top */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-80" />

                <div className="p-4 relative">
                    {/* Header Row */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center justify-center w-5 h-5 rounded-md bg-primary-500/10 border border-primary-500/20 text-primary-400">
                           <Sparkles size={10} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">
                           Definição
                        </span>
                    </div>
                    
                    {/* Term Title */}
                    <h4 className="text-lg font-bold text-white mb-3 tracking-tight font-display">
                       {term}
                    </h4>
                    
                    {/* Definition Body */}
                    <div className="relative pl-3 border-l-2 border-primary-500/30">
                        <p className="text-sm text-gray-300 leading-relaxed font-light">
                            {definition}
                        </p>
                    </div>
                </div>

                {/* Arrow */}
                {coords && (
                  <div
                    className={`absolute w-3 h-3 ${BG_COLOR} border border-white/10 rotate-45 z-0`}
                    style={{
                      ...(coords.placement === 'right' && { left: -5, top: '50%', marginTop: -6, borderRight: 'none', borderTop: 'none' }),
                      ...(coords.placement === 'left' && { right: -5, top: '50%', marginTop: -6, borderLeft: 'none', borderBottom: 'none' }),
                      ...(coords.placement === 'top' && { bottom: -5, left: '50%', marginLeft: -6, borderTop: 'none', borderLeft: 'none' }),
                      ...(coords.placement === 'bottom' && { top: -5, left: '50%', marginLeft: -6, borderBottom: 'none', borderRight: 'none' }),
                    }}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
});

// Memoized Parent Component to avoid regex recalculations
export const SmartText: React.FC<SmartTextProps> = React.memo(({ children, className = "" }) => {
  const isMobile = useMobile();

  const regex = useMemo(() => {
    const keys = Object.keys(TECHNICAL_DICTIONARY).sort((a, b) => b.length - a.length);
    return new RegExp(`\\b(${keys.join('|')})\\b`, 'gi');
  }, []);

  // Memoize parts to prevent re-mapping if children string is stable
  const content = useMemo(() => {
    if (!children) return null; // Safe to return null inside useMemo callback
    
    // Optimization: Skip processing for mobile, but keep hook execution order consistent
    if (isMobile) return null;

    const parts = children.split(regex);
    return parts.map((part, i) => {
      const lowerPart = part.toLowerCase();
      const matchedKey = Object.keys(TECHNICAL_DICTIONARY).find(
        key => key.toLowerCase() === lowerPart
      );

      if (matchedKey) {
        return (
          <TermTooltip 
            key={`${matchedKey}-${i}`} 
            term={part} 
            definition={TECHNICAL_DICTIONARY[matchedKey]} 
          />
        );
      }

      return <React.Fragment key={i}>{part}</React.Fragment>;
    });
  }, [children, regex, isMobile]);

  // Conditional Rendering AFTER hooks
  if (isMobile) {
      return <span className={className}>{children}</span>;
  }

  if (!children) return null;

  return (
    <span className={className}>
      {content}
    </span>
  );
});
