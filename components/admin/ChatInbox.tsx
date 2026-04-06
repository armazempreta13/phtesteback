import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Clock, Check, Eye, Search, UserPlus } from 'lucide-react';
import { api } from '../../lib/api';

interface ChatMessage {
  id: number;
  name: string;
  email: string;
  budget_data: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  admin_reply: string;
  created_at: string;
  updated_at: string;
}

export const ChatInbox: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ChatMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'replied'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await api.request<{ success: boolean; messages: ChatMessage[]; total: number }>(
        `/chat/messages${filter !== 'all' ? `?status=${filter}` : ''}`
      );
      setMessages(res.messages);
    } catch (e: any) {
      console.error('Failed to fetch chat messages:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, [filter]);

  const handleReply = async () => {
    if (!selected || !replyText.trim()) return;
    try {
      setSending(true);
      const res = await api.request<{ success: boolean; message: ChatMessage }>(
        `/chat/messages/${selected.id}/reply`,
        { method: 'PUT', body: JSON.stringify({ admin_reply: replyText }) }
      );
      setMessages(prev => prev.map(m => m.id === selected.id ? res.message : m));
      setSelected(res.message);
      setReplyText('');
    } catch (e) {
      console.error('Failed to send reply:', e);
    } finally {
      setSending(false);
    }
  };

  const handleCreateProject = async () => {
    if (!selected?.name) return;
    const bData = selected.budget_data ? JSON.parse(selected.budget_data) : null;
    try {
      await api.projects.create({
        client_name: selected.name,
        client_email: selected.email || '',
        client_cpf: '',
        title: `Projeto: ${bData?.projectType || 'Novo projeto'}`,
        financial_total: 0,
        financial_paid: 0,
        financial_status: 'pending',
        status: 'pending',
        progress: 0,
        briefing: selected.budget_data,
      });
      alert('Projeto criado com sucesso!');
      await fetchMessages();
      setSelected(null);
    } catch (e: any) {
      alert('Erro ao criar projeto: ' + e.message);
    }
  };

  const handleSelect = (msg: ChatMessage) => {
    setSelected(msg);
    if (msg.status === 'unread') {
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'read' as const } : m));
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  const filtered = messages.filter(m => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return m.name?.toLowerCase().includes(term) || m.message?.toLowerCase().includes(term) || m.email?.toLowerCase().includes(term);
  });

  const budgetData = selected?.budget_data ? JSON.parse(selected.budget_data) : null;

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4">
      {/* Message List */}
      <div className="w-80 bg-white dark:bg-[#151921] rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare size={18} className="text-primary-600" />
              Mensagens
            </h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar..."
              className="w-full text-sm bg-gray-100 dark:bg-gray-800 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500 text-gray-900 dark:text-white placeholder-gray-500"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(['all', 'unread', 'replied'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
                  filter === f ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {f === 'all' ? 'Todas' : f === 'unread' ? 'N\xe3o lidas' : 'Respondidas'}
              </button>
            ))}
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">Carregando...</div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <MessageSquare size={24} className="mb-2 opacity-50" />
              <p className="text-sm">Nenhuma mensagem</p>
            </div>
          )}
          {filtered.map(msg => (
            <button
              key={msg.id}
              onClick={() => handleSelect(msg)}
              className={`w-full text-left p-3 border-b border-gray-100 dark:border-gray-800 transition-colors cursor-pointer ${
                selected?.id === msg.id
                  ? 'bg-primary-50 dark:bg-primary-900/20'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
              } ${msg.status === 'unread' ? 'border-l-2 border-l-primary-500' : ''}`}
            >
              <div className="flex items-start justify-between mb-1">
                <span className={`text-sm font-semibold truncate ${msg.status === 'unread' ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {msg.name || 'An\xf4nimo'}
                </span>
                <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">{formatDate(msg.created_at)}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{msg.message}</p>
              <div className="flex items-center gap-2 mt-1">
                {msg.status === 'unread' && <Clock size={10} className="text-amber-500" />}
                {msg.status === 'read' && <Eye size={10} className="text-blue-500" />}
                {msg.status === 'replied' && <Check size={10} className="text-green-500" />}
                <span className={`text-[10px] ${msg.status === 'unread' ? 'text-amber-500' : msg.status === 'read' ? 'text-blue-500' : 'text-green-500'}`}>
                  {msg.status === 'unread' ? 'N\xe3o lida' : msg.status === 'read' ? 'Lida' : 'Respondida'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Message Detail / Reply */}
      <div className="flex-1 bg-white dark:bg-[#151921] rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
        {selected ? (
          <>
            {/* Message Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{selected.name || 'An\xf4nimo'}</h3>
                  {selected.email && <p className="text-xs text-gray-500">{selected.email}</p>}
                </div>
                <span className="text-xs text-gray-400">{formatDate(selected.created_at)}</span>
              </div>
            </div>

            {/* Message Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Client Message */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{selected.message}</p>
              </div>

              {/* Budget Data */}
              {budgetData && (
                <div className="bg-primary-50/50 dark:bg-primary-900/10 rounded-xl p-4 border border-primary-100 dark:border-primary-800/30">
                  <h4 className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2">Dados do Or\xe7amento</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {budgetData.projectType && <div><span className="text-gray-500">Tipo:</span> <span className="text-gray-900 dark:text-white">{budgetData.projectType}</span></div>}
                    {budgetData.designStatus && <div><span className="text-gray-500">Design:</span> <span className="text-gray-900 dark:text-white">{budgetData.designStatus}</span></div>}
                    {budgetData.budgetRange && <div><span className="text-gray-500">Or\xe7amento:</span> <span className="text-gray-900 dark:text-white">{budgetData.budgetRange}</span></div>}
                    {budgetData.timeline && <div><span className="text-gray-500">Prazo:</span> <span className="text-gray-900 dark:text-white">{budgetData.timeline}</span></div>}
                    {budgetData.targetAudience && <div><span className="text-gray-500">P\xfablico:</span> <span className="text-gray-900 dark:text-white">{budgetData.targetAudience}</span></div>}
                  </div>
                </div>
              )}

              {/* Admin Reply (if exists) */}
              {selected.admin_reply && (
                <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-4 border border-green-100 dark:border-green-800/30">
                  <h4 className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Check size={12} /> Sua Resposta
                  </h4>
                  <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{selected.admin_reply}</p>
                </div>
              )}
            </div>

            {/* Reply Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex gap-2">
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Escreva sua resposta..."
                  className="flex-1 text-sm bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-1 focus:ring-primary-500 text-gray-900 dark:text-white placeholder-gray-500 max-h-32"
                  rows={3}
                />
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim() || sending}
                  className="self-end bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl p-3 transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageSquare size={48} className="mb-4 opacity-30" />
            <p className="text-sm">Selecione uma mensagem para visualizar</p>
            <p className="text-xs mt-1 text-gray-500">As mensagens do chatbot aparecem aqui</p>
          </div>
        )}
      </div>
    </div>
  );
};
