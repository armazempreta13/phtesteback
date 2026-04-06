import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Smartphone, Tablet, Monitor, Zap, Cpu, Layout, 
    FileCode2, AlertTriangle, Terminal, CheckCircle2, 
    Clock, Activity, Server, Database, Globe, Play, RotateCcw,
    Image as ImageIcon, MousePointer2, Sparkles, Command, Hash, Wand2, Loader2
} from 'lucide-react';

// --- UTILS ---
const formatTime = (ms: number) => (ms / 1000).toFixed(2) + 's';

// --- 1. PERFORMANCE DEMO: TELEMETRY DASHBOARD (LIGHT THEME) ---

export const RealTimePerformanceDemo = () => {
  const [status, setStatus] = useState<'idle' | 'running' | 'finished'>('idle');
  
  // Metrics
  const [phTime, setPhTime] = useState(0);
  const [legacyTime, setLegacyTime] = useState(0);
  
  // Progress (0-100)
  const [phProgress, setPhProgress] = useState(0);
  const [legacyProgress, setLegacyProgress] = useState(0);

  const requestRef = useRef<number>(0);

  const startSimulation = () => {
    setStatus('running');
    setPhTime(0);
    setLegacyTime(0);
    setPhProgress(0);
    setLegacyProgress(0);

    let startTime = performance.now();

    const animate = (time: number) => {
        const elapsed = time - startTime;
        
        // PH Site Logic (Fast, Linear)
        const phP = Math.min(100, (elapsed / 400) * 100);
        setPhProgress(phP);
        if (phP < 100) setPhTime(elapsed);
        else setPhTime(400); // Clamp

        // Legacy Site Logic (Slow, Stuttery)
        let legacyP = 0;
        if (elapsed < 600) {
            legacyP = (elapsed / 600) * 20; 
        } else if (elapsed < 1200) {
            legacyP = 20; // JS BLOCKING
        } else if (elapsed < 2500) {
            legacyP = 20 + ((elapsed - 1200) / 1300) * 80;
        } else {
            legacyP = 100;
        }
        
        setLegacyProgress(Math.min(100, legacyP));
        if (legacyP < 100) setLegacyTime(elapsed);
        else setLegacyTime(2500); // Clamp

        if (phP < 100 || legacyP < 100) {
            requestRef.current = requestAnimationFrame(animate);
        } else {
            setStatus('finished');
        }
    };

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
      const timer = setTimeout(startSimulation, 500);
      return () => {
          clearTimeout(timer);
          if (requestRef.current) cancelAnimationFrame(requestRef.current);
      }
  }, []);

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200 overflow-hidden text-slate-600 font-sans shadow-xl">
        {/* Header */}
        <div className="bg-slate-50/80 p-4 border-b border-slate-200 flex justify-between items-center backdrop-blur-sm">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                    <Activity size={18} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-800">Telemetria de Carregamento</h3>
                    <p className="text-[10px] text-slate-500 font-mono">Lighthouse Engine v4.0</p>
                </div>
            </div>
            <button 
                onClick={startSimulation}
                disabled={status === 'running'}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {status === 'running' ? <Clock size={12} className="animate-spin"/> : <RotateCcw size={12} />}
                <span>Re-testar</span>
            </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-8 bg-white">
            
            {/* TRACK 1: PH OPTIMIZED */}
            <div className="relative">
                <div className="flex justify-between mb-2 text-xs font-medium">
                    <div className="flex items-center gap-2 text-emerald-600">
                        <Zap size={14} fill="currentColor" />
                        <span>Arquitetura PH (SSG)</span>
                    </div>
                    <span className="font-mono text-slate-900 font-bold">{formatTime(phTime)}</span>
                </div>
                
                <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
                    {[1,2,3,4].map(i => <div key={i} className="absolute h-full border-r border-slate-200 top-0" style={{left: `${i*20}%`}}></div>)}
                    <motion.div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 relative z-10 rounded-full"
                        style={{ width: `${phProgress}%` }}
                    />
                </div>
            </div>

            {/* TRACK 2: LEGACY */}
            <div className="relative">
                <div className="flex justify-between mb-2 text-xs font-medium">
                    <div className="flex items-center gap-2 text-red-500">
                        <Server size={14} />
                        <span>Site Comum (Legacy)</span>
                    </div>
                    <span className="font-mono text-slate-900 font-bold">{formatTime(legacyTime)}</span>
                </div>
                
                <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
                    {[1,2,3,4].map(i => <div key={i} className="absolute h-full border-r border-slate-200 top-0" style={{left: `${i*20}%`}}></div>)}
                    <motion.div 
                        className="h-full bg-gradient-to-r from-red-500 to-red-400 relative z-10 flex items-center justify-end pr-2 rounded-full"
                        style={{ width: `${legacyProgress}%` }}
                    >
                        {status === 'running' && legacyTime > 600 && legacyTime < 1200 && (
                            <div className="flex items-center gap-1 text-[9px] font-bold text-white whitespace-nowrap">
                                <AlertTriangle size={8} fill="currentColor" /> BLOCKED
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* METRICS COMPARISON */}
            <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col items-center justify-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-bold">Core Web Vitals</span>
                    <div className="flex items-baseline gap-1 text-emerald-600">
                        <span className="text-3xl font-display font-bold">99</span>
                        <span className="text-xs font-medium text-slate-400">/100</span>
                    </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col items-center justify-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-bold">Taxa de Conversão</span>
                    <div className="flex items-baseline gap-1 text-blue-600">
                        <span className="text-3xl font-display font-bold">+40%</span>
                    </div>
                </div>
            </div>

        </div>
    </div>
  );
};

