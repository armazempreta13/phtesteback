
import React, { useEffect, useState, useRef } from 'react';
import { X, Minus, Square, HardDrive, Cpu, Radio, Disc, FileCode, Trash2, Music, AlertTriangle, Play, Pause, Volume2, LogOut, FileText, Settings, Minimize2, SkipForward, SkipBack } from 'lucide-react';
import { useMobile } from '../hooks/useMobile';
import { EasterEggMobile } from './EasterEggMobile';
import { VaporwaveStyles } from './VaporwaveStyles';
import { useContent } from '../contexts/ContentContext';

// --- ASSETS VAPORWAVE ---
const SOUNDS = {
  BOOT: 'https://ia800305.us.archive.org/27/items/Windows95StartupSound/Windows%2095%20Startup%20Sound.mp3',
  MUSIC: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Arps/Chad_Crouch_-_Algorithms.mp3',
  CLICK: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  OPEN: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  ERROR: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3'
};

// --- THEMES ---
const THEMES = {
  vapor: { bg: 'from-[#0f0c29] via-[#302b63] to-[#24243e]', sun: '#ff0080', grid: 'rgba(255, 0, 255, 0.4)' },
  matrix: { bg: 'from-[#000000] via-[#001100] to-[#002200]', sun: '#00ff00', grid: 'rgba(0, 255, 0, 0.4)' },
  sunset: { bg: 'from-[#2b1055] via-[#7597de] to-[#2b1055]', sun: '#fbbf24', grid: 'rgba(251, 191, 36, 0.4)' },
};

// --- DATA ---
const TRASH_ITEMS = [
    { name: 'jquery_v1.2.js', icon: <FileCode size={24} className="text-yellow-600" />, error: "Error: This technology is obsolete. Upgrade to React." },
    { name: 'ie6_fixes.css', icon: <FileCode size={24} className="text-blue-600" />, error: "System Alert: Nightmare mode disabled." },
    { name: 'flash_player.exe', icon: <Disc size={24} className="text-red-600" />, error: "Security Risk: Plugin not supported since 2020." },
    { name: 'layout_tables.html', icon: <FileCode size={24} className="text-gray-600" />, error: "Layout Error: Please use Flexbox or Grid." },
    { name: 'wordpress_backup.zip', icon: <HardDrive size={24} className="text-blue-400" />, error: "Warning: Heavy legacy code detected." }
];

const BIOS_LINES = [
  "A E S T H E T I C   B I O S   v 4 . 2 0",
  "Copyright (C) 1984-1999 Vapor Systems Inc.",
  "",
  "CPU Type  : QUANTUM 486 DX2-66",
  "Base Mem  : 640K",
  "Ext. Mem  : 16384K OK",
  "",
  "Detecting Primary Master ... MICHELANGELO 2.0GB",
  "Detecting Primary Slave  ... HELIOS STATUE 500MB",
  "",
  "Loading V A P O R W A V E . S Y S . . .",
  "Initializing Chill Vibes . . . [ OK ]",
  "Loading Roman Busts . . . . . . [ OK ]",
  "Injecting Nostalgia . . . . . . [ OK ]"
];

// --- SVG ASSETS ---
const PalmTreeSVG = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg viewBox="0 0 100 100" className={className} style={style} preserveAspectRatio="none">
    {/* Trunk */}
    <path d="M50 100 Q60 50 50 10" fill="none" stroke="black" strokeWidth="4" />
    <path d="M50 100 Q60 50 50 10" fill="none" stroke="#ff00ff" strokeWidth="1" strokeOpacity="0.5" />
    
    {/* Leaves */}
    <path d="M50 10 Q20 20 10 40" fill="none" stroke="black" strokeWidth="3" />
    <path d="M50 10 Q80 20 90 40" fill="none" stroke="black" strokeWidth="3" />
    <path d="M50 10 Q10 0 5 10" fill="none" stroke="black" strokeWidth="3" />
    <path d="M50 10 Q90 0 95 10" fill="none" stroke="black" strokeWidth="3" />
    <path d="M50 10 Q30 -10 20 -20" fill="none" stroke="black" strokeWidth="3" />
    <path d="M50 10 Q70 -10 80 -20" fill="none" stroke="black" strokeWidth="3" />
    <path d="M50 10 Q50 -20 50 -30" fill="none" stroke="black" strokeWidth="3" />

    {/* Leaves Neon Highlights */}
    <path d="M50 10 Q20 20 10 40" fill="none" stroke="#00ffff" strokeWidth="1" strokeOpacity="0.4" />
    <path d="M50 10 Q80 20 90 40" fill="none" stroke="#00ffff" strokeWidth="1" strokeOpacity="0.4" />
  </svg>
);

// --- DESKTOP COMPONENTS ---

