
import React, { useState, useEffect, useRef } from 'react';
import { X, Activity, Zap, CheckCircle2, AlertTriangle, Smartphone, Gauge } from 'lucide-react';
import { useMobile } from '../hooks/useMobile';
import { motion, AnimatePresence } from 'framer-motion';
import { useContent } from '../contexts/ContentContext';

export const PerformanceHud: React.FC = () => {
  const { content } = useContent();
  const { performance: config } = content;
  
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState({
    fps: 60,
    loadTime: 0,
    lcp: 0,
    memory: 0
  });
  
  const isMobile = useMobile();
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef(0);

  // Listen for toggle event
  useEffect(() => {
    const handleToggle = (e: CustomEvent) => {
        setIsVisible(e.detail.show);
    };
    window.addEventListener('toggle-sys-monitor', handleToggle as EventListener);
    return () => window.removeEventListener('toggle-sys-monitor', handleToggle as EventListener);
  }, []);

  const handleClose = () => {
      // Dispatch event to AccessibilityMenu to update global state and storage
      window.dispatchEvent(new CustomEvent('update-a11y-state', { detail: { sysMonitor: false } }));
  };

  // Performance Monitoring Logic
  useEffect(() => {
    if (!isVisible) return;

    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navEntry) {
      setMetrics(prev => ({ ...prev, loadTime: Math.round(navEntry.loadEventEnd) }));
    }

    let observer: PerformanceObserver | null = null;

    try {
      if (typeof PerformanceObserver !== 'undefined') {
        observer = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          setMetrics(prev => ({ ...prev, lcp: Math.round(lastEntry.startTime) }));
        });
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
      }
    } catch (e) {
      console.warn("PerformanceObserver not supported or blocked.");
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };

  }, [isVisible]);

  // FPS Loop
  const animate = (time: number) => {
    frameCountRef.current++;
    if (time - lastTimeRef.current >= config.METRICS_UPDATE_INTERVAL) {
      const currentFPS = Math.round(frameCountRef.current);
      const memory = (performance as any).memory 
        ? Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024) 
        : 0;

      setMetrics(prev => ({ ...prev, fps: currentFPS, memory }));
      frameCountRef.current = 0;
      lastTimeRef.current = time;
    }
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isVisible) {
        requestRef.current = requestAnimationFrame(animate);
    } else {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isVisible, config.METRICS_UPDATE_INTERVAL]);

  if (!config.ENABLE_PERFORMANCE_HUD) return null;

  // 1. Status Geral (Fluidez)
  const getFluidityStatus = (fps: number) => {
      if (fps >= 55) return { 
          label: 'Performance de Elite', 
          desc: 'Seu dispositivo está rodando este site sem nenhum esforço.',
          color: 'text-green-600', 
          bg: 'bg-green-500', 
          icon: CheckCircle2 
      };
      if (fps >= 30) return { 
          label: 'Bom', 
          desc: 'O site está rápido e responsivo.',
          color: 'text-yellow-600', 
          bg: 'bg-yellow-500', 
          icon: Activity 
      };
      return { 
          label: 'Lento', 
          desc: 'Seu dispositivo pode estar sobrecarregado.',
          color: 'text-red-600', 
          bg: 'bg-red-500', 
          icon: AlertTriangle 
      };
  };

  // 2. Velocidade (LCP/Load)
  const getSpeedLabel = (ms: number) => {
      if (ms === 0) return "Calculando...";
      if (ms < 1000) return "Instantâneo ⚡";
      if (ms < 2500) return "Rápido 🚀";
      return "Normal 🐢";
  };

  const status = getFluidityStatus(metrics.fps);
  const StatusIcon = status.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className={`fixed z-[89] bg-white/95 backdrop-blur-xl border border-gray-200/50 shadow-2xl rounded-2xl p-5 font-sans select-none w-72 top-24 left-4`}
        >
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
             <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-50 rounded-lg text-green-600">
                    <Activity size={16} />
                </div>
                <div>
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Qualidade Técnica</h3>
                    <p className="text-[10px] text-gray-500">Monitorando em tempo real</p>
                </div>
             </div>
             <button 
               onClick={handleClose} 
               className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
             >
               <X size={14} />
             </button>
          </div>

          <div className="mb-5 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                  <StatusIcon size={18} className={status.color} />
                  <span className={`font-bold text-sm ${status.color}`}>{status.label}</span>
              </div>
              <p className="text-[11px] text-gray-600 leading-tight">
                  {status.desc}
              </p>
          </div>

          <div className="space-y-4">
              <div>
                  <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500 mb-1">
                      <span>Fluidez Visual</span>
                      <span>{metrics.fps} FPS</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full rounded-full ${status.bg}`}
                        animate={{ width: `${(metrics.fps / 60) * 100}%` }}
                        transition={{ type: "spring", stiffness: 50 }}
                      />
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="bg-blue-50 p-2 rounded-full text-blue-600">
                          <Zap size={16} />
                      </div>
                      <div>
                          <p className="text-[9px] text-gray-400 font-bold uppercase">Abertura</p>
                          <p className="text-xs font-bold text-gray-900">{getSpeedLabel(metrics.lcp)}</p>
                      </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="bg-purple-50 p-2 rounded-full text-purple-600">
                          <Smartphone size={16} />
                      </div>
                      <div>
                          <p className="text-[9px] text-gray-400 font-bold uppercase">Recursos</p>
                          <p className="text-xs font-bold text-gray-900">
                              {metrics.memory > 0 ? "Otimizado" : "Baixo Uso"}
                          </p>
                      </div>
                  </div>
              </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-[9px] text-gray-400 text-center flex items-center justify-center gap-1">
                  <CheckCircle2 size={10} className="text-green-500" />
                  Site leve = Mais bateria para seu cliente.
              </p>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};
