import React, { useState, useEffect, useRef } from 'react';
import { Battery, Wifi, Signal, Play, Square, Circle, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Music, X, Zap } from 'lucide-react';
import { EASTER_EGG_CONFIG, SKILLS } from '../config';

// --- ASSETS 8-BIT ---
const SOUNDS = {
  STARTUP: 'https://ia801602.us.archive.org/11/items/GameboyStartupSound/GameboyStartupSound.mp3',
  BLIP: 'https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3',
  MUSIC: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Rolemusic/gigs_n_contest/Rolemusic_-_02_-_May.mp3'
};

type ScreenState = 'off' | 'boot' | 'home' | 'app_skills' | 'app_music' | 'app_token';

export const EasterEggMobile = ({ onClose }: { onClose: () => void }) => {
  const [screenState, setScreenState] = useState<ScreenState>('off');
  const [selectedAppIndex, setSelectedAppIndex] = useState(0);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [batteryLow, setBatteryLow] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Apps Grid
  const APPS = [
    { id: 'app_skills', label: 'SKILLS', icon: '⚡' },
    { id: 'app_music', label: 'TUNES', icon: '🎵' },
    { id: 'app_token', label: 'REWARD', icon: '💎' },
    { id: 'exit', label: 'EXIT', icon: '❌' }
  ];

  // Startup Sequence
  useEffect(() => {
    const boot = async () => {
      setScreenState('boot');
      // Play startup sound
      const audio = new Audio(SOUNDS.STARTUP);
      audio.volume = 0.5;
      audio.play().catch(() => {});
      
      // Fake battery blinking
      const blink = setInterval(() => setBatteryLow(p => !p), 2000);

      setTimeout(() => {
        setScreenState('home');
      }, 2500);

      return () => clearInterval(blink);
    };
    boot();

    return () => {
       if (audioRef.current) {
         audioRef.current.pause();
         audioRef.current = null;
       }
    };
  }, []);

  const playBlip = () => {
    const audio = new Audio(SOUNDS.BLIP);
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  const handleDPad = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (screenState !== 'home') return;
    playBlip();
    if (direction === 'left' || direction === 'up') {
      setSelectedAppIndex(prev => (prev === 0 ? APPS.length - 1 : prev - 1));
    } else {
      setSelectedAppIndex(prev => (prev === APPS.length - 1 ? 0 : prev + 1));
    }
  };

  const handleAButton = () => {
    playBlip();
    if (screenState === 'home') {
       const app = APPS[selectedAppIndex];
       if (app.id === 'exit') {
         onClose();
       } else {
         setScreenState(app.id as ScreenState);
       }
    } else if (screenState === 'app_music') {
       toggleMusic();
    } else if (screenState === 'app_token') {
       // Generate token action
       window.open(`https://wa.me/${EASTER_EGG_CONFIG.KONAMI_CODE}?text=GAMEBOY_TOKEN_UNLOCKED`, '_blank');
    }
  };

  const handleBButton = () => {
    playBlip();
    if (screenState !== 'home' && screenState !== 'boot') {
      setScreenState('home');
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current) {
        audioRef.current = new Audio(SOUNDS.MUSIC);
        audioRef.current.loop = true;
    }
    
    if (musicPlaying) {
        audioRef.current.pause();
        setMusicPlaying(false);
    } else {
        audioRef.current.play().catch(() => {});
        setMusicPlaying(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-md select-none">
      
      {/* GAMEBOY CHASSIS - 3D Effect */}
      <div 
        className="relative bg-[#6b21a8] w-full max-w-[340px] h-[600px] rounded-t-xl rounded-b-[40px] flex flex-col items-center p-6 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_-5px_-5px_10px_rgba(0,0,0,0.2),inset_5px_5px_10px_rgba(255,255,255,0.1)] border border-[#581c87]"
      >
        
        {/* TOP DECORATION */}
        <div className="w-full flex justify-between items-start mb-4 px-2 border-b border-[#581c87]/50 pb-2">
            <div className="w-[80%] h-2 bg-[#4c1d95] rounded-full shadow-inner"></div>
            <div className="text-[10px] font-bold text-[#d8b4fe] italic opacity-80 pl-2">PH COLOR</div>
        </div>

        {/* SCREEN BEZEL */}
        <div className="bg-[#1f2937] w-full aspect-[10/9] rounded-t-lg rounded-b-[30px] p-8 relative shadow-[0_5px_10px_rgba(0,0,0,0.3)]">
            {/* Battery LED */}
            <div className="absolute top-10 left-3 flex flex-col items-center gap-1">
                 <div className={`w-2 h-2 rounded-full ${batteryLow ? 'bg-red-500 animate-pulse' : 'bg-red-800'} shadow-[0_0_5px_rgba(239,68,68,0.5)]`}></div>
                 <span className="text-[6px] text-gray-400 font-bold uppercase tracking-wider">Battery</span>
            </div>
            
            {/* LCD SCREEN */}
            <div className="bg-[#9bbc0f] w-full h-full border-4 border-[#8bac0f] shadow-[inset_0_0_20px_rgba(0,0,0,0.4)] relative overflow-hidden font-mono text-[#0f380f] flex flex-col">
                
                {/* PIXEL GRID OVERLAY */}
                <div 
                    className="absolute inset-0 pointer-events-none opacity-20 z-20 mix-blend-multiply"
                    style={{ backgroundImage: 'radial-gradient(#0f380f 20%, transparent 20%)', backgroundSize: '3px 3px' }}
                ></div>

                {/* --- SCREEN CONTENT --- */}
                <div className="relative z-10 w-full h-full flex flex-col p-1">
                    
                    {/* STATUS BAR */}
                    {screenState !== 'off' && screenState !== 'boot' && (
                        <div className="flex justify-between items-center px-1 border-b-2 border-[#0f380f] text-[10px] font-bold pb-0.5 mb-1">
                             <div className="flex gap-1 items-center">
                                 <Signal size={10} />
                                 <span>PH-OS</span>
                             </div>
                             <Battery size={10} />
                        </div>
                    )}

                    {/* BOOT SCREEN */}
                    {screenState === 'boot' && (
                        <div className="flex-1 flex flex-col items-center justify-center animate-pulse">
                            <span className="text-xl font-black tracking-widest mb-2">PH.DEV</span>
                            <span className="text-[8px] uppercase tracking-wide">Nintendo © 1999</span>
                            <div className="mt-8 w-24 h-4 border-2 border-[#0f380f] p-0.5">
                                <div className="h-full bg-[#0f380f] w-[60%] animate-[pulse_0.5s_infinite]"></div>
                            </div>
                        </div>
                    )}

                    {/* HOME SCREEN */}
                    {screenState === 'home' && (
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <h2 className="text-[10px] mb-4 font-bold uppercase tracking-widest border-b border-[#0f380f] px-2">MAIN MENU</h2>
                            
                            <div className="grid grid-cols-2 gap-2 w-full px-2">
                                {APPS.map((app, idx) => (
                                    <div key={app.id} className={`flex flex-col items-center p-1 border-2 transition-all ${selectedAppIndex === idx ? 'border-[#0f380f] bg-[#0f380f] text-[#9bbc0f]' : 'border-transparent'}`}>
                                        <span className="text-xl">{app.icon}</span>
                                        <span className="text-[8px] font-bold mt-1">{app.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* APP: SKILLS */}
                    {screenState === 'app_skills' && (
                        <div className="flex-1 overflow-hidden flex flex-col">
                            <div className="text-[10px] font-bold border-b border-[#0f380f] mb-1">SKILLS_V1.0.EXE</div>
                            <div className="space-y-1 overflow-y-auto custom-scrollbar flex-1">
                                {SKILLS.map((skill, i) => (
                                    <div key={i} className="flex justify-between text-[8px] border-b border-dotted border-[#0f380f]/50 py-0.5">
                                        <span>{skill.name.toUpperCase()}</span>
                                        <span>[OK]</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* APP: MUSIC */}
                    {screenState === 'app_music' && (
                        <div className="flex-1 flex flex-col items-center justify-center p-2 text-center">
                             <div className="w-12 h-12 border-2 border-[#0f380f] flex items-center justify-center mb-2 animate-bounce">
                                 <Music size={24} />
                             </div>
                             <div className="text-[10px] font-bold mb-1">8-BIT ANTHEM</div>
                             <div className="text-[8px] mb-2">{musicPlaying ? "PLAYING >>" : "PAUSED ||"}</div>
                        </div>
                    )}

                    {/* APP: REWARD */}
                    {screenState === 'app_token' && (
                         <div className="flex-1 flex flex-col items-center justify-center p-2 text-center">
                             <div className="text-xl mb-2">💎</div>
                             <div className="text-[10px] font-bold mb-1">SECRET FOUND!</div>
                             <div className="border-2 border-[#0f380f] bg-[#0f380f] text-[#9bbc0f] p-1 w-full text-[8px] mb-2 font-mono break-all">
                                 {EASTER_EGG_CONFIG.SECRET_TOKEN}
                             </div>
                             <div className="text-[8px] animate-pulse">PRESS 'A' TO CLAIM</div>
                         </div>
                    )}

                </div>
            </div>
            
            <div className="text-center mt-2">
                <span className="text-[10px] text-gray-500 font-bold italic tracking-[0.2em] font-serif">Nintendo</span>
            </div>
        </div>

        {/* CONTROLS AREA */}
        <div className="flex-1 w-full relative mt-8">
            
            {/* D-PAD (Realistic CSS Shapes) */}
            <div className="absolute left-2 top-0 w-24 h-24">
                <div className="relative w-full h-full">
                    {/* Horizontal Bar */}
                    <div className="absolute top-[35%] left-0 w-full h-[30%] bg-gray-800 rounded-sm shadow-[0_4px_0_#1f2937] z-10"></div>
                    {/* Vertical Bar */}
                    <div className="absolute left-[35%] top-0 w-[30%] h-full bg-gray-800 rounded-sm shadow-[0_4px_0_#1f2937] z-10"></div>
                    {/* Center Divot */}
                    <div className="absolute left-[40%] top-[40%] w-[20%] h-[20%] bg-gray-700 rounded-full z-20 opacity-50"></div>
                    
                    {/* Click Zones */}
                    <button className="absolute top-0 left-[35%] w-[30%] h-[35%] z-30 active:bg-white/10" onClick={() => handleDPad('up')}></button>
                    <button className="absolute bottom-0 left-[35%] w-[30%] h-[35%] z-30 active:bg-white/10" onClick={() => handleDPad('down')}></button>
                    <button className="absolute top-[35%] left-0 w-[35%] h-[30%] z-30 active:bg-white/10" onClick={() => handleDPad('left')}></button>
                    <button className="absolute top-[35%] right-0 w-[35%] h-[30%] z-30 active:bg-white/10" onClick={() => handleDPad('right')}></button>
                </div>
            </div>

            {/* A/B BUTTONS (3D CSS) */}
            <div className="absolute right-2 top-4 flex gap-4 transform -rotate-12">
                <div className="flex flex-col items-center gap-1 mt-4">
                     <button 
                        className="w-10 h-10 rounded-full bg-red-600 shadow-[0_4px_0_#991b1b,inset_0_2px_4px_rgba(255,255,255,0.3)] active:shadow-none active:translate-y-1 transition-all border border-red-800"
                        onClick={handleBButton}
                     ></button>
                     <span className="text-purple-200 font-bold text-xs tracking-wider">B</span>
                </div>
                <div className="flex flex-col items-center gap-1 mb-4">
                     <button 
                        className="w-10 h-10 rounded-full bg-red-600 shadow-[0_4px_0_#991b1b,inset_0_2px_4px_rgba(255,255,255,0.3)] active:shadow-none active:translate-y-1 transition-all border border-red-800"
                        onClick={handleAButton}
                     ></button>
                     <span className="text-purple-200 font-bold text-xs tracking-wider">A</span>
                </div>
            </div>

            {/* SELECT / START (Pill Shapes) */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-3">
                <div className="flex flex-col items-center">
                    <button 
                        onClick={() => setScreenState(screenState === 'home' ? 'off' : 'home')}
                        className="w-12 h-3 bg-gray-800 rounded-full transform rotate-12 shadow-[0_2px_0_#1f2937] border border-gray-900 active:shadow-none active:translate-y-[1px]"
                    ></button>
                    <span className="text-[8px] text-purple-300 font-bold mt-1 tracking-wider uppercase">Select</span>
                </div>
                <div className="flex flex-col items-center">
                    <button 
                        onClick={() => handleAButton()}
                        className="w-12 h-3 bg-gray-800 rounded-full transform rotate-12 shadow-[0_2px_0_#1f2937] border border-gray-900 active:shadow-none active:translate-y-[1px]"
                    ></button>
                    <span className="text-[8px] text-purple-300 font-bold mt-1 tracking-wider uppercase">Start</span>
                </div>
            </div>

        </div>

      </div>
    </div>
  );
};