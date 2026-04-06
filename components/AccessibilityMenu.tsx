
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Accessibility, 
  X, 
  RefreshCcw, 
  Type, 
  Sun, 
  Eye, 
  Link as LinkIcon, 
  Monitor,
  Check,
  Settings2
} from 'lucide-react';

// --- TIPO & ESTADO INICIAL ---
interface A11ySettings {
  grayscale: boolean;
  contrast: boolean;
  largeText: boolean;
  readableFont: boolean;
  highlightLinks: boolean;
  sysMonitor: boolean;
}

const DEFAULT_SETTINGS: A11ySettings = {
  grayscale: false,
  contrast: false,
  largeText: false,
  readableFont: false,
  highlightLinks: false,
  sysMonitor: false,
};

// --- COMPONENTES AUXILIARES DE UI ---

const Switch = ({ isOn }: { isOn: boolean }) => (
  <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${isOn ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
    <motion.div 
      className="w-4 h-4 bg-white rounded-full shadow-sm"
      animate={{ x: isOn ? 16 : 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    />
  </div>
);

const FeatureRow = ({ 
  icon: Icon, 
  label, 
  isActive, 
  onClick 
}: { 
  icon: any, 
  label: string, 
  isActive: boolean, 
  onClick: () => void 
}) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
        <Icon size={18} />
      </div>
      <span className={`text-sm font-medium ${isActive ? 'text-gray-900 dark:text-white font-bold' : 'text-gray-600 dark:text-gray-300'}`}>
        {label}
      </span>
    </div>
    <Switch isOn={isActive} />
  </button>
);

const ActionCard = ({ 
  icon: Icon, 
  label, 
  isActive, 
  onClick 
}: { 
  icon: any, 
  label: string, 
  isActive: boolean, 
  onClick: () => void 
}) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all duration-300 w-full ${
      isActive 
        ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-300' 
        : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'
    }`}
  >
    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
    <span className="text-xs font-bold">{label}</span>
    {isActive && <div className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full animate-pulse" />}
  </button>
);

// --- COMPONENTE PRINCIPAL ---

export const AccessibilityMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [settings, setSettings] = useState<A11ySettings>(DEFAULT_SETTINGS);

  // Carregar Settings
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('ph_a11y_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar configurações de acessibilidade");
      }
    }

    // Ouvir eventos externos para sincronizar estado (ex: fechar monitor pelo X)
    const handleExternalUpdate = (e: CustomEvent) => {
        if (e.detail && typeof e.detail.sysMonitor !== 'undefined') {
            setSettings(prev => ({ ...prev, sysMonitor: e.detail.sysMonitor }));
        }
    };

    window.addEventListener('update-a11y-state', handleExternalUpdate as EventListener);
    return () => window.removeEventListener('update-a11y-state', handleExternalUpdate as EventListener);
  }, []);

  // Aplicar Efeitos no DOM
  useEffect(() => {
    if (!isMounted) return;

    const html = document.documentElement;
    const { grayscale, contrast, largeText, readableFont, highlightLinks, sysMonitor } = settings;

    // Classes CSS Globais (definidas no index.html ou globals.css)
    const toggleClass = (cls: string, active: boolean) => active ? html.classList.add(cls) : html.classList.remove(cls);

    toggleClass('a11y-grayscale', grayscale);
    toggleClass('a11y-contrast', contrast);
    toggleClass('a11y-large-text', largeText);
    toggleClass('a11y-readable-font', readableFont);
    toggleClass('a11y-highlight-links', highlightLinks);

    // Dispatch event para o PerformanceHud
    window.dispatchEvent(new CustomEvent('toggle-sys-monitor', { detail: { show: sysMonitor } }));

    localStorage.setItem('ph_a11y_settings', JSON.stringify(settings));
  }, [settings, isMounted]);

  const toggle = (key: keyof A11ySettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const reset = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  if (!isMounted) return null;

  const hasActiveSettings = Object.values(settings).some(Boolean);

  return (
    <>
      {/* OVERLAY CLICÁVEL (apenas desktop para fechar ao clicar fora) */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[88] bg-transparent" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* POSICIONAMENTO: TOPO DIREITO */}
      <div className="fixed top-24 right-4 z-[90] font-sans flex flex-col items-end gap-4">
        
        {/* BOTÃO TRIGGER */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`
            relative w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-50
            ${isOpen 
              ? 'bg-gray-900 text-white rotate-90 shadow-gray-900/30' 
              : 'bg-white/90 backdrop-blur-md text-gray-600 hover:text-primary-600 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white'
            }
          `}
          aria-label="Menu de Acessibilidade"
        >
          {isOpen ? (
            <X size={20} />
          ) : (
            <Accessibility size={22} strokeWidth={1.5} />
          )}

          {/* Indicator Dot */}
          {!isOpen && hasActiveSettings && (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
               <Check size={8} className="text-white" strokeWidth={4} />
            </span>
          )}
        </motion.button>

        {/* PAINEL FLUTUANTE */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95, transformOrigin: "top right" }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-2xl rounded-3xl p-5 w-[300px] max-w-[calc(100vw-32px)] overflow-hidden"
              onClick={(e) => e.stopPropagation()} 
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-primary-600 text-white p-2 rounded-xl shadow-lg shadow-primary-600/20">
                    <Accessibility size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base">Acessibilidade</h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Ferramentas de UI</p>
                  </div>
                </div>
                
                <button 
                  onClick={reset} 
                  className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Restaurar Padrão"
                >
                  <RefreshCcw size={16} />
                </button>
              </div>

              {/* Grid Actions */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <ActionCard 
                  icon={Type} 
                  label="Texto Maior" 
                  isActive={settings.largeText} 
                  onClick={() => toggle('largeText')} 
                />
                <ActionCard 
                  icon={Sun} 
                  label="Alto Contraste" 
                  isActive={settings.contrast} 
                  onClick={() => toggle('contrast')} 
                />
              </div>

              <div className="h-px bg-gray-100 dark:bg-gray-800 w-full mb-4" />

              {/* List Actions */}
              <div className="space-y-1">
                <FeatureRow 
                  icon={Eye} 
                  label="Modo Leitura" 
                  isActive={settings.grayscale} 
                  onClick={() => toggle('grayscale')} 
                />
                <FeatureRow 
                  icon={LinkIcon} 
                  label="Destacar Links" 
                  isActive={settings.highlightLinks} 
                  onClick={() => toggle('highlightLinks')} 
                />
                <FeatureRow 
                  icon={Monitor} 
                  label="Saúde do Site" 
                  isActive={settings.sysMonitor} 
                  onClick={() => toggle('sysMonitor')} 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </>
  );
};
