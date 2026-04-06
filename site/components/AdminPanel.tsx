
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Copy, Check, Settings, Layout, User, Globe, Mail, Lock, Key, ShieldAlert, AlertTriangle, Zap, Bell, HelpCircle, Code2, Database } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';

// Componente extraído para respeitar as Regras dos Hooks
const JsonEditor = ({ section, itemKey, label, isRoot = false }: { section: any, itemKey: string | null, label: string, isRoot?: boolean }) => {
  const { content, updateContent } = useContent();
  const value = isRoot ? content[section] : content[section][itemKey!];
  
  const [jsonStr, setJsonStr] = useState(JSON.stringify(value, null, 2));
  const [error, setError] = useState<string | null>(null);

  // Sync internal state if content changes externally or we switch tabs
  useEffect(() => {
    setJsonStr(JSON.stringify(value, null, 2));
    setError(null);
  }, [value]); 

  const handleJsonChange = (val: string) => {
      setJsonStr(val);
      try {
          const parsed = JSON.parse(val);
          setError(null);
          if (isRoot) {
              updateContent(section, parsed); 
          } else {
              updateContent(section, { [itemKey!]: parsed });
          }
      } catch (e) {
          setError("JSON Inválido");
      }
  };

  return (
      <div className="mb-6">
          <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-gray-500 uppercase">{label}</label>
              <span className="text-[10px] text-gray-400">JSON Mode</span>
          </div>
          <textarea 
              value={jsonStr}
              onChange={(e) => handleJsonChange(e.target.value)}
              className={`w-full bg-gray-900 text-green-400 font-mono text-xs p-3 rounded-lg border min-h-[200px] outline-none ${error ? 'border-red-500' : 'border-gray-800'}`}
              spellCheck={false}
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
  );
};

export const AdminPanel: React.FC = () => {
  const { content, updateContent, resetContent, exportConfig, isAdminOpen, toggleAdmin } = useContent();
  const [activeTab, setActiveTab] = useState<'geral' | 'conteudo' | 'funcionalidades' | 'avancado'>('geral');
  const [subTab, setSubTab] = useState('site'); // Subtab state
  const [copied, setCopied] = useState(false);
  
  // Security States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVaultTriggered, setIsVaultTriggered] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // --- DETECÇÃO DE GATILHO ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('vault') === 'open') {
      setIsVaultTriggered(true);
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);
    setLoginError(false);
    
    // Simulação rápida
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // LOGIN SIMPLIFICADO: APENAS 'admin'
    if (passwordInput === 'admin') {
      setIsAuthenticated(true);
      if (!isAdminOpen) toggleAdmin();
    } else {
      setLoginError(true);
      setPasswordInput("");
    }
    setIsChecking(false);
  };

  const handleCopy = () => {
    const code = exportConfig();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    alert("Configuração copiada!");
  };

  // --- HELPERS DE INPUT ---

  const renderInput = (section: any, key: string, label: string, isTextArea = false) => {
    const value = content[section][key];
    return (
      <div className="mb-4">
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label>
        {isTextArea ? (
          <textarea
            value={value}
            onChange={(e) => updateContent(section, { [key]: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none min-h-[80px]"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => updateContent(section, { [key]: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          />
        )}
      </div>
    );
  };

  const renderToggle = (section: any, key: string, label: string) => {
    const value = content[section][key];
    return (
      <div className="mb-4 flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
        <label className="text-sm font-bold text-gray-700">{label}</label>
        <button 
          onClick={() => updateContent(section, { [key]: !value })}
          className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${value ? 'bg-green-500' : 'bg-gray-300'}`}
        >
          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${value ? 'translate-x-4' : 'translate-x-0'}`} />
        </button>
      </div>
    );
  };

  const renderArrayInput = (section: any, key: string, label: string) => {
      const value = content[section][key];
      return (
        <div className="mb-4">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label} (Separado por vírgula)</label>
            <input
                type="text"
                value={Array.isArray(value) ? value.join(', ') : ''}
                onChange={(e) => updateContent(section, { [key]: e.target.value.split(',').map((s: string) => s.trim()) })}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
        </div>
      )
  };

  // --- TELA DE BLOQUEIO ---
  if (isVaultTriggered && !isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[10000] bg-gray-900/95 backdrop-blur-xl flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gray-50 p-6 text-center border-b border-gray-100">
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"><Lock size={32} className="text-white" /></div>
            <h2 className="text-xl font-display font-bold text-gray-900">Acesso Restrito</h2>
          </div>
          <form onSubmit={handleLogin} className="p-6">
            <div className="relative mb-6">
              <Key size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="password" autoFocus value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 transition-all font-mono text-sm ${loginError ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-gray-200'}`} placeholder="Senha: admin" />
            </div>
            {loginError && <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-xs font-bold"><ShieldAlert size={14} /> Acesso Negado</div>}
            <div className="flex gap-3">
              <button type="button" onClick={() => {setIsVaultTriggered(false); setIsAuthenticated(false);}} className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">Cancelar</button>
              <button type="submit" disabled={!passwordInput || isChecking} className="flex-1 bg-gray-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2">{isChecking ? <RefreshCw size={16} className="animate-spin"/> : 'Desbloquear'}</button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  // --- PAINEL PRINCIPAL ---
  return (
    <AnimatePresence>
      {isAuthenticated && isAdminOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={toggleAdmin} className="fixed inset-0 bg-black/20 z-[9997] backdrop-blur-sm" />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-screen w-full md:w-[600px] bg-white shadow-2xl z-[9998] flex flex-col border-l border-gray-200"
          >
            {/* HEADER */}
            <div className="p-5 border-b border-gray-100 bg-gray-900 text-white flex justify-between items-center shrink-0">
              <div>
                <h2 className="font-bold text-lg flex items-center gap-2"><Settings size={18} className="text-green-400"/> Admin Seguro</h2>
              </div>
              <div className="flex gap-2">
                <button onClick={resetContent} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Resetar"><RefreshCw size={18} /></button>
                <button onClick={() => { toggleAdmin(); setIsAuthenticated(false); }} className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors" title="Sair"><X size={18} /></button>
              </div>
            </div>

            {/* MAIN TABS */}
            <div className="flex border-b border-gray-200 bg-gray-50 shrink-0">
              {[
                { id: 'geral', label: 'Geral', icon: Globe },
                { id: 'conteudo', label: 'Conteúdo', icon: Layout },
                { id: 'funcionalidades', label: 'Funcionalidades', icon: Zap },
                { id: 'avancado', label: 'Dados (JSON)', icon: Database },
              ].map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as any); setSubTab(tab.id === 'geral' ? 'site' : 'hero'); }}
                  className={`flex-1 py-4 text-[10px] sm:text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex flex-col items-center gap-1 ${activeTab === tab.id ? 'border-gray-900 text-gray-900 bg-white' : 'border-transparent text-gray-500 hover:bg-white'}`}
                >
                  <tab.icon size={16} /> {tab.label}
                </button>
              ))}
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white">
              
              {/* === TAB GERAL === */}
              {activeTab === 'geral' && (
                <div className="space-y-8">
                    {/* Sections Toggles */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                        <button onClick={() => setSubTab('site')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${subTab === 'site' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Site & SEO</button>
                        <button onClick={() => setSubTab('contact')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${subTab === 'contact' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Contato</button>
                        <button onClick={() => setSubTab('menu')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${subTab === 'menu' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Menu (Nav)</button>
                        <button onClick={() => setSubTab('analytics')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${subTab === 'analytics' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Analytics</button>
                    </div>

                    {subTab === 'site' && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-900 border-b pb-2 mb-4">Informações do Site</h3>
                            {renderInput('site', 'TITLE', 'Título do Site')}
                            {renderInput('site', 'SUBTITLE', 'Subtítulo')}
                            {renderInput('site', 'DESCRIPTION', 'Descrição Meta (SEO)', true)}
                            {renderInput('site', 'URL', 'URL Canônica (ex: https://site.com)')}
                            {renderInput('site', 'COPYRIGHT', 'Texto de Copyright')}
                        </div>
                    )}

                    {subTab === 'contact' && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-900 border-b pb-2 mb-4">Dados de Contato</h3>
                            {renderInput('contact', 'EMAIL', 'E-mail Principal')}
                            {renderInput('contact', 'WHATSAPP_NUMBER', 'WhatsApp (Apenas números)')}
                            {renderInput('contact', 'INSTAGRAM_URL', 'Link Instagram')}
                            {renderInput('contact', 'GITHUB_URL', 'Link GitHub')}
                            
                            <div className="p-4 bg-red-50 border border-red-100 rounded-xl mt-6">
                                <p className="text-xs text-red-800 mb-2 font-bold flex items-center gap-1"><AlertTriangle size={12}/> Integração Formspree</p>
                                {renderInput('contact', 'FORMSPREE_ID', 'ID do Formulário')}
                            </div>

                            <div className="mt-6">
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">SEO Local (Schema)</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {renderInput('contact', 'ADDRESS_CITY', 'Cidade')}
                                    {renderInput('contact', 'ADDRESS_REGION', 'Estado (Sigla)')}
                                    {renderInput('contact', 'GEO_LAT', 'Latitude')}
                                    {renderInput('contact', 'GEO_LONG', 'Longitude')}
                                </div>
                            </div>
                        </div>
                    )}

                    {subTab === 'menu' && <JsonEditor section="navItems" itemKey={null} label="Itens do Menu" isRoot={true} />}

                    {subTab === 'analytics' && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-900 border-b pb-2 mb-4">Rastreamento</h3>
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                <p className="text-xs text-blue-800 mb-2 font-bold">Google Analytics 4</p>
                                {renderInput('analytics', 'GA_MEASUREMENT_ID', 'Measurement ID (G-XXXXXXXX)')}
                            </div>
                        </div>
                    )}
                </div>
              )}

              {/* === TAB CONTEÚDO === */}
              {activeTab === 'conteudo' && (
                <div className="space-y-8">
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                        <button onClick={() => setSubTab('hero')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${subTab === 'hero' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Hero</button>
                        <button onClick={() => setSubTab('about')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${subTab === 'about' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Sobre</button>
                        <button onClick={() => setSubTab('financial')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${subTab === 'financial' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Financeiro</button>
                    </div>

                    {subTab === 'hero' && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-900 border-b pb-2 mb-4">Seção Principal (Hero)</h3>
                            {renderInput('hero', 'STATUS_BADGE', 'Texto do Badge')}
                            {renderInput('hero', 'TITLE_PREFIX', 'Prefixo do Título')}
                            {renderInput('hero', 'TITLE_HIGHLIGHT', 'Destaque do Título')}
                            {renderArrayInput('hero', 'DYNAMIC_WORDS', 'Palavras em Rotação')}
                            {renderInput('hero', 'SUBTITLE_START', 'Subtítulo (Início)', true)}
                            {renderInput('hero', 'SUBTITLE_HIGHLIGHT_1', 'Destaque 1')}
                            {renderInput('hero', 'SUBTITLE_MIDDLE', 'Subtítulo (Meio)')}
                            {renderInput('hero', 'SUBTITLE_HIGHLIGHT_2', 'Destaque 2')}
                            {renderInput('hero', 'SUBTITLE_END', 'Subtítulo (Fim)')}
                            <div className="grid grid-cols-2 gap-4">
                                {renderInput('hero', 'CTA_PRIMARY', 'Botão Principal')}
                                {renderInput('hero', 'CTA_SECONDARY', 'Botão Secundário')}
                            </div>
                        </div>
                    )}

                    {subTab === 'about' && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-900 border-b pb-2 mb-4">Seção Sobre</h3>
                            {renderInput('about', 'TITLE', 'Título')}
                            {renderInput('about', 'SUBTITLE', 'Subtítulo')}
                            {renderInput('about', 'IMAGE_URL', 'URL da Foto')}
                            {renderInput('about', 'EXPERIENCE_YEARS', 'Texto de Experiência')}
                            
                            <div className="mt-4">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Parágrafos</label>
                                {content.about.PARAGRAPHS.map((p: string, i: number) => (
                                    <textarea
                                        key={i}
                                        value={p}
                                        onChange={(e) => {
                                            const newP = [...content.about.PARAGRAPHS];
                                            newP[i] = e.target.value;
                                            updateContent('about', { PARAGRAPHS: newP });
                                        }}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm outline-none mb-2 min-h-[80px]"
                                        placeholder={`Parágrafo ${i + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {subTab === 'financial' && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-900 border-b pb-2 mb-4">Notas Financeiras</h3>
                            <textarea
                                value={content.financialNote}
                                onChange={(e) => updateContent('financialNote', e.target.value)} // Special handler needed
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm outline-none min-h-[100px]"
                            />
                            <p className="text-xs text-gray-400">Exibido na seção "Fluxo de Trabalho" abaixo dos preços.</p>
                        </div>
                    )}
                </div>
              )}

              {/* === TAB FUNCIONALIDADES === */}
              {activeTab === 'funcionalidades' && (
                <div className="space-y-8">
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                        <button onClick={() => setSubTab('performance')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${subTab === 'performance' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Performance</button>
                        <button onClick={() => setSubTab('notifications')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${subTab === 'notifications' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Notificações</button>
                        <button onClick={() => setSubTab('easteregg')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${subTab === 'easteregg' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Easter Egg</button>
                    </div>

                    {subTab === 'performance' && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-900 border-b pb-2 mb-4">HUD de Performance</h3>
                            {renderToggle('performance', 'ENABLE_PERFORMANCE_HUD', 'Ativar Monitor de FPS/Recursos')}
                            {renderInput('performance', 'METRICS_UPDATE_INTERVAL', 'Intervalo de Atualização (ms)')}
                        </div>
                    )}

                    {subTab === 'notifications' && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-900 border-b pb-2 mb-4">Central de Notificações</h3>
                            {renderToggle('notifications', 'ENABLED', 'Ativar Central')}
                            <JsonEditor section="notifications" itemKey="ITEMS" label="Itens de Notificação" />
                        </div>
                    )}

                    {subTab === 'easteregg' && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-900 border-b pb-2 mb-4">Modo Secreto (Game/OS)</h3>
                            {renderToggle('easterEgg', 'ENABLED', 'Ativar Easter Egg')}
                            {renderInput('easterEgg', 'SECRET_TOKEN', 'Token Secreto (Prêmio)')}
                            {renderInput('easterEgg', 'LOGO_CLICKS_REQUIRED', 'Cliques no Logo para Ativar')}
                        </div>
                    )}
                </div>
              )}

              {/* === TAB AVANÇADO (ARRAYS) === */}
              {activeTab === 'avancado' && (
                <div className="space-y-8">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-6">
                        <p className="text-xs text-yellow-800 flex items-center gap-2 font-bold"><AlertTriangle size={14}/> Atenção</p>
                        <p className="text-xs text-yellow-700 mt-1">
                            Edite as listas abaixo com cuidado. Mantenha o formato JSON válido.
                            Ícones complexos (componentes) podem não ser exibidos aqui, mas os dados sim.
                        </p>
                    </div>

                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                        <button onClick={() => setSubTab('services')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${subTab === 'services' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Serviços</button>
                        <button onClick={() => setSubTab('skills')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${subTab === 'skills' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Skills</button>
                        <button onClick={() => setSubTab('faq')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${subTab === 'faq' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>FAQ</button>
                        <button onClick={() => setSubTab('process')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${subTab === 'process' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Processo</button>
                    </div>

                    {subTab === 'services' && <JsonEditor section="services" itemKey={null} label="Pacotes de Serviços" isRoot={true} />}
                    {subTab === 'skills' && <JsonEditor section="skills" itemKey={null} label="Lista de Habilidades" isRoot={true} />}
                    {subTab === 'faq' && <JsonEditor section="faq" itemKey={null} label="Perguntas Frequentes" isRoot={true} />}
                    {subTab === 'process' && <JsonEditor section="process" itemKey={null} label="Etapas do Processo" isRoot={true} />}
                </div>
              )}

            </div>

            {/* FOOTER */}
            <div className="p-5 border-t border-gray-200 bg-gray-50 shrink-0">
              <button onClick={handleCopy} className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-bold py-3 px-4 rounded-xl hover:bg-black transition-all active:scale-95 shadow-lg">
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Configuração Copiada!' : 'Exportar JSON'}
              </button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