// --- 2. AI PIPELINE DEMO: CINEMATIC BUILD (LIGHT THEME) ---

const TerminalWindow = ({ onComplete }: { onComplete: () => void }) => {
    const [lines, setLines] = useState<string[]>([]);
    
    useEffect(() => {
        const sequence = [
            { text: "npx create-premium-ui --template=high-performance", delay: 200 },
            { text: "installing dependencies: framer-motion, react, tailwind...", delay: 800 },
            { text: "analyzing design tokens...", delay: 1500 },
            { text: "optimizing core_vitals...", delay: 2200 },
            { text: ">> BUILD SUCCESSFUL in 400ms", delay: 3000 },
        ];

        let timeouts: ReturnType<typeof setTimeout>[] = [];

        sequence.forEach(({ text, delay }, index) => {
            const timeout = setTimeout(() => {
                setLines(prev => [...prev, text]);
                if (index === sequence.length - 1) {
                    setTimeout(onComplete, 1000);
                }
            }, delay);
            timeouts.push(timeout);
        });

        return () => timeouts.forEach(clearTimeout);
    }, []);

    return (
        <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            className="absolute z-30 bg-slate-900/90 backdrop-blur-md rounded-lg shadow-2xl p-4 font-mono text-xs w-[320px] border border-slate-700/50"
        >
            <div className="flex gap-1.5 mb-3 border-b border-slate-700/50 pb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
            </div>
            <div className="space-y-1.5">
                {lines.map((line, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={i === lines.length - 1 ? "text-green-400" : "text-slate-300"}>
                        <span className="opacity-50 mr-2">$</span>{line}
                    </motion.div>
                ))}
                <motion.div 
                    animate={{ opacity: [0, 1] }} 
                    transition={{ repeat: Infinity, duration: 0.5 }}
                    className="w-2 h-4 bg-green-500 inline-block align-middle"
                />
            </div>
        </motion.div>
    );
};

