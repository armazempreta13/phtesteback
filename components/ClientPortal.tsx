import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, CheckCircle2, Clock, Download, FileText,
  MessageSquare, User, LogOut, Layout, Zap, Calendar, ExternalLink,
  CreditCard, Bell, ShieldCheck, Activity, Info, AlertTriangle, Check, Settings, Lock, Key, Mail, X, Save, PenTool, Home,
  Send, RefreshCw, DollarSign, ClipboardList, Star, Code2, Eye, Loader2, Globe
} from 'lucide-react';
import { ViewType, ContractData } from '../types';
import { Button } from './Button';
import { useProject } from '../contexts/ProjectContext';
import { CheckoutScreen } from './CheckoutScreen';
import { ContractGeneratorModal } from './ContractGeneratorModal';
import { api } from '../lib/api';

// ─── TYPES ───
type PortalTab = 'overview' | 'timeline' | 'messages' | 'files' | 'contract' | 'briefing';
interface ClientPortalProps { onLogout: () => void; onNavigate: (view: ViewType) => void; isAdmin?: boolean; }

// ─── SETTINGS MODAL ───
const ClientSettingsModal = ({ isOpen, onClose, userEmail, userName }: { isOpen: boolean; onClose: () => void; userEmail: string; userName: string }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [name, setName] = useState(userName);
  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  useEffect(() => { if (isOpen) { setMessage(null); setCurrentPassInput(''); setNewPass(''); setConfirmPass(''); setName(userName); } }, [isOpen, userName]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoading(true); setMessage(null);
    try { await api.auth.updateProfile({ name }); setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' }); }
    catch (error: any) { setMessage({ type: 'error', text: error.message || 'Erro ao atualizar perfil.' }); } finally { setIsLoading(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) { setMessage({ type: 'error', text: 'As senhas nao coincidem.' }); return; }
    if (newPass.length < 6) { setMessage({ type: 'error', text: 'Minimo 6 caracteres.' }); return; }
    if (!currentPassInput) { setMessage({ type: 'error', text: 'Informe a senha atual.' }); return; }
    setIsLoading(true); setMessage(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/auth/change-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
        body: JSON.stringify({ currentPassword: currentPassInput, newPassword: newPass }),
      });
      const d = await res.json(); if (!res.ok) throw new Error(d.message);
      setMessage({ type: 'success', text: 'Senha alterada com sucesso!' }); setCurrentPassInput(''); setNewPass(''); setConfirmPass('');
    } catch (error: any) { setMessage({ type: 'error', text: error.message || 'Erro ao alterar senha.' }); } finally { setIsLoading(false); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-md bg-white dark:bg-[#1A1D24] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Settings size={18} /> Minha Conta</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><X size={20} /></button>
            </div>
            <div className="flex border-b border-gray-100 dark:border-gray-700">
              <button onClick={() => { setActiveTab('profile'); setMessage(null); }} className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'profile' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500'}`}>Dados Pessoais</button>
              <button onClick={() => { setActiveTab('security'); setMessage(null); }} className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'security' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500'}`}>Seguranca</button>
            </div>
            <div className="p-6 overflow-y-auto">
              {message && <div className={`mb-4 p-3 rounded-lg text-xs font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{message.type === 'success' ? <CheckCircle2 size={16}/> : <AlertTriangle size={16}/>} {message.text}</div>}
              {activeTab === 'profile' && (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Nome</label><div className="relative"><User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"/></div></div>
                  <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">E-mail</label><div className="relative"><Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="email" value={userEmail} disabled className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-gray-500 cursor-not-allowed"/></div></div>
                  <div className="pt-2"><Button type="submit" isLoading={isLoading} className="w-full" size="sm" rightIcon={<Save size={16}/>}>Salvar</Button></div>
                </form>
              )}
              {activeTab === 'security' && (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Senha Atual</label><div className="relative"><Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="password" value={currentPassInput} onChange={(e) => setCurrentPassInput(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" placeholder="Senha atual"/></div></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Nova Senha</label><div className="relative"><Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" placeholder="Nova senha"/></div></div>
                    <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Confirmar</label><div className="relative"><Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:text-white" placeholder="Repita"/></div></div>
                  </div>
                  <div className="pt-2"><Button type="submit" isLoading={isLoading} className="w-full bg-gray-900 hover:bg-black text-white" size="sm" rightIcon={<ShieldCheck size={16}/>}>Atualizar Senha</Button></div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ─── MAP ROW ───
function mapRow(row: any): any {
  const parse = (key: string) => { const v = row[key]; if (v && typeof v === 'string') { try { return JSON.parse(v); } catch {} } return v || undefined; };
  const sm: Record<string, string> = { pending: 'new', approved: 'development' };
  return {
    id: String(row.id), clientName: row.client_name || 'Cliente', cpf: row.client_cpf || '',
    email: row.client_email || '', projectName: row.title || 'Sem titulo',
    status: sm[row.status] || row.status || 'new', progress: row.progress ?? 0,
    nextMilestone: row.next_milestone || 'Inicio do Projeto',
    dueDate: row.deadline ? new Date(row.deadline).toLocaleDateString('pt-BR') : '',
    lastUpdate: new Date(row.updated_at || row.created_at).toLocaleDateString('pt-BR'),
    financial: { total: row.financial_total ?? row.budget ?? 0, paid: row.financial_paid ?? 0, status: row.financial_status ?? 'pending' },
    tasks: parse('tasks') || [], files: parse('files') || [], links: parse('links') || {},
    activity: parse('activity') || [], notifications: parse('notifications') || [],
    contract: parse('contract') || {}, paymentOrder: parse('payment_order') || null,
    briefing: parse('briefing') || {}, messages: parse('messages') || [],
  };
}

// ─── TIMELINE VIEW ───
const TimelineView: React.FC<{ project: any }> = ({ project }) => {
  const phaseIcons: Record<string, any> = { new: Star, briefing: ClipboardList, development: Code2, review: Eye, completed: CheckCircle2 };
  const phaseLabels: Record<string, string> = { new: 'Novo Lead', briefing: 'Briefing', development: 'Producao', review: 'Revisao', completed: 'Concluido' };
  const phaseOrder = ['new', 'briefing', 'development', 'review', 'completed'];
  const currentIndex = phaseOrder.findIndex(p => p === (project.status === 'pending' ? 'new' : project.status));

  return (
    <div className="space-y-8">
      <div><h3 className="text-lg font-bold text-gray-900 dark:text-white">Cronograma</h3><p className="text-sm text-gray-500">Fases do projeto e progresso atual</p></div>
      <div className="bg-white dark:bg-[#151921] rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h4 className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-6">Fases do Projeto</h4>
        <div className="relative">
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
            <div className="h-full bg-gradient-to-r from-primary-500 to-green-500 rounded-full transition-all duration-700" style={{ width: `${project.progress}%` }} />
          </div>
          <div className="relative flex justify-between">
            {phaseOrder.map((phase) => {
              const done = phaseOrder.indexOf(phase) < currentIndex || project.status === 'completed';
              const active = phase === (project.status === 'pending' ? 'new' : project.status);
              const Icon = phaseIcons[phase];
              return (
                <div key={phase} className="flex flex-col items-center" style={{ width: '20%' }}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 z-10 transition-all ${done ? 'bg-green-500 border-green-500 text-white' : active ? 'bg-primary-600 border-primary-600 text-white' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-300'}`}>
                    <Icon size={18} />
                  </div>
                  <p className="text-[10px] font-bold mt-2 text-center text-gray-700 dark:text-gray-300">{phaseLabels[phase]}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {project.tasks && project.tasks.length > 0 && (
        <div className="bg-white dark:bg-[#151921] rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h4 className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-4">Tarefas e Entregas</h4>
          <div className="space-y-3">
            {project.tasks.map((task: any, i: number) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${task.completed ? 'bg-green-50 dark:bg-green-900/10' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${task.completed ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>
                  {task.completed ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                </div>
                <div className="flex-1 min-w-0"><p className={`text-sm font-bold ${task.completed ? 'text-green-700 dark:text-green-300 line-through' : 'text-gray-900 dark:text-white'}`}>{task.title}</p></div>
                {task.completed && <span className="text-[10px] font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">Feito</span>}
              </div>
            ))}
          </div>
        </div>
      )}
      {project.activity && project.activity.length > 0 && (
        <div className="bg-white dark:bg-[#151921] rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h4 className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-4 flex items-center gap-2"><Activity size={16} /> Atividade</h4>
          <div className="space-y-4 relative pl-4">
            <div className="absolute top-2 left-[11px] bottom-2 w-px bg-gray-100 dark:bg-gray-800" />
            {project.activity.slice(0, 8).map((log: any, i: number) => (
              <div key={log.id || i} className="flex gap-3 relative">
                <div className={`w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#151921] shrink-0 mt-1.5 z-10 ${log.type === 'success' ? 'bg-green-500' : log.type === 'alert' ? 'bg-red-500' : 'bg-primary-500'}`} />
                <div><p className="text-sm text-gray-700 dark:text-gray-300">{log.text}</p><p className="text-[10px] text-gray-400 mt-0.5">{log.date}</p></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── MESSAGE CENTER ───
const MessageCenter: React.FC<{ project: any }> = ({ project }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [subject, setSubject] = useState('');
  const botRef = React.useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    try { setLoading(true); const res = await api.client.getMessages(project.id); setMessages(res.data.messages || []); }
    catch (e) { setMessages([]); } finally { setLoading(false); }
  }, [project.id]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  useEffect(() => {
    if (botRef.current) botRef.current.scrollTop = botRef.current.scrollHeight;
  }, [messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault(); if (!newMsg.trim()) return;
    setSending(true);
    try {
      const res = await api.client.sendMessage(project.id, { message: newMsg.trim(), subject: subject || project.projectName });
      setMessages(prev => [...prev, res.data.message]); setNewMsg(''); setSubject('');
    } catch (err: any) { console.error('Send message error:', err); } finally { setSending(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h3 className="text-lg font-bold text-gray-900 dark:text-white">Central de Mensagens</h3><p className="text-sm text-gray-500">Envie e receba mensagens sobre seu projeto</p></div>
        <button onClick={loadMessages} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400"><RefreshCw size={16} /></button>
      </div>
      <div className="bg-white dark:bg-[#151921] rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden" style={{ height: '500px' }}>
        <div ref={botRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {loading ? <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-primary-600" /></div>
            : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <MessageSquare size={48} className="mb-3 opacity-30" /><p className="text-sm">Nenhuma mensagem</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <motion.div key={msg.id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.from === 'client' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${msg.from === 'client' ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-gray-100 dark:bg-[#1A1D24] dark:text-gray-200 rounded-bl-sm'}`}>
                    {msg.subject && msg.id?.startsWith('msg_') && <p className="text-[10px] font-bold mb-0.5 text-primary-200">{msg.subject}</p>}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    <p className="text-[10px] mt-0.5 text-primary-200">{new Date(msg.date).toLocaleString('pt-BR')}</p>
                  </div>
                </motion.div>
              ))
            )
          }
        </div>
        <form onSubmit={handleSend} className="border-t border-gray-100 dark:border-gray-800 p-3 space-y-2 bg-gray-50/50 dark:bg-gray-800/30">
          <input type="text" placeholder="Assunto (opcional)" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full bg-white dark:bg-[#0F1115] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary-500 dark:text-white" />
          <div className="flex gap-2">
            <textarea value={newMsg} onChange={(e) => setNewMsg(e.target.value)} placeholder="Sua mensagem..." rows={2} className="flex-1 bg-white dark:bg-[#0F1115] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none resize-none focus:ring-1 focus:ring-primary-500 dark:text-white" />
            <Button type="submit" size="sm" isLoading={sending} className="self-end shrink-0" rightIcon={<Send size={14} />}>Enviar</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── FILES VIEW ───
const FilesView: React.FC<{ project: any }> = ({ project }) => {
  const links = project.links || {};
  const files = project.files || [];

  return (
    <div className="space-y-8">
      <div><h3 className="text-lg font-bold text-gray-900 dark:text-white">Links & Arquivos</h3><p className="text-sm text-gray-500">Downloads e acessos rapidos do projeto</p></div>
      {Object.keys(links).length > 0 && (
        <div className="bg-white dark:bg-[#151921] rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h4 className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-4">Links Rapidos</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(links).map(([key, url]) => {
              const iconMap: Record<string, any> = { figma: Layout, drive: Globe, github: Code2, notion: FileText };
              const Icon = iconMap[key] || ExternalLink;
              return (
                <a key={key} href={url as string} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-800 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all group">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center"><Icon size={20} /></div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-bold text-gray-900 dark:text-white capitalize">{key}</p><p className="text-[10px] text-gray-400 truncate">{url as string}</p></div>
                  <ExternalLink size={14} className="text-gray-300 group-hover:text-primary-600 shrink-0" />
                </a>
              );
            })}
          </div>
        </div>
      )}
      {(project.contract?.status === 'signed' || project.contract?.status === 'sent_to_client') && (
        <div className="bg-white dark:bg-[#151921] rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h4 className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-4">Documentos</h4>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center"><PenTool size={20}/></div>
            <div className="flex-1"><p className="text-sm font-bold text-gray-900 dark:text-white">Contrato de Servico</p><p className="text-[10px] text-orange-600">{project.contract.status === 'signed' ? 'Assinado' : 'Pendente'}</p></div>
          </div>
        </div>
      )}
      <div className="bg-white dark:bg-[#151921] rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h4 className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-4">Arquivos</h4>
        {files.length === 0 ? (
          <div className="text-center py-12 text-gray-400"><Download size={32} className="mx-auto mb-3 opacity-30" /><p className="text-sm">Nenhum arquivo disponivel</p></div>
        ) : (
          <div className="space-y-2">
            {files.map((file: any, i: number) => (
              <div key={file.id || i} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center shrink-0"><FileText size={20}/></div>
                <div className="flex-1 min-w-0"><p className="text-sm font-bold text-gray-900 dark:text-white truncate">{file.name}</p><p className="text-[10px] text-gray-400">{file.size || '-'}</p></div>
                {file.url && <a href={file.url} target="_blank" rel="noopener noreferrer"><Download size={16} className="text-gray-400 hover:text-primary-600" /></a>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── BRIEFING VIEW ───
const BriefingView: React.FC<{ project: any }> = ({ project }) => {
  const b = project.briefing;
  if (!b || Object.keys(b).length === 0) {
    return (
      <div className="space-y-8">
        <div><h3 className="text-lg font-bold text-gray-900 dark:text-white">Briefing</h3><p className="text-sm text-gray-500">Resumo do escopo</p></div>
        <div className="bg-white dark:bg-[#151921] rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center"><ClipboardList size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-700" /><h4 className="text-lg font-bold text-gray-900 dark:text-white">Nenhum briefing registrado</h4><p className="text-sm text-gray-500 mt-2">Preenchido durante o inicio do projeto</p></div>
      </div>
    );
  }
  const sections = Object.entries(b).filter(([_, v]) => v && typeof v !== 'object' && String(v).length > 0);
  return (
    <div className="space-y-8">
      <div><h3 className="text-lg font-bold text-gray-900 dark:text-white">Briefing</h3><p className="text-sm text-gray-500">Resumo do escopo</p></div>
      <div className="bg-white dark:bg-[#151921] rounded-2xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
        {sections.map(([key, value]) => (
          <div key={key} className="p-5"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{key.replace(/([A-Z])/g, ' $1')}</p><p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{String(value)}</p></div>
        ))}
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───
export const ClientPortal: React.FC<ClientPortalProps> = ({ onLogout, onNavigate, isAdmin }) => {
  const { getProject, currentProjectId, markNotificationsAsRead, updateProject, sendNotification } = useProject();
  const project = getProject(currentProjectId);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<PortalTab>('overview');
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (ev: MouseEvent) => { if (notifRef.current && !notifRef.current.contains(ev.target as Node)) setIsNotifOpen(false); };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);

  const doContractUpdate = async (cd: ContractData) => {
    if (!project) return;
    try {
      await api.contract.update(parseInt(project.id), { ...(project.contract || {}), ...cd });
      // Update local state
      updateProject(project.id, { contract: { ...(project.contract || {}), ...cd, lastUpdate: 'Contrato Assinado' } });
      if (cd.status === 'signed') {
        sendNotification(project.id, { title: 'Contrato Finalizado', message: 'Contrato assinado com sucesso.', type: 'success' });
      }
    } catch (err: any) {
      console.error('Erro ao atualizar contrato:', err);
      alert('Erro ao atualizar contrato: ' + err.message);
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0B0D12] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#151921] p-8 rounded-3xl shadow-xl max-w-md w-full border border-gray-100 dark:border-gray-800 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6"><Briefcase size={32} className="text-gray-400" /></div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Nenhum Projeto</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Nao ha projetos vinculados a sua conta.</p>
          <Button onClick={onLogout} className="w-full justify-center mb-3"><LogOut size={16} className="mr-2"/> Sair</Button>
          <button onClick={() => onNavigate('home')} className="flex items-center justify-center gap-2 w-full py-2 text-sm text-gray-500 hover:text-gray-700"><Home size={14} /> Voltar ao site</button>
          {isAdmin && <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800"><button onClick={() => onNavigate('admin-dashboard')} className="w-full py-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl text-xs font-bold"><ShieldCheck size={14} className="mr-1" inline/> Admin</button></div>}
        </div>
      </div>
    );
  }

  if (project.paymentOrder && project.paymentOrder.status === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0B0D12] font-sans flex flex-col">
        <header className="bg-white dark:bg-[#151921] border-b border-gray-200 dark:border-gray-800 p-4 flex justify-between items-center">
          <div className="flex items-center gap-2"><div className="bg-primary-600 text-white p-2 rounded-lg"><Briefcase size={20} /></div><span className="font-bold text-gray-900 dark:text-white">Pagamento Pendente</span></div>
          <button onClick={onLogout} className="text-sm text-gray-500 hover:text-red-500">Sair</button>
        </header>
        <div className="flex-1 flex items-center justify-center p-4"><CheckoutScreen order={project.paymentOrder} /></div>
      </div>
    );
  }

  const notifications = project.notifications || [];
  const unreadCount = notifications.filter((n: any) => !n.read).length;
  const handleMarkRead = () => markNotificationsAsRead(project.id);
  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const statusLabels: Record<string, string> = { new: 'Aguardando Inicio', briefing: 'Fase de Briefing', development: 'Em Desenvolvimento', review: 'Em Revisao', completed: 'Projeto Concluido', pending: 'Aguardando Inicio' };
  const notifIcons: Record<string, React.ReactNode> = {
    success: <CheckCircle2 size={16} className="text-green-500"/>,
    warning: <AlertTriangle size={16} className="text-orange-500"/>,
    payment: <CreditCard size={16} className="text-blue-500"/>,
  };
  const defaultNotifIcon = <Info size={16} className="text-gray-500"/>;
  const pendingContract = project.contract && (project.contract.status === 'sent_to_client' || project.contract.status === 'draft');
  const pct = project.financial.total > 0 ? Math.round((project.financial.paid / project.financial.total) * 100) : 0;

  const tabs: { id: PortalTab; label: string; icon: React.FC<any> }[] = [
    { id: 'overview', label: 'Visao Geral', icon: Zap },
    { id: 'timeline', label: 'Cronograma', icon: Calendar },
    { id: 'messages', label: 'Mensagens', icon: MessageSquare },
    { id: 'files', label: 'Arquivos', icon: FileText },
    { id: 'briefing', label: 'Briefing', icon: ClipboardList },
  ];
  if (project.contract && Object.keys(project.contract).length > 0) {
    tabs.splice(4, 0, { id: 'contract', label: 'Contrato', icon: ShieldCheck });
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0D12] font-sans">
      <ClientSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} userEmail={project.email} userName={project.clientName} />
      <AnimatePresence>{isContractOpen && <ContractGeneratorModal project={project} onClose={() => setIsContractOpen(false)} userRole="client" onContractUpdate={doContractUpdate} />}</AnimatePresence>

      {isAdmin && (
        <div className="bg-indigo-600 text-white px-4 py-2 text-xs font-bold flex justify-between items-center sticky top-0 z-50 shadow-md">
          <span className="flex items-center gap-2"><ShieldCheck size={14}/> Modo Admin</span>
          <button onClick={() => onNavigate('admin-dashboard')} className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full">Voltar ao Painel</button>
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-[#151921] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 text-white p-2 rounded-xl shadow-lg shadow-primary-600/20"><Briefcase size={20} /></div>
            <div><h1 className="text-lg font-bold text-gray-900 dark:text-white">{project.projectName}</h1><p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">{statusLabels[project.status] || project.status}</p></div>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative" ref={notifRef}>
              <button onClick={() => setIsNotifOpen(!isNotifOpen)} className={`relative p-2 rounded-full transition-colors ${isNotifOpen ? 'bg-gray-100 dark:bg-gray-800 text-primary-600' : 'text-gray-400 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                <Bell size={20} />
                {unreadCount > 0 && <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-[#151921]" />}
              </button>
              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#1A1D24] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white">Notificacoes</h3>
                      {unreadCount > 0 && <button onClick={handleMarkRead} className="text-[10px] text-primary-600 hover:underline font-medium">Marcar lidas</button>}
                    </div>
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                      {notifications.length > 0 ? notifications.map((note: any) => (
                        <div key={note.id} className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${!note.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : 'border-b border-gray-50 dark:border-gray-800/50'}`}>
                          <div className="flex gap-3">
                            <div className="mt-0.5 shrink-0">{notifIcons[note.type] || defaultNotifIcon}</div>
                            <div className="flex-1">
                              <p className="text-xs font-bold text-gray-900 dark:text-white">{note.title}</p>
                              <p className="text-[11px] text-gray-500 mt-0.5">{note.message}</p>
                              <p className="text-[10px] text-gray-400 mt-1">{note.date}</p>
                            </div>
                          </div>
                        </div>
                      )) : <div className="p-8 text-center text-gray-400 text-xs">Nada por aqui</div>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block"><p className="text-sm font-bold text-gray-900 dark:text-white">{project.clientName}</p><p className="text-xs text-gray-500">{project.email}</p></div>
              <button onClick={() => setIsSettingsOpen(true)} className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-300 border-2 border-white dark:border-gray-600 shadow-sm hover:border-primary-500 transition-colors"><User size={18} /></button>
              <button onClick={onLogout} className="text-gray-400 hover:text-red-500 transition-colors" title="Sair"><LogOut size={20} /></button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-8 py-8">
        {pendingContract && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl text-orange-600"><PenTool size={24} /></div>
              <div><h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Contrato Disponivel</h3><p className="text-sm text-gray-600 dark:text-gray-300">Revise e assine para formalizarmos a parceria.</p></div>
            </div>
            <Button onClick={() => { setActiveTab('contract'); setIsContractOpen(true); }} className="bg-orange-600 hover:bg-orange-700 text-white">Assinar Contrato</Button>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Progresso', value: `${project.progress}%`, Icon: CheckCircle2, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
            { label: 'Pago', value: `${pct}%`, Icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
            { label: 'Entrega', value: project.dueDate || 'A definir', Icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Alertas', value: String(unreadCount), Icon: Bell, color: unreadCount > 0 ? 'text-orange-600' : 'text-gray-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white dark:bg-[#151921] rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${s.bg} ${s.color} flex items-center justify-center`}><s.Icon size={20} /></div>
              <div><p className="text-[10px] font-bold text-gray-400 uppercase">{s.label}</p><p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</p></div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white dark:bg-[#151921] rounded-2xl border border-gray-200 dark:border-gray-800 p-1.5 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 whitespace-nowrap ${activeTab === tab.id ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              <tab.icon size={16} /> {tab.label}
              {tab.id === 'messages' && (project.messages || []).length > 0 && <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>{(project.messages || []).length}</span>}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Hero Progress */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#151921] rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10"><Zap size={120} className="text-primary-500" /></div>
              <div className="relative z-10">
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${project.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : project.status === 'development' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-primary-50 text-primary-700 border-primary-200'}`}>
                  {statusLabels[project.status]}
                </span>
                <h3 className="text-4xl font-bold text-gray-900 dark:text-white mt-4 mb-2">{project.progress}% <span className="text-lg text-gray-400 font-normal">Concluido</span></h3>
                <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-4">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${project.progress}%` }} transition={{ duration: 1 }} className="h-full bg-gradient-to-r from-primary-500 to-indigo-600" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300"><strong>Proximo Marco:</strong> {project.nextMilestone}</p>
                {project.previewUrl && <a href={project.previewUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700"><ExternalLink size={14} /> Ver Preview</a>}
              </div>
            </motion.div>

            {/* Financial + Checklist */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-[#151921] rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center gap-2 mb-6"><div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600"><CreditCard size={20} /></div><h3 className="font-bold text-gray-900 dark:text-white">Financeiro</h3></div>
                <div className="space-y-4">
                  <p className="text-xs text-gray-500 uppercase font-bold">Valor Total</p>
                  <p className="text-2xl font-mono font-bold text-gray-900 dark:text-white">{formatCurrency(project.financial.total)}</p>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">Pago ({pct}%)</span><span className="text-green-600 font-bold">{formatCurrency(project.financial.paid)}</span></div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} /></div>
                  </div>
                  {project.financial.status !== 'paid' && <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 dark:bg-orange-900/10 p-3 rounded-xl"><Clock size={14} className="shrink-0"/> Restante: <strong>{formatCurrency(project.financial.total - project.financial.paid)}</strong></div>}
                  {project.financial.status === 'paid' && <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 dark:bg-green-900/10 p-3 rounded-xl font-bold"><ShieldCheck size={14} /> Quitado</div>}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="lg:col-span-2 bg-white dark:bg-[#151921] rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><CheckCircle2 size={20} className="text-primary-600"/> Entregas</h3>
                {project.tasks && project.tasks.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {project.tasks.map((task: any) => (
                      <div key={task.id || task.title} className={`flex items-center gap-3 p-3 rounded-xl border ${task.completed ? 'bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-900/30' : 'bg-gray-50 border-gray-100 dark:bg-gray-800 dark:border-gray-700'}`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 ${task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                          {task.completed && <Check size={10} />}
                        </div>
                        <span className={`text-sm ${task.completed ? 'text-green-800 dark:text-green-200 line-through' : 'text-gray-700 dark:text-gray-300'}`}>{task.title}</span>
                      </div>
                    ))}
                  </div>
                ) : <div className="text-center py-8 text-gray-400"><ClipboardList size={32} className="mx-auto mb-2 opacity-30" /><p className="text-sm">Entregas serao definidas em breve</p></div>}
              </motion.div>
            </div>

            {/* Activity + Quick Links */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-[#151921] rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Activity size={18}/> Atividade</h3>
                {project.activity && project.activity.length > 0 ? (
                  <div className="space-y-4 relative pl-4">
                    <div className="absolute top-2 left-[11px] bottom-2 w-px bg-gray-100 dark:bg-gray-800" />
                    {project.activity.slice(0, 6).map((log: any, i: number) => (
                      <div key={log.id || i} className="flex gap-3 relative">
                        <div className={`w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#151921] shrink-0 mt-1.5 z-10 ${log.type === 'success' ? 'bg-green-500' : log.type === 'alert' ? 'bg-red-500' : 'bg-primary-500'}`} />
                        <div><p className="text-xs text-gray-700 dark:text-gray-300">{log.text}</p><p className="text-[10px] text-gray-400 mt-0.5">{log.date}</p></div>
                      </div>
                    ))}
                  </div>
                ) : <div className="text-center py-8 text-gray-400 text-xs">Atividades aparecerarao aqui</div>}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white dark:bg-[#151921] rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><FileText size={18}/> Links & Docs</h3>
                <div className="space-y-3">
                  {Object.entries(project.links || {}).length > 0 ? Object.entries(project.links || {}).map(([key, url]) => (
                    <a key={key} href={url as string} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center shrink-0"><ExternalLink size={16} /></div>
                      <div className="flex-1 min-w-0"><p className="text-sm font-bold text-gray-900 dark:text-white capitalize">{key}</p><p className="text-[10px] text-gray-400 truncate">{url as string}</p></div>
                    </a>
                  )) : <div className="text-center py-4 text-gray-400 text-xs">Nenhum link registrado</div>}
                  {(project.contract?.status === 'signed' || project.contract?.status === 'sent_to_client') && (
                    <button onClick={() => { setActiveTab('contract'); setIsContractOpen(true); }} className="flex w-full items-center gap-3 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/10 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center shrink-0"><PenTool size={16} /></div>
                      <div className="text-left"><p className="text-sm font-bold text-gray-900 dark:text-white">Contrato</p><p className="text-[10px] text-orange-600">{project.contract.status === 'signed' ? 'Assinado' : 'Pendente'}</p></div>
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'timeline' && <TimelineView project={project} />}
        {activeTab === 'messages' && <MessageCenter project={project} />}
        {activeTab === 'files' && <FilesView project={project} />}
        {activeTab === 'briefing' && <BriefingView project={project} />}
        {activeTab === 'contract' && (
          <div className="space-y-8">
            <div><h3 className="text-lg font-bold text-gray-900 dark:text-white">Contrato</h3><p className="text-sm text-gray-500">Documento legal do seu projeto</p></div>
            <div className="bg-white dark:bg-[#151921] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 text-center">
              <ShieldCheck size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-700" />
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Contrato de Servico</h4>
              <p className="text-sm text-gray-500 mb-6">
                {project.contract?.status === 'signed' ? 'Contrato assinado por ambas as partes.' : 'Aguardando assinatura.'}
              </p>
              <Button onClick={() => setIsContractOpen(true)} rightIcon={<PenTool size={16} />}>
                Ver e Assinar Contrato
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