interface WindowState {
  id: string;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  isMinimized: boolean;
  x: number;
  y: number;
  zIndex: number;
  content: React.ReactNode;
  width?: number;
  height?: number;
  isWidget?: boolean; // For Winamp
}

interface RetroWindowProps {
  windowState: WindowState;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onFocus: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
}

const RetroWindow: React.FC<RetroWindowProps> = ({ 
  windowState, 
  onClose, 
  onMinimize, 
  onFocus, 
  onMove
}) => {
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFocus(windowState.id);
    // Only drag if clicking header
    isDragging.current = true;
    dragOffset.current = {
      x: e.clientX - windowState.x,
      y: e.clientY - windowState.y
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    onMove(windowState.id, e.clientX - dragOffset.current.x, e.clientY - dragOffset.current.y);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  React.useEffect(() => {
     const moveHandler = (e: MouseEvent) => handleMouseMove(e);
     const upHandler = () => handleMouseUp();
     
     if (isDragging.current) {
        window.addEventListener('mousemove', moveHandler);
        window.addEventListener('mouseup', upHandler);
     }
     
     window.addEventListener('mousemove', moveHandler);
     window.addEventListener('mouseup', upHandler);

     return () => {
         window.removeEventListener('mousemove', moveHandler);
         window.removeEventListener('mouseup', upHandler);
     };
  }, []);

  if (!windowState.isOpen || windowState.isMinimized) return null;

  // Render Special Widget (Winamp) without standard chrome
  if (windowState.isWidget) {
      return (
          <div 
             className="absolute shadow-xl"
             style={{ 
               left: windowState.x, 
               top: windowState.y, 
               zIndex: 9999, // Always top
               width: windowState.width,
               cursor: 'move'
             }}
             onMouseDown={handleMouseDown}
          >
              {windowState.content}
          </div>
      )
  }

  return (
    <div 
      className="retro-window absolute bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-black flex flex-col"
      style={{ 
        left: windowState.x, 
        top: windowState.y, 
        zIndex: windowState.zIndex,
        width: windowState.width || 400,
        height: windowState.height || 'auto',
        maxWidth: '90vw',
        maxHeight: '80vh'
      }}
      onMouseDown={(e) => { e.stopPropagation(); onFocus(windowState.id); }}
    >
      {/* Title Bar */}
      <div 
        className={`px-1 py-0.5 flex justify-between items-center select-none cursor-move ${windowState.zIndex >= 50 ? 'bg-[#000080]' : 'bg-[#808080]'}`}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2 text-white font-bold text-xs font-mono tracking-wider overflow-hidden">
          {windowState.icon}
          <span className="truncate">{windowState.title}</span>
        </div>
        <div className="flex gap-1 shrink-0" onMouseDown={(e) => e.stopPropagation()}>
           <button 
             onClick={(e) => { e.stopPropagation(); onMinimize(windowState.id); }} 
             className="bg-[#c0c0c0] w-4 h-4 border-t border-l border-white border-b border-r border-black flex items-center justify-center active:border-t-black active:border-l-black active:border-b-white active:border-r-white hover:bg-gray-300"
           >
              <Minus size={10} strokeWidth={4} />
           </button>
           <button 
              className="bg-[#c0c0c0] w-4 h-4 border-t border-l border-white border-b border-r border-black flex items-center justify-center active:border-t-black active:border-l-black active:border-b-white active:border-r-white hover:bg-gray-300"
           >
              <Square size={8} strokeWidth={3} />
           </button>
           <button 
              onClick={(e) => { e.stopPropagation(); onClose(windowState.id); }} 
              className="bg-[#c0c0c0] w-4 h-4 border-t border-l border-white border-b border-r border-black flex items-center justify-center active:border-t-black active:border-l-black active:border-b-white active:border-r-white ml-0.5 hover:bg-red-200"
           >
              <X size={12} strokeWidth={3} />
           </button>
        </div>
      </div>
      {/* Body */}
      <div className="flex-1 p-1 overflow-auto bg-[#c0c0c0] relative cursor-default retro-scrollbar" onMouseDown={(e) => e.stopPropagation()}>
         {windowState.content}
      </div>
    </div>
  );
};

const DesktopIcon = ({ label, icon, onClick, isSelected, onSelect }: any) => (
  <div 
    onClick={(e) => { e.stopPropagation(); onSelect(); onClick(); }} 
    className="flex flex-col items-center gap-1 w-20 cursor-pointer group mb-6 z-10 relative select-none"
  >
    <div className={`w-10 h-10 flex items-center justify-center transition-transform drop-shadow-md ${isSelected ? 'opacity-80' : ''}`}>
        {icon}
    </div>
    <span className={`text-white font-mono text-[10px] px-1 text-center leading-tight break-words border border-dotted ${isSelected ? 'bg-[#000080] border-yellow-300' : 'bg-transparent border-transparent'}`}>
      {label}
    </span>
  </div>
);

// --- MAIN COMPONENT ---

export const EasterEgg = ({ externalTrigger, onClose }: any) => {
  const { content } = useContent();
  const config = content.easterEgg;
  const skills = content.skills; // Dynamic skills

  const isMobile = useMobile();
  const [stage, setStage] = useState<'idle' | 'bios' | 'desktop' | 'locked'>('idle');
  const [windows, setWindows] = useState<Record<string, WindowState>>({});
  const [topZ, setTopZ] = useState(10);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState<'vapor' | 'matrix' | 'sunset'>('vapor');
  
  // Start Menu State
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const startMenuRef = useRef<HTMLDivElement>(null);

  // Audio State
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  // Keyboard Sequence
  const [sequence, setSequence] = useState<string[]>([]);
  const [biosLine, setBiosLine] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // Generate stars once
  const [stars] = useState(() => Array.from({ length: 80 }).map(() => ({
    top: `${Math.random() * 60}%`,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 5}s`,
    size: Math.random() > 0.8 ? 3 : 2
  })));

  // Generate Particles once
  const [particles] = useState(() => Array.from({ length: 20 }).map(() => ({
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 10}s`,
    duration: `${10 + Math.random() * 10}s`
  })));

  // --- AUDIO & SFX ---
  const playSfx = (type: 'BOOT' | 'CLICK' | 'OPEN' | 'ERROR') => {
    try {
      const audio = new Audio(SOUNDS[type]);
      audio.volume = 0.4;
      audio.play().catch(() => {});
    } catch(e) {}
  };

  // Click outside listener
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (startMenuRef.current && !startMenuRef.current.contains(event.target as Node)) {
        setStartMenuOpen(false);
      }
      setSelectedIcon(null);
    };
    
    if (stage === 'desktop') document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [startMenuOpen, stage]);

  // Music Logic
  useEffect(() => {
    if (stage === 'desktop' && !musicRef.current && !isMobile) {
        musicRef.current = new Audio(SOUNDS.MUSIC);
        musicRef.current.loop = true;
        musicRef.current.volume = 0.4;
        
        const playMusic = async () => {
            try {
                if (musicRef.current) {
                   await musicRef.current.play();
                   setIsMusicPlaying(true);
                }
            } catch (err) {
                console.warn("Autoplay blocked");
                setIsMusicPlaying(false);
            }
        };
        playMusic();
    }
    return () => {
        if (musicRef.current && (stage === 'idle' || stage === 'locked')) {
            musicRef.current.pause();
            musicRef.current = null;
            setIsMusicPlaying(false);
        }
    }
  }, [stage, isMobile]);

  const toggleMusic = () => {
      if (!musicRef.current) return;
      if (isMusicPlaying) {
          musicRef.current.pause();
          setIsMusicPlaying(false);
      } else {
          musicRef.current.play();
          setIsMusicPlaying(true);
      }
  };

  // --- WINDOW MANAGEMENT ---
  const openWindow = (id: string, title: string, icon: React.ReactNode, content: React.ReactNode, width?: number, height?: number, isWidget = false) => {
    playSfx('OPEN');
    setWindows(prev => {
      if (prev[id]) {
        return {
          ...prev,
          [id]: { ...prev[id], isOpen: true, isMinimized: false, zIndex: topZ + 1 }
        };
      }
      const isWinamp = id === 'winamp_widget';
      const initialX = isWinamp ? window.innerWidth - 320 : Math.max(20, 50 + (Object.keys(prev).length * 30));
      const initialY = isWinamp ? 20 : Math.max(20, 50 + (Object.keys(prev).length * 30));

      return {
        ...prev,
        [id]: {
          id,
          title,
          icon,
          content,
          isOpen: true,
          isMinimized: false,
          x: initialX,
          y: initialY,
          zIndex: isWidget ? 9999 : topZ + 1,
          width,
          height,
          isWidget
        }
      };
    });
    setTopZ(prev => prev + 1);
  };

  const closeWindow = (id: string) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false }
    }));
  };

  const minimizeWindow = (id: string) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isMinimized: true }
    }));
  };

  const focusWindow = (id: string) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], zIndex: topZ + 1, isMinimized: false }
    }));
    setTopZ(prev => prev + 1);
  };

  const moveWindow = (id: string, x: number, y: number) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], x, y }
    }));
  };

  // --- TRIGGER LOGIC ---
  useEffect(() => {
    if (stage !== 'idle' || isLocked) return;
    const handler = (e: KeyboardEvent) => {
      setSequence(prev => {
        const newSeq = [...prev, e.key];
        if (newSeq.length > config.KONAMI_CODE.length) newSeq.shift();
        return newSeq;
      });
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [stage, isLocked, config.KONAMI_CODE]);

  useEffect(() => {
    if (sequence.join('') === config.KONAMI_CODE.join('')) startEasterEgg();
  }, [sequence, config.KONAMI_CODE]);

  useEffect(() => {
    if (externalTrigger && stage === 'idle') startEasterEgg();
  }, [externalTrigger, stage]);

  const startEasterEgg = () => {
    setSequence([]); 
    if (!config.ALLOW_RETRY && localStorage.getItem('ph_vapor_locked') === 'true') {
        setStage('locked');
        playSfx('ERROR');
        return;
    }
    
    if (isMobile) {
      setStage('desktop'); 
      return;
    }

    setStage('bios');
    playSfx('BOOT');
  };

  // --- BIOS LOGIC ---
  useEffect(() => {
    if (stage !== 'bios') return;
    if (biosLine < BIOS_LINES.length) {
      const timer = setTimeout(() => setBiosLine(prev => prev + 1), Math.random() * 200 + 50);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
          setStage('desktop');
          openWindow('winamp_widget', 'Winamp', <Music size={14}/>, <WinampWidget isPlaying={true} toggle={toggleMusic} onClose={() => closeWindow('winamp_widget')} />, 280, undefined, true);
          setIsMusicPlaying(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [stage, biosLine]);

  const handleExit = () => {
    if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current = null;
    }
    setStage('idle');
    setWindows({});
    setBiosLine(0);
    setStartMenuOpen(false);
    onClose();
  };

  const toggleStartMenu = (e: React.MouseEvent) => {
      e.stopPropagation();
      setStartMenuOpen(prev => !prev);
      playSfx('CLICK');
  };

  // --- RENDERERS ---

  if (stage === 'idle') return null;
  
  if (isMobile) {
     return <EasterEggMobile onClose={handleExit} />;
  }

  if (stage === 'locked') {
      return (
          <div className="fixed inset-0 z-[100] bg-[#0000AA] font-mono text-white p-10 flex flex-col items-center justify-center text-center cursor-none select-none">
              <div className="bg-white text-[#0000AA] font-bold px-2 mb-8 text-xl">WINDOWS</div>
              <h1 className="text-4xl mb-8 tracking-widest">FATAL EXCEPTION 0E</h1>
              <button onClick={() => { setStage('idle'); onClose(); }} className="border-2 border-white px-6 py-2 hover:bg-white hover:text-[#0000AA] transition-colors">
                  EXIT
              </button>
          </div>
      );
  }

  if (stage === 'bios') {
    return (
      <div className="fixed inset-0 z-[100] bg-black font-mono text-white p-8 overflow-hidden text-sm md:text-base leading-relaxed cursor-none">
        <div className="flex justify-between mb-8 border-b border-gray-700 pb-2">
            <span>Award Modular BIOS v4.51PG</span>
            <span className="text-yellow-400 animate-pulse">ENERGY STAR</span>
        </div>
        {BIOS_LINES.slice(0, biosLine + 1).map((line, i) => (
            <div key={i} className="mb-1 text-gray-300">
                {line.includes('420') || line.includes('VAPOR') 
                    ? <span className="text-pink-400 glitch-text font-bold">{line}</span> 
                    : line
                }
            </div>
        ))}
        <div className="absolute bottom-4 left-4 animate-pulse">_</div>
      </div>
    );
  }

  const themeVars = {
      '--sun-glow': THEMES[currentTheme].sun,
      '--grid-color': THEMES[currentTheme].grid,
  } as React.CSSProperties;

  // DESKTOP OS
  return (
    <>
    <VaporwaveStyles />
    <div className="fixed inset-0 z-[100] font-sans overflow-hidden cursor-[url('https://cur.cursors-4u.net/cursors/cur-2/cur126.cur'),_auto] crt-container" style={themeVars}>

      {/* VAPORWAVE BACKGROUND */}
      <div className={`absolute inset-0 bg-gradient-to-b ${THEMES[currentTheme].bg} z-0 overflow-hidden pointer-events-none transition-colors duration-1000`}>
        {stars.map((star, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              animation: `twinkle ${2 + Math.random() * 3}s infinite ease-in-out`,
              animationDelay: star.delay
            }}
          />
        ))}
        <div className="absolute top-[10%] left-0 w-full h-[20vh] opacity-50">
             <div className="retro-cloud" style={{ top: '10%', left: '-10%', width: '150px', animationDelay: '0s' }}></div>
             <div className="retro-cloud" style={{ top: '40%', left: '-20%', width: '250px', animationDelay: '5s' }}></div>
             <div className="retro-cloud" style={{ top: '70%', left: '-5%', width: '180px', animationDelay: '10s' }}></div>
        </div>
        <div 
          className="absolute bottom-[25vh] left-1/2 w-64 h-64 rounded-full bg-gradient-to-b from-[#ffed00] to-[#ff0080]"
          style={{
            animation: 'sun-pulse 4s infinite ease-in-out',
            maskImage: 'linear-gradient(to bottom, black 0%, black 40%, transparent 40%, transparent 45%, black 45%, black 50%, transparent 50%, transparent 55%, black 55%, black 60%, transparent 60%, transparent 65%, black 65%, black 70%, transparent 70%, transparent 75%, black 75%, black 80%, transparent 80%, transparent 85%, black 85%, black 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 40%, transparent 40%, transparent 45%, black 45%, black 50%, transparent 50%, transparent 55%, black 55%, black 60%, transparent 60%, transparent 65%, black 65%, black 70%, transparent 70%, transparent 75%, black 75%, black 80%, transparent 80%, transparent 85%, black 85%, black 100%)'
          }}
        />
        <div className="absolute bottom-[25vh] left-0 right-0 h-[10vh] flex items-end justify-center opacity-80 z-0">
             <div className="w-[10%] h-[40%] bg-black mx-1"></div>
             <div className="w-[5%] h-[70%] bg-black mx-1"></div>
             <div className="w-[8%] h-[50%] bg-black mx-1"></div>
             <div className="w-[12%] h-[30%] bg-black mx-1"></div>
             <div className="w-[6%] h-[80%] bg-black mx-1"></div>
             <div className="w-[15%] h-[20%] bg-black mx-1"></div>
             <div className="w-[100%] h-[10px] bg-black absolute bottom-0"></div>
        </div>
        
        <div className="absolute bottom-[25vh] left-0 w-full h-[20vh]" style={{ zIndex: -1 }}>
            <div className="absolute bottom-0 left-[10%] w-0 h-0 border-l-[100px] border-l-transparent border-b-[150px] border-b-[#1a0b2e] border-r-[100px] border-r-transparent opacity-80"></div>
            <div className="absolute bottom-0 right-[15%] w-0 h-0 border-l-[150px] border-l-transparent border-b-[200px] border-b-[#1a0b2e] border-r-[150px] border-r-transparent opacity-80"></div>
        </div>

        <div className="pyramid" style={{ top: '20%', left: '15%', opacity: 0.6 }}></div>
        <div className="pyramid" style={{ top: '40%', right: '15%', opacity: 0.4, animationDelay: '-2s', transform: 'scale(0.7)' }}></div>
        <div className="floating-cube" style={{ top: '15%', right: '25%' }}></div>

        <div className="absolute bottom-0 w-[200vw] -left-[50vw] h-[40vh] vapor-grid" 
             style={{ 
               boxShadow: `0 -20px 50px ${THEMES[currentTheme].grid}`,
               maskImage: 'linear-gradient(to top, black 60%, transparent 100%)',
               WebkitMaskImage: 'linear-gradient(to top, black 60%, transparent 100%)'
             }}
        ></div>
        
        {particles.map((p, i) => (
           <div 
             key={i} 
             className="cyber-particle" 
             style={{ left: p.left, animationDelay: p.delay, animationDuration: p.duration }} 
           />
        ))}

        <div className="absolute bottom-0 left-[-5%] w-[400px] h-[500px] z-10 pointer-events-none opacity-90" style={{ transform: 'scaleX(-1)' }}>
             <PalmTreeSVG className="w-full h-full drop-shadow-[0_0_10px_rgba(255,0,255,0.5)]" />
        </div>
        <div className="absolute bottom-0 right-[-5%] w-[450px] h-[550px] z-10 pointer-events-none opacity-90">
             <PalmTreeSVG className="w-full h-full drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]" />
        </div>

        <div className="absolute inset-0 scanlines opacity-30 pointer-events-none z-[1000]"></div>
      </div>

      {/* DESKTOP AREA */}
      <div className="absolute inset-0 z-10 p-4 pb-12">
          
          <div className="flex flex-col gap-4 items-start">
              <DesktopIcon 
                label="My Skills" 
                icon={<Cpu size={32} className="text-[#c0c0c0]" />} 
                onClick={() => openWindow('skills', 'System Properties', <Cpu size={14}/>, <SkillsContent skills={skills} />, 450, 400)} 
                isSelected={selectedIcon === 'skills'}
                onSelect={() => setSelectedIcon('skills')}
              />
              <DesktopIcon 
                label="Recycle Bin" 
                icon={<Trash2 size={32} className="text-[#c0c0c0]" />} 
                onClick={() => openWindow('trash', 'Recycle Bin', <Trash2 size={14}/>, <TrashContent />, 500, 350)} 
                isSelected={selectedIcon === 'trash'}
                onSelect={() => setSelectedIcon('trash')}
              />
              <DesktopIcon 
                label="Notepad" 
                icon={<FileText size={32} className="text-[#40a0ff]" />} 
                onClick={() => openWindow('notepad', 'Untitled - Notepad', <FileText size={14}/>, <NotepadContent />, 400, 300)} 
                isSelected={selectedIcon === 'notepad'}
                onSelect={() => setSelectedIcon('notepad')}
              />
              <DesktopIcon 
                label="Display" 
                icon={<Settings size={32} className="text-gray-400" />} 
                onClick={() => openWindow('display', 'Display Properties', <Settings size={14}/>, <DisplayContent setTheme={setCurrentTheme} current={currentTheme} />, 350, 250)} 
                isSelected={selectedIcon === 'display'}
                onSelect={() => setSelectedIcon('display')}
              />
              <DesktopIcon 
                label="HACK.EXE" 
                icon={<Disc size={32} className="text-pink-400" />} 
                onClick={() => openWindow('hacking', 'C:\\SYSTEM\\HACK.EXE', <Radio size={14}/>, <HackingContent token={config.SECRET_TOKEN} />, 500)} 
                isSelected={selectedIcon === 'hack'}
                onSelect={() => setSelectedIcon('hack')}
              />
          </div>

          {(Object.values(windows) as WindowState[]).map(win => (
            <RetroWindow 
              key={win.id} 
              windowState={win} 
              onClose={closeWindow} 
              onMinimize={minimizeWindow}
              onFocus={focusWindow}
              onMove={moveWindow}
            />
          ))}

      </div>

      {/* START MENU POPUP */}
      {startMenuOpen && (
          <div ref={startMenuRef} className="absolute bottom-10 left-0 bg-[#c0c0c0] win95-border flex flex-row shadow-xl z-[9999]" onMouseDown={(e) => e.stopPropagation()}>
             <div className="w-8 bg-[#000080] flex items-end justify-center pb-2 relative overflow-hidden">
                 <span className="text-white font-bold text-xl transform -rotate-90 whitespace-nowrap tracking-widest origin-bottom translate-y-[-10px] drop-shadow-md">PH OS <span className="text-xs opacity-70">95</span></span>
             </div>
             <div className="p-1 flex flex-col w-48">
                 <div onClick={() => { openWindow('skills', 'System Properties', <Cpu size={14}/>, <SkillsContent skills={skills} />, 450, 400); setStartMenuOpen(false); }} className="flex items-center gap-3 px-2 py-2 hover:bg-[#000080] hover:text-white cursor-pointer group">
                     <Cpu size={24} className="text-gray-600 group-hover:text-white" />
                     <span className="text-sm">Programs</span>
                 </div>
                 <div onClick={() => { openWindow('trash', 'Recycle Bin', <Trash2 size={14}/>, <TrashContent />, 500, 350); setStartMenuOpen(false); }} className="flex items-center gap-3 px-2 py-2 hover:bg-[#000080] hover:text-white cursor-pointer group">
                     <Trash2 size={24} className="text-gray-600 group-hover:text-white" />
                     <span className="text-sm">Documents</span>
                 </div>
                 <div onClick={() => { openWindow('display', 'Display', <Settings size={14}/>, <DisplayContent setTheme={setCurrentTheme} current={currentTheme} />, 350, 250); setStartMenuOpen(false); }} className="flex items-center gap-3 px-2 py-2 hover:bg-[#000080] hover:text-white cursor-pointer group">
                     <Settings size={24} className="text-gray-600 group-hover:text-white" />
                     <span className="text-sm">Settings</span>
                 </div>
                 <div className="h-px bg-gray-500 my-1 shadow-[0_1px_0_white]"></div>
                 <div onClick={handleExit} className="flex items-center gap-3 px-2 py-2 hover:bg-[#000080] hover:text-white cursor-pointer group">
                     <LogOut size={24} className="text-gray-600 group-hover:text-white" />
                     <span className="text-sm">Shut Down...</span>
                 </div>
             </div>
          </div>
      )}

      {/* TASKBAR */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-[#c0c0c0] border-t-2 border-white flex items-center px-1 py-1 z-[200]">
          <button 
            onClick={toggleStartMenu}
            className={`flex items-center gap-1 px-2 py-0.5 border-2 mr-2 transition-all active:scale-95 ${startMenuOpen ? 'win95-border-inverted bg-gray-300' : 'win95-border bg-[#c0c0c0]'}`}
          >
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Windows_logo_and_wordmark_-_1995-2001.svg/512px-Windows_logo_and_wordmark_-_1995-2001.svg.png" className="w-5 h-5 object-contain mr-1" alt="win" />
              <span className="font-bold font-sans text-sm italic text-black">Start</span>
          </button>
          
          <div className="flex-1 flex gap-1 px-2 border-l border-gray-500 ml-1 overflow-hidden">
             {(Object.values(windows) as WindowState[]).filter(w => w.isOpen && !w.isWidget).map(win => (
                 <button
                    key={win.id}
                    onClick={() => win.isMinimized ? focusWindow(win.id) : minimizeWindow(win.id)}
                    className={`px-3 py-1 border-2 font-bold text-xs font-sans flex items-center gap-2 text-black w-32 truncate transition-colors
                      ${!win.isMinimized && win.zIndex === topZ 
                        ? 'bg-[#e0e0e0] win95-border-inverted font-bold' // Pressed
                        : 'bg-[#c0c0c0] win95-border' // Raised
                      }
                    `}
                 >
                    <span className="shrink-0">{win.icon}</span>
                    <span className="truncate">{win.title}</span>
                 </button>
             ))}
          </div>

          <div className="win95-border-inverted px-3 py-1 bg-[#c0c0c0] text-xs font-mono flex items-center gap-2 text-black ml-auto">
             <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse border border-black" title="System Busy"></div>
             {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
      </div>
    </div>
    </>
  );
};

// --- WINDOW CONTENTS ---

const WinampWidget = ({ isPlaying, toggle, onClose }: { isPlaying: boolean, toggle: () => void, onClose: () => void }) => {
    const [timer, setTimer] = useState(0);
    const [bars, setBars] = useState<number[]>(new Array(16).fill(5));

    useEffect(() => {
        if (!isPlaying) return;
        const interval = setInterval(() => {
            setTimer(t => t + 1);
            setBars(prev => prev.map(() => Math.floor(Math.random() * 95) + 5));
        }, 100);
        return () => clearInterval(interval);
    }, [isPlaying]);

    const formatTime = (s: number) => {
        const min = Math.floor(s / 600);
        const sec = Math.floor((s % 600) / 10);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    return (
        <div className="w-[275px] h-[116px] bg-[#202020] border-2 border-gray-500 flex flex-col font-sans select-none relative shadow-xl">
             <div className="h-[14px] bg-[#000080] flex justify-between items-center px-1 cursor-move" onMouseDown={(e) => e.preventDefault()}>
                 <span className="text-[8px] text-white">WINAMP</span>
                 <div className="flex gap-1">
                     <div onClick={(e) => { e.stopPropagation(); toggle(); }} className="w-2 h-2 bg-gray-300 border border-black cursor-pointer"></div>
                     <div onClick={(e) => { e.stopPropagation(); onClose(); }} className="w-2 h-2 bg-red-500 border border-black cursor-pointer"></div>
                 </div>
             </div>
             <div className="flex-1 p-2 relative">
                 <div className="absolute top-2 left-2 w-[80px] h-[40px] bg-black border border-gray-600 flex items-end gap-[1px] px-1 pb-1">
                      {bars.map((h, i) => <div key={i} className="flex-1 bg-green-500" style={{height: `${h}%`}}></div>)}
                 </div>
                 <div className="absolute top-2 left-[90px] w-[170px] h-[20px] bg-black border border-gray-600 flex items-center px-1 overflow-hidden">
                      <span className="text-green-400 font-mono text-[10px] whitespace-nowrap animate-marquee">
                          01. VAPOR_CHILL_BEATS.MP3 (128kbps) *** PH.DEV MIX ***
                      </span>
                 </div>
                 <div className="absolute top-[28px] left-[90px] text-green-400 font-mono text-xl tracking-widest">
                      {formatTime(timer)}
                 </div>
                 <div className="absolute bottom-2 left-2 flex gap-1">
                     <button className="w-6 h-6 bg-gray-300 win95-btn flex items-center justify-center" onClick={(e) => e.stopPropagation()}><SkipBack size={10} /></button>
                     <button className="w-6 h-6 bg-gray-300 win95-btn flex items-center justify-center" onClick={(e) => { e.stopPropagation(); toggle(); }}>{isPlaying ? <Pause size={10} /> : <Play size={10} />}</button>
                     <button className="w-6 h-6 bg-gray-300 win95-btn flex items-center justify-center" onClick={(e) => e.stopPropagation()}><SkipForward size={10} /></button>
                 </div>
             </div>
             <style>{`
               @keyframes marquee {
                 0% { transform: translateX(100%); }
                 100% { transform: translateX(-100%); }
               }
               .animate-marquee {
                 animation: marquee 10s linear infinite;
               }
             `}</style>
        </div>
    )
}

const NotepadContent = () => {
    return (
        <textarea 
            className="w-full h-full bg-white font-mono text-sm p-2 resize-none outline-none"
            defaultValue="TODO:&#10;- Learn React&#10;- Master TypeScript&#10;- Build awesome sites&#10;- Find the easter egg..."
        />
    )
}

const DisplayContent = ({ setTheme, current }: { setTheme: any, current: string }) => (
    <div className="bg-[#c0c0c0] h-full p-4 flex flex-col gap-4 font-sans text-xs">
        <fieldset className="border border-white p-2">
            <legend className="ml-2 px-1">Desktop Theme</legend>
            <div className="flex flex-col gap-2 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="theme" checked={current === 'vapor'} onChange={() => setTheme('vapor')} /> Vaporwave (Default)
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="theme" checked={current === 'matrix'} onChange={() => setTheme('matrix')} /> The Matrix
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="theme" checked={current === 'sunset'} onChange={() => setTheme('sunset')} /> Sunset Blvd
                </label>
            </div>
        </fieldset>
        <div className="flex justify-end gap-2 mt-auto">
             <button className="px-4 py-1 win95-btn">Apply</button>
             <button className="px-4 py-1 win95-btn">OK</button>
        </div>
    </div>
);

const SkillsContent = ({ skills }: { skills: any[] }) => (
    <div className="bg-white h-full flex flex-col text-black font-sans text-xs">
      <div className="flex p-4 gap-4 border-b border-gray-300">
           <div className="w-16 h-16 bg-gray-200 border border-gray-400 flex items-center justify-center shrink-0"><Cpu size={40} className="text-blue-800" /></div>
           <div>
               <h3 className="font-bold text-sm">PH Development Workstation</h3>
               <p className="mt-2">Processor: <span className="text-blue-600 font-bold">Neural Net DX4-100</span></p>
               <p>Memory: <span className="text-blue-600 font-bold">Infinite Context</span></p>
           </div>
      </div>
      <div className="p-4 bg-gray-100 flex-1">
          <p className="font-bold mb-2 border-b border-gray-300">Installed Drivers:</p>
          <div className="bg-white border border-black p-2 h-40 overflow-y-auto font-mono retro-scrollbar">
              {skills.map(skill => <div key={skill.name} className="flex items-center gap-2 mb-1"><span className="text-green-600">[OK]</span><span>LOADED: {skill.name.toUpperCase()}.SYS</span></div>)}
          </div>
      </div>
    </div>
);

const TrashContent = () => {
    const [err, setErr] = useState<string | null>(null);
    return (
      <div className="bg-white h-full p-2 flex flex-col text-black font-sans text-xs relative">
           <div className="flex-1 p-2 grid grid-cols-4 gap-4 content-start">
               {TRASH_ITEMS.map((item, idx) => (
                   <div key={idx} className="flex flex-col items-center gap-1 group cursor-pointer" onClick={() => setErr(item.error)}>
                       <div className="w-8 h-8 flex items-center justify-center group-hover:opacity-70">{item.icon}</div>
                       <span className="text-[10px] text-center leading-tight group-hover:bg-blue-600 group-hover:text-white px-1">{item.name}</span>
                   </div>
               ))}
           </div>
           {err && (
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#c0c0c0] win95-btn p-3 z-50 w-64 text-center border border-white">
                   <div className="flex items-center gap-2 text-red-600 mb-2 justify-center"><AlertTriangle size={20}/> <strong>Error</strong></div>
                   <p className="mb-4">{err}</p>
                   <button onClick={() => setErr(null)} className="win95-btn px-4 py-1">OK</button>
               </div>
           )}
      </div>
    );
};

const HackingContent = ({ token }: { token: string }) => {
    const [progress, setProgress] = useState(0);
    const [revealedToken, setRevealedToken] = useState<string | null>(null);

    useEffect(() => {
        if(revealedToken) return;
        const interval = setInterval(() => {
            setProgress(p => {
                if (p >= 100) { clearInterval(interval); setRevealedToken(token); return 100; }
                return p + 2;
            });
        }, 80);
        return () => clearInterval(interval);
    }, [revealedToken, token]);

    return (
        <div className="bg-black text-[#00ff00] p-4 font-mono text-sm h-full overflow-y-auto retro-scrollbar">
            {!revealedToken ? (
                <>
                    <div className="mb-2">Initializing HACK.EXE...</div>
                    <div className="mb-2 text-xs text-gray-500">Target: Mainframe // Port: 8080</div>
                    <div className="mt-2 w-full border border-green-500 p-0.5"><div className="h-4 bg-green-500" style={{width: `${progress}%`}}></div></div>
                    <div className="mt-2 text-xs">{progress}% DECIPHERED</div>
                    {progress > 50 && <div className="mt-2 text-red-500 animate-pulse">WARNING: FIREWALL DETECTED</div>}
                    {progress > 80 && <div className="mt-1 text-blue-400">Bypassing security protocols...</div>}
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full animate-pulse">
                    <div className="text-xl mb-4 text-center">ACCESS GRANTED</div>
                    <div className="border-2 border-green-500 p-4 font-bold text-xl mb-4">{revealedToken}</div>
                    <button className="border border-green-500 px-4 py-2 hover:bg-green-500 hover:text-black transition-colors" onClick={() => window.open(`https://wa.me/?text=${revealedToken}`, '_blank')}>CLAIM REWARD</button>
                </div>
            )}
        </div>
    );
};