export const AIArchitectureDemo = () => {
    // Phase 0: Terminal
    // Phase 1: Wireframe (Grey Blocks)
    // Phase 2: Refinement (Cursor Moving)
    // Phase 3: Final Polish (Sparkles)
    const [phase, setPhase] = useState(0);
    const [cursorPos, setCursorPos] = useState({ x: '100%', y: '100%' });
    const [isClicking, setIsClicking] = useState(false);
    const [polishedItems, setPolishedItems] = useState<string[]>([]);

    const restart = () => {
        setPhase(0);
        setCursorPos({ x: '100%', y: '100%' });
        setPolishedItems([]);
        setIsClicking(false);
    };

    useEffect(() => {
        if (phase === 1) {
            // Transition from Wireframe to Refinement quickly
            setTimeout(() => setPhase(2), 2000);
        }
        
        if (phase === 2) {
            // Sequence of cursor movements
            const sequence = async () => {
                const moveTime = 800; // Duration of move
                const pressTime = 200; // Duration of click hold
                const reactionTime = 400; // Wait after click before next move

                // 1. Move to Title
                await new Promise(r => setTimeout(r, 500));
                setCursorPos({ x: '25%', y: '38%' });
                await new Promise(r => setTimeout(r, moveTime));
                
                // Click Title
                setIsClicking(true);
                await new Promise(r => setTimeout(r, pressTime));
                setPolishedItems(prev => [...prev, 'title']);
                setIsClicking(false);
                await new Promise(r => setTimeout(r, reactionTime));
                
                // 2. Move to Subtitle
                setCursorPos({ x: '25%', y: '50%' });
                await new Promise(r => setTimeout(r, moveTime));

                // Click Subtitle
                setIsClicking(true);
                await new Promise(r => setTimeout(r, pressTime));
                setPolishedItems(prev => [...prev, 'subtitle']);
                setIsClicking(false);
                await new Promise(r => setTimeout(r, reactionTime));

                // 3. Move to CTA
                setCursorPos({ x: '22%', y: '68%' });
                await new Promise(r => setTimeout(r, moveTime));

                // Click CTA
                setIsClicking(true);
                await new Promise(r => setTimeout(r, pressTime));
                setPolishedItems(prev => [...prev, 'cta']);
                setIsClicking(false);
                
                // Finish
                await new Promise(r => setTimeout(r, 800));
                setPhase(3);
                await new Promise(r => setTimeout(r, 4000));
                restart();
            };
            sequence();
        }
    }, [phase]);

    return (
        <div className="w-full bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden relative shadow-xl h-[400px] flex flex-col">
            
            {/* Browser Chrome */}
            <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between z-20 shrink-0">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                </div>
                <div className="bg-slate-100 rounded-md px-3 py-1 text-[10px] font-medium text-slate-400 flex items-center gap-2">
                    {phase === 0 ? <Loader2 size={10} className="animate-spin"/> : <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                    localhost:3000
                </div>
                <div className="w-10"></div>
            </div>

            {/* Canvas */}
            <div className="relative flex-1 bg-white flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-50"></div>

                <AnimatePresence>
                    {phase === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center z-40 bg-white/50 backdrop-blur-sm">
                            <TerminalWindow onComplete={() => setPhase(1)} />
                        </div>
                    )}
                </AnimatePresence>

                {/* The Site Mockup */}
                {phase > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-[80%] h-[80%] bg-white rounded-xl shadow-2xl border border-slate-100 relative overflow-hidden flex flex-col"
                    >
                        {/* Mockup Header */}
                        <div className="h-12 border-b border-slate-100 flex items-center justify-between px-6">
                            <div className="w-6 h-6 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-xs">P</div>
                            <div className="flex gap-4">
                                <div className="w-12 h-2 bg-slate-100 rounded-full"></div>
                                <div className="w-12 h-2 bg-slate-100 rounded-full"></div>
                            </div>
                        </div>

                        {/* Mockup Body */}
                        <div className="flex-1 p-8 flex flex-col justify-center items-start">
                            
                            {/* Title Element */}
                            <div className="relative mb-4 w-full max-w-md">
                                <AnimatePresence mode="wait">
                                    {(!polishedItems.includes('title') && phase < 3) ? (
                                        <motion.div 
                                            key="skeleton"
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            className="h-8 w-3/4 bg-slate-200 rounded-lg animate-pulse"
                                        />
                                    ) : (
                                        <motion.h1 
                                            key="text"
                                            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                                            className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight"
                                        >
                                            Experiência Digital <span className="text-primary-600">Premium</span>
                                        </motion.h1>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Subtitle Element */}
                            <div className="relative mb-8 w-full max-w-sm">
                                <AnimatePresence mode="wait">
                                    {(!polishedItems.includes('subtitle') && phase < 3) ? (
                                        <div className="space-y-2">
                                            <motion.div className="h-3 w-full bg-slate-100 rounded animate-pulse" />
                                            <motion.div className="h-3 w-2/3 bg-slate-100 rounded animate-pulse" />
                                        </div>
                                    ) : (
                                        <motion.p 
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            className="text-sm text-slate-500 leading-relaxed"
                                        >
                                            Transformamos sua visão em software de alta performance com design pixel-perfect.
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* CTA Element */}
                            <div className="relative">
                                <AnimatePresence mode="wait">
                                    {(!polishedItems.includes('cta') && phase < 3) ? (
                                        <motion.div className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse" />
                                    ) : (
                                        <motion.button 
                                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                            className="h-10 px-6 bg-primary-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-primary-600/30 flex items-center gap-2"
                                        >
                                            Começar Agora <span className="text-primary-200">→</span>
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                            </div>

                        </div>

                        {/* Loading/Processing Badge (Phase 1) */}
                        {phase === 1 && (
                            <motion.div 
                                initial={{ y: -20, opacity: 0 }} animate={{ y: 20, opacity: 1 }}
                                className="absolute top-0 right-8 bg-white border border-slate-200 shadow-lg px-3 py-1.5 rounded-full flex items-center gap-2 z-20"
                            >
                                <Cpu size={14} className="text-primary-600 animate-spin-slow" />
                                <span className="text-[10px] font-bold text-slate-600">AI Generating Wireframe...</span>
                            </motion.div>
                        )}

                        {/* Celebration (Phase 3) */}
                        {phase === 3 && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                                className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center"
                            >
                                <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]"></div>
                                <div className="bg-white px-6 py-4 rounded-2xl shadow-2xl border border-primary-100 flex flex-col items-center gap-2 transform rotate-[-2deg]">
                                    <div className="p-3 bg-green-100 text-green-600 rounded-full mb-1">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">Site Pronto!</h3>
                                    <p className="text-xs text-slate-500">Otimizado e Responsivo</p>
                                </div>
                                <Sparkles className="absolute top-1/4 left-1/4 text-yellow-400 w-12 h-12 animate-pulse" />
                                <Sparkles className="absolute bottom-1/4 right-1/4 text-purple-400 w-8 h-8 animate-pulse delay-100" />
                            </motion.div>
                        )}

                    </motion.div>
                )}

                {/* Cursor Overlay (Phase 2) */}
                {phase === 2 && (
                    <motion.div
                        className="absolute z-50 pointer-events-none"
                        animate={{ 
                            top: cursorPos.y, 
                            left: cursorPos.x,
                            scale: isClicking ? 0.85 : 1
                        }}
                        transition={{ 
                            top: { type: "spring", stiffness: 150, damping: 20 },
                            left: { type: "spring", stiffness: 150, damping: 20 },
                            scale: { duration: 0.1 }
                        }}
                    >
                        <MousePointer2 className="text-black fill-white drop-shadow-xl w-6 h-6" />
                        <motion.div 
                            initial={{ opacity: 0, x: 10 }} 
                            animate={{ opacity: 1, x: 10 }}
                            className="absolute left-4 top-4 bg-black text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap flex items-center gap-1"
                        >
                            <Wand2 size={10} className="text-yellow-300"/> Refining UI...
                        </motion.div>
                    </motion.div>
                )}

            </div>

            {/* Footer Progress */}
            <div className="bg-slate-50 border-t border-slate-200 p-2">
                <div className="flex gap-1 h-1">
                    <motion.div className="h-full bg-slate-200 rounded-full flex-1 overflow-hidden">
                        <motion.div className="h-full bg-primary-600" initial={{width:0}} animate={{width: phase >= 1 ? '100%' : '0%'}} />
                    </motion.div>
                    <motion.div className="h-full bg-slate-200 rounded-full flex-1 overflow-hidden">
                        <motion.div className="h-full bg-primary-600" initial={{width:0}} animate={{width: phase >= 2 ? '100%' : '0%'}} />
                    </motion.div>
                    <motion.div className="h-full bg-slate-200 rounded-full flex-1 overflow-hidden">
                        <motion.div className="h-full bg-primary-600" initial={{width:0}} animate={{width: phase >= 3 ? '100%' : '0%'}} />
                    </motion.div>
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1 px-1">
                    <span className={phase >= 0 ? "text-primary-600" : ""}>Code</span>
                    <span className={phase >= 1 ? "text-primary-600" : ""}>Structure</span>
                    <span className={phase >= 2 ? "text-primary-600" : ""}>Polish</span>
                </div>
            </div>
        </div>
    );
};

// --- 3. RESPONSIVE RESIZER: DEVICE LAB (LIGHT THEME) ---

export const ResponsiveResizer = () => {
    const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
    
    // Actual pixel width simulation for the inner container
    const containerWidths = {
        mobile: '320px',
        tablet: '580px',
        desktop: '100%'
    };

    return (
        <div className="w-full bg-white rounded-3xl border border-slate-200 overflow-hidden flex flex-col shadow-xl">
            
            {/* DevTools Header */}
            <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center shrink-0">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                </div>
                
                {/* Device Toggles */}
                <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                    <button 
                        onClick={() => setDevice('mobile')}
                        className={`p-1.5 rounded transition-all ${device === 'mobile' ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Smartphone size={16} />
                    </button>
                    <button 
                        onClick={() => setDevice('tablet')}
                        className={`p-1.5 rounded transition-all ${device === 'tablet' ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Tablet size={16} />
                    </button>
                    <button 
                        onClick={() => setDevice('desktop')}
                        className={`p-1.5 rounded transition-all ${device === 'desktop' ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Monitor size={16} />
                    </button>
                </div>

                <div className="text-[10px] font-mono text-slate-400 font-medium">
                    {device === 'mobile' ? '375px' : device === 'tablet' ? '768px' : '1280px'}
                </div>
            </div>

            {/* Viewport Area */}
            <div className="bg-slate-100 p-8 h-[400px] flex items-start justify-center overflow-hidden relative w-full transition-colors">
                
                <motion.div 
                    layout
                    initial={false}
                    animate={{ 
                        width: containerWidths[device],
                        height: device === 'mobile' ? '90%' : '100%' 
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="bg-white rounded-xl overflow-hidden shadow-2xl relative flex flex-col border border-slate-200"
                >
                    {/* Simulated App Header */}
                    <div className="h-12 border-b border-slate-100 flex items-center justify-between px-4 shrink-0 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                        <div className="w-6 h-6 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">P</div>
                        <div className="hidden sm:flex gap-2">
                            <div className="w-12 h-2 bg-slate-100 rounded-full"></div>
                            <div className="w-12 h-2 bg-slate-100 rounded-full"></div>
                        </div>
                        <div className="w-6 h-6 bg-slate-100 rounded-full"></div>
                    </div>

                    {/* Simulated Content */}
                    <div className="p-4 flex-1 overflow-y-auto custom-scrollbar bg-white">
                        {/* Hero Area */}
                        <div className={`mb-6 flex gap-4 ${device === 'mobile' ? 'flex-col' : 'items-center'}`}>
                            <div className="w-full h-32 bg-primary-50 rounded-xl border border-primary-100 flex items-center justify-center">
                                <ImageIcon size={32} className="text-primary-200" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="w-3/4 h-4 bg-slate-800 rounded"></div>
                                <div className="w-full h-2 bg-slate-200 rounded"></div>
                                <div className="w-2/3 h-2 bg-slate-200 rounded"></div>
                                <div className="w-24 h-8 bg-primary-600 rounded-lg mt-2"></div>
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className={`grid gap-3 transition-all ${
                            device === 'mobile' ? 'grid-cols-1' : 
                            device === 'tablet' ? 'grid-cols-2' : 'grid-cols-3'
                        }`}>
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-2 hover:shadow-md transition-shadow">
                                    <div className="w-full h-20 bg-slate-50 rounded-lg"></div>
                                    <div className="w-2/3 h-3 bg-slate-800 rounded"></div>
                                    <div className="w-1/2 h-2 bg-slate-300 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                </motion.div>

                {/* Dotted Background Pattern */}
                <div className="absolute inset-0 pointer-events-none opacity-40" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            </div>
        </div>
    );
};