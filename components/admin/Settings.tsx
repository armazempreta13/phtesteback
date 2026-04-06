import React, { useState, useEffect } from 'react';
import { Zap, Globe, Code2, Trash, Plus, Loader2, AlertCircle, Save } from 'lucide-react';
import { api } from '../../lib/api';
import { Button } from '../Button';

// Default values for when no settings exist in DB
const DEFAULTS = {
  site: {
    TITLE: 'PH.static',
    SUBTITLE: 'Desenvolvimento Web Profissional',
    DESCRIPTION: 'Sites profissionais com React + Tailwind',
    COPYRIGHT: '© 2024 PH.static - Todos os direitos reservados',
  },
  contact: {
    EMAIL: 'contato@phstatic.com.br',
    WHATSAPP_NUMBER: '5561993254324',
    INSTAGRAM_URL: 'https://instagram.com/phstatic',
    FORMSPREE_ID: '',
  },
  performance: {
    ENABLE_PERFORMANCE_HUD: false,
  },
  notifications: {
    ENABLED: true,
  },
  easterEgg: {
    ENABLED: true,
  },
  skills: [
    { name: 'React', icon: 'Code2', color: 'text-blue-500' },
    { name: 'Tailwind', icon: 'Code2', color: 'text-cyan-500' },
    { name: 'TypeScript', icon: 'Code2', color: 'text-blue-600' },
  ],
};

const InputField = ({ label, value, onChange, placeholder = "", className = "" }: any) => (
    <div className={`mb-4 ${className}`}>
        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">{label}</label>
        <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white transition-all"
        />
    </div>
);

const TextAreaField = ({ label, value, onChange, placeholder = "", className = "" }: any) => (
    <div className={`mb-4 ${className}`}>
        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">{label}</label>
        <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white transition-all resize-none"
        />
    </div>
);

const ToggleSwitch = ({ label, checked, onChange, description }: any) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
        <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">{label}</h4>
            {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
        </div>
        <button
            onClick={() => onChange(!checked)}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${checked ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}
        >
            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
    </div>
);

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'geral' | 'skills' | 'sistema'>('geral');

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await api.settings.getAll();
      const data = res.data || {};
      setSettings({
        site: { ...DEFAULTS.site, ...(data.site || {}) },
        contact: { ...DEFAULTS.contact, ...(data.contact || {}) },
        performance: { ...DEFAULTS.performance, ...(data.performance || {}) },
        notifications: { ...DEFAULTS.notifications, ...(data.notifications || {}) },
        easterEgg: { ...DEFAULTS.easterEgg, ...(data.easterEgg || {}) },
        skills: data.skills || DEFAULTS.skills,
      });
      setError(null);
    } catch (err: any) {
      console.error('Settings load error:', err);
      // Use defaults if API fails
      setSettings({
        site: DEFAULTS.site,
        contact: DEFAULTS.contact,
        performance: DEFAULTS.performance,
        notifications: DEFAULTS.notifications,
        easterEgg: DEFAULTS.easterEgg,
        skills: DEFAULTS.skills,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateLocal = (section: string, data: any) => {
    setSettings((prev: any) => ({ ...prev, [section]: { ...(prev[section] || {}), ...data } }));
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      const { skills, ...rest } = settings;
      await api.settings.update({ ...rest, skills });
      setError(null);
      alert('Configurações salvas com sucesso!');
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const renderSkillsManager = () => {
      const skills = settings.skills || [];

      const addSkill = () => {
        updateLocal('skills', [...skills, { name: 'Nova Skill', icon: 'Code2', color: 'text-gray-500' }]);
      };

      const updateSkills = (newSkills: any[]) => {
        updateLocal('skills', newSkills);
      };

      const removeSkill = (idx: number) => {
        updateLocal('skills', skills.filter((_: any, i: number) => i !== idx));
      };

      return (
          <div className="bg-white dark:bg-[#151921] rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Code2 size={20} className="text-primary-600"/> Lista de Tecnologias</h3>
                  <button onClick={addSkill} className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-bold hover:bg-primary-700">
                      <Plus size={14} /> Adicionar
                  </button>
              </div>
              <div className="space-y-3">
                  {skills.map((skill: any, idx: number) => (
                      <div key={idx} className="flex gap-3 items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 group">
                          <div className="flex-1 grid grid-cols-2 gap-4">
                              <InputField label="Nome da Tecnologia" value={skill.name} onChange={(val: string) => {
                                  const newSkills = [...skills];
                                  newSkills[idx].name = val;
                                  updateSkills(newSkills);
                              }} className="mb-0"/>
                              <InputField label="Cor (Tailwind Class)" value={skill.color} onChange={(val: string) => {
                                  const newSkills = [...skills];
                                  newSkills[idx].color = val;
                                  updateSkills(newSkills);
                              }} className="mb-0"/>
                          </div>
                          <button onClick={() => removeSkill(idx)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-4">
                              <Trash size={16} />
                          </button>
                      </div>
                  ))}
              </div>
          </div>
      );
  };

  if (loading) return <div className="flex justify-center h-64"><Loader2 className="animate-spin text-primary-600" /></div>;

  return (
    <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações do Site</h2>
          <Button onClick={handleSaveAll} leftIcon={<Save size={16}/>} isLoading={saving} size="sm">Salvar Tudo</Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* TABS HEADER */}
        <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 pb-1">
            {[
                { id: 'geral', label: 'Geral & SEO', icon: Globe },
                { id: 'skills', label: 'Skills', icon: Zap },
                { id: 'sistema', label: 'Sistema', icon: Code2 },
            ].map((tab: any) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
                        activeTab === tab.id
                        ? 'border-primary-600 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                >
                    <tab.icon size={16} /> {tab.label}
                </button>
            ))}
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {activeTab === 'geral' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-[#151921] p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Identidade do Site</h3>
                        <InputField label="Título Principal" value={settings.site?.TITLE || ''} onChange={(v: string) => updateLocal('site', { TITLE: v })} />
                        <InputField label="Subtítulo" value={settings.site?.SUBTITLE || ''} onChange={(v: string) => updateLocal('site', { SUBTITLE: v })} />
                        <TextAreaField label="Descrição (Meta Description)" value={settings.site?.DESCRIPTION || ''} onChange={(v: string) => updateLocal('site', { DESCRIPTION: v })} />
                        <InputField label="Copyright" value={settings.site?.COPYRIGHT || ''} onChange={(v: string) => updateLocal('site', { COPYRIGHT: v })} />
                    </div>

                    <div className="bg-white dark:bg-[#151921] p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Informações de Contato</h3>
                        <InputField label="E-mail Principal" value={settings.contact?.EMAIL || ''} onChange={(v: string) => updateLocal('contact', { EMAIL: v })} />
                        <InputField label="WhatsApp (Apenas números)" value={settings.contact?.WHATSAPP_NUMBER || ''} onChange={(v: string) => updateLocal('contact', { WHATSAPP_NUMBER: v })} />
                        <InputField label="Link Instagram" value={settings.contact?.INSTAGRAM_URL || ''} onChange={(v: string) => updateLocal('contact', { INSTAGRAM_URL: v })} />
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 mt-4">
                            <p className="text-xs text-blue-800 dark:text-blue-300 mb-2 font-bold">Formulário de Contato (Formspree)</p>
                            <InputField label="ID do Formulário" value={settings.contact?.FORMSPREE_ID || ''} onChange={(v: string) => updateLocal('contact', { FORMSPREE_ID: v })} className="mb-0" />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'skills' && renderSkillsManager()}

            {activeTab === 'sistema' && (
                <div className="max-w-2xl space-y-6">
                    <div className="bg-white dark:bg-[#151921] p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                        <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Funcionalidades & Toggles</h3>

                        <ToggleSwitch
                            label="HUD de Performance"
                            description="Exibe um monitor de FPS e memória para os visitantes."
                            checked={settings.performance?.ENABLE_PERFORMANCE_HUD || false}
                            onChange={(val: boolean) => updateLocal('performance', { ENABLE_PERFORMANCE_HUD: val })}
                        />

                        <ToggleSwitch
                            label="Central de Notificações"
                            description="Ativa o ícone de sino flutuante com novidades."
                            checked={settings.notifications?.ENABLED !== false}
                            onChange={(val: boolean) => updateLocal('notifications', { ENABLED: val })}
                        />

                        <ToggleSwitch
                            label="Modo Easter Egg"
                            description="Ativa o mini-game secreto (Konami Code)."
                            checked={settings.easterEgg?.ENABLED !== false}
                            onChange={(val: boolean) => updateLocal('easterEgg', { ENABLED: val })}
                        />
                    </div>
                </div>
            )}

        </div>
    </div>
  );
};
