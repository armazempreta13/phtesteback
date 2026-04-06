
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Square, Settings, ChevronDown, Mic2, Gauge, Volume2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AudioPlayerProps {
  text: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ text }) => {
  // States
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [totalTime, setTotalTime] = useState('00:00');
  const [isSupported, setIsSupported] = useState(false);
  
  // Settings
  const [showSettings, setShowSettings] = useState(false);
  const [rate, setRate] = useState(1);
  const rateRef = useRef(1); // Ref for synchronous access

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const voiceRef = useRef<string>(''); // Ref for synchronous access

  // Refs para controle interno sem re-renders
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const textRef = useRef(text);
  const charIndexRef = useRef(0); // Rastreia onde parou
  const isManuallyStopped = useRef(false);

  // --- INIT & VOICES ---
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setIsSupported(true);
      
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        const ptVoices = availableVoices.filter(v => v.lang.includes('pt') || v.lang.includes('PT'));
        // Fallback para todas se não achar PT
        const finalVoices = ptVoices.length > 0 ? ptVoices : availableVoices;
        setVoices(finalVoices);
        
        // Recuperar voz salva ou default
        const savedVoice = localStorage.getItem('ph_audio_voice');
        const voiceExists = finalVoices.find(v => v.voiceURI === savedVoice);
        
        let initialVoiceURI = '';
        if (savedVoice && voiceExists) {
            initialVoiceURI = savedVoice;
        } else {
            // Prioridade: Google BR -> Microsoft BR -> Luciana -> Primeira da lista
            const bestVoice = finalVoices.find(v => v.name.includes('Google') && v.lang.includes('BR')) 
                           || finalVoices.find(v => v.name.includes('Microsoft') && v.lang.includes('BR'))
                           || finalVoices.find(v => v.name.includes('Luciana'))
                           || finalVoices[0];
            if (bestVoice) initialVoiceURI = bestVoice.voiceURI;
        }
        
        setSelectedVoiceURI(initialVoiceURI);
        voiceRef.current = initialVoiceURI;
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;

      // Estimativa inicial de tempo
      const wordCount = text.split(/\s+/).length;
      const totalSeconds = Math.ceil((wordCount / 160) * 60); // ~160 palavras/min média
      setTotalTime(formatTime(totalSeconds));
    }

    // Cleanup crítico: Parar áudio ao desmontar componente (sair da página)
    return () => {
      cancelAudio();
    };
  }, [text]);

  // --- PAGE VISIBILITY & TAB SWITCHING ---
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Se o usuário mudou de aba ou minimizou, PAUSAMOS ou PARAMOS.
        // Parar é mais seguro para evitar bugs de fila do navegador.
        if (isPlaying) {
            handlePause();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const cancelAudio = () => {
    isManuallyStopped.current = true; // Prevent onend logic from messing up state
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    setCurrentTime('00:00');
    charIndexRef.current = 0;
  };

  // --- PLAYBACK LOGIC ---

  const handlePlay = useCallback((startIndex = 0) => {
    if (!isSupported) return;
    
    // Cancelar qualquer fala anterior para evitar sobreposição
    window.speechSynthesis.cancel();
    isManuallyStopped.current = false;

    // Se houver um startIndex (retomada), cortamos o texto
    // Nota: SpeechSynthesis não suporta "seek" nativo real, então falamos o texto restante.
    const textToSpeak = startIndex > 0 ? textRef.current.substring(startIndex) : textRef.current;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = rateRef.current; // Read from ref
    utterance.pitch = 1;
    
    const voice = voices.find(v => v.voiceURI === voiceRef.current); // Read from ref
    if (voice) utterance.voice = voice;

    // Eventos
    utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
    };

    utterance.onend = () => {
        if (!isManuallyStopped.current) {
            setIsPlaying(false);
            setIsPaused(false);
            setProgress(100);
            charIndexRef.current = 0;
        }
    };

    utterance.onerror = (e) => {
        // console.error("Speech Error", e);
        setIsPlaying(false);
    };

    // Rastreamento de progresso usando 'boundary' (cada palavra/frase)
    utterance.onboundary = (event) => {
        // O charIndex do evento é relativo ao textToSpeak (que pode ser cortado)
        // Precisamos somar o startIndex para ter o índice absoluto
        const absoluteCharIndex = startIndex + event.charIndex;
        charIndexRef.current = absoluteCharIndex;

        const textLength = textRef.current.length;
        const progressPercent = (absoluteCharIndex / textLength) * 100;
        setProgress(progressPercent);

        // Atualizar tempo decorrido estimado
        // Palavras lidas até agora
        const wordsRead = textRef.current.substring(0, absoluteCharIndex).split(/\s+/).length;
        // Tempo = palavras / (velocidade_base * rate)
        const secondsElapsed = (wordsRead / 160) * 60 / rateRef.current;
        setCurrentTime(formatTime(secondsElapsed));
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);

  }, [isSupported, voices]); // Removed rate/selectedVoiceURI dependencies

  const togglePlay = () => {
    if (isPlaying) {
      handlePause();
    } else {
      // Se estava pausado, retomamos do último índice conhecido
      handlePlay(charIndexRef.current);
    }
  };

  const handlePause = () => {
    isManuallyStopped.current = true;
    window.speechSynthesis.cancel(); // Cancelamos em vez de pause() nativo pois é mais estável entre browsers
    setIsPlaying(false);
    setIsPaused(true);
  };

  const handleStop = () => {
    cancelAudio();
  };

  // --- SETTINGS HANDLERS ---

  const handleRateChange = (newRate: number) => {
    setRate(newRate);
    rateRef.current = newRate;
    if (isPlaying) {
      // Retomar do ponto atual com nova velocidade
      // Set manual stop to true to prevent onend form triggering finish state
      isManuallyStopped.current = true;
      window.speechSynthesis.cancel();
      setTimeout(() => handlePlay(charIndexRef.current), 50);
    }
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVoiceURI = e.target.value;
    setSelectedVoiceURI(newVoiceURI);
    voiceRef.current = newVoiceURI;
    localStorage.setItem('ph_audio_voice', newVoiceURI);
    
    if (isPlaying) {
      isManuallyStopped.current = true;
      window.speechSynthesis.cancel();
      setTimeout(() => handlePlay(charIndexRef.current), 50);
    }
  };

  if (!isSupported) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mb-12 select-none relative z-10 font-sans">
        
        {/* Main Player Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
            
            {/* Background Progress Fill (Subtle) */}
            <div 
                className="absolute top-0 left-0 h-full bg-primary-50/50 pointer-events-none transition-all duration-300 ease-linear"
                style={{ width: `${progress}%` }}
            />

            <div className="flex items-center gap-4 relative z-10">
                
                {/* Play/Pause Button */}
                <button 
                    onClick={togglePlay}
                    className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                        isPlaying 
                        ? 'bg-primary-100 text-primary-600 ring-2 ring-primary-200' 
                        : 'bg-primary-600 text-white shadow-lg shadow-primary-600/30 hover:scale-105 active:scale-95'
                    }`}
                    aria-label={isPlaying ? "Pausar" : "Ouvir"}
                >
                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                </button>

                {/* Info Area */}
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-primary-600 uppercase tracking-wider flex items-center gap-2">
                            {isPlaying ? (
                                <>
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                                    </span>
                                    Ouvindo Artigo
                                </>
                            ) : (
                                "Ouvir Artigo"
                            )}
                        </span>
                        <div className="flex items-center gap-2">
                            {isPlaying && (
                                <div className="flex items-end gap-0.5 h-3">
                                    <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-primary-400 rounded-full" />
                                    <motion.div animate={{ height: [6, 10, 6] }} transition={{ repeat: Infinity, duration: 0.4, delay: 0.1 }} className="w-1 bg-primary-400 rounded-full" />
                                    <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1 bg-primary-400 rounded-full" />
                                    <motion.div animate={{ height: [5, 8, 5] }} transition={{ repeat: Infinity, duration: 0.3, delay: 0.1 }} className="w-1 bg-primary-400 rounded-full" />
                                </div>
                            )}
                            <span className="text-xs font-mono text-gray-400">{currentTime} / {totalTime}</span>
                        </div>
                    </div>
                    
                    {/* Visual Progress Bar */}
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-primary-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ ease: "linear", duration: 0.2 }}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 border-l border-gray-100 pl-3">
                    {(isPlaying || isPaused || progress > 0) && (
                        <button 
                            onClick={handleStop}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Parar"
                        >
                            <Square size={18} fill="currentColor" />
                        </button>
                    )}
                    <button 
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}
                        title="Configurações"
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            {/* Expandable Settings */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        className="overflow-hidden border-t border-gray-100 pt-4"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Speed Control */}
                            <div>
                                <div className="flex items-center gap-2 mb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    <Gauge size={12} /> Velocidade ({rate}x)
                                </div>
                                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
                                    {[0.5, 1, 1.25, 1.5, 2].map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => handleRateChange(r)}
                                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                rate === r 
                                                ? 'bg-white text-primary-600 shadow-sm border border-gray-200' 
                                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200/50'
                                            }`}
                                        >
                                            {r}x
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Voice Control */}
                            <div>
                                <div className="flex items-center gap-2 mb-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    <Mic2 size={12} /> Narrador
                                </div>
                                <div className="relative group/select">
                                    <select 
                                        value={selectedVoiceURI}
                                        onChange={handleVoiceChange}
                                        className="w-full bg-gray-50 hover:bg-white border border-gray-200 hover:border-primary-300 text-gray-700 text-xs font-medium rounded-xl p-2.5 pr-8 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none appearance-none transition-all cursor-pointer"
                                    >
                                        {voices.map((voice) => (
                                            <option key={voice.voiceURI} value={voice.voiceURI}>
                                                {voice.name.replace(/Google|Microsoft/g, '').trim()} ({voice.lang})
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none group-hover/select:text-primary-500 transition-colors" />
                                </div>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </div>
  );
};
