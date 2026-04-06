
import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign, Users, MessageSquare, BarChart3, PieChart, Activity,
  AlertCircle, Inbox, FileText, Loader2, TrendingUp, MousePointer,
  Eye, Bot, Target, ArrowUpRight, ArrowDownRight, Zap, ExternalLink,
  RefreshCw, Briefcase, CheckCircle2, Clock, CreditCard, FileCheck
} from 'lucide-react';
import { api } from '../../lib/api';

export const Overview: React.FC = () => {
  const [statsData, setStatsData] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [daysFilter, setDaysFilter] = useState(30);

  const loadAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const statsRes = await api.admin.getStats();
      setStatsData(statsRes.data);
    } catch (err: any) {
      console.error('Overview stats error:', err);
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, [daysFilter]);

  // Load analytics separately - won't break dashboard if endpoint is unavailable
  useEffect(() => {
    api.admin.getAnalytics(daysFilter)
      .then(res => setAnalyticsData(res.data))
      .catch(() => { /* silently fail - analytics may not be available */ });
  }, [daysFilter]);

  // ─── MINI CHART: Sparkline ───
  const Sparkline: React.FC<{ data: number[]; color: string; height?: number }> = ({ data, color, height = 32 }) => {
    if (data.length < 2) return null;
    const max = Math.max(...data, 1);
    const w = 120;
    const points = data.map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = height - (v / max) * (height - 4);
      return `${x},${y}`;
    }).join(' ');
    const areaPoints = `0,${height} ${points} ${w},${height}`;
    return (
      <svg width={w} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill={`url(#grad-${color})`} />
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);
  const fmtCompact = (v: number) => new Intl.NumberFormat('pt-BR', { notation: 'compact', compactDisplay: 'short' }).format(v);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin mx-auto text-primary-600 mb-3" />
          <p className="text-sm text-gray-500">Carregando dados do dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle size={32} className="mx-auto text-red-500 mb-3" />
          <p className="text-sm text-gray-500 mb-3">{error}</p>
          <button onClick={loadAll} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700">Tentar Novamente</button>
        </div>
      </div>
    );
  }

  const t = analyticsData?.traffic || {};
  const p = analyticsData?.pipeline || {};
  const s = statsData?.stats || {};
  const a = statsData?.alerts || {};
  const dailyVisits = analyticsData?.dailyVisits || [];
  const topPages = analyticsData?.topPages || [];
  const topReferrers = analyticsData?.topReferrers || [];
  const dailyChats = analyticsData?.dailyChats || [];
  const statusBreakdown = statsData?.statusBreakdown || [];
  const recentMessages = statsData?.recentMessages || [];
  const recentTransactions = statsData?.recentTransactions || [];

  const STATUS_LABELS: Record<string, string> = {
    'new': 'Novo Lead', 'briefing': 'Briefing', 'development': 'Em Producao',
    'review': 'Revisao', 'completed': 'Concluido', 'pending': 'Pendente',
  };
  const STATUS_COLORS: Record<string, string> = {
    'new': 'bg-gray-400', 'briefing': 'bg-blue-500', 'development': 'bg-purple-500',
    'review': 'bg-orange-500', 'completed': 'bg-green-500', 'pending': 'bg-yellow-500',
  };

  // Build daily chart data (fill missing days with 0)
  const visitDays: number[] = [];
  const chatDays: number[] = [];
  const totalDays = daysFilter;
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const dv = dailyVisits.find((v: any) => v.date === key);
    const dc = dailyChats.find((v: any) => v.date === key);
    visitDays.push(dv?.count || 0);
    chatDays.push(dc?.opens || 0);
  }

  const visitTrendUp = visitDays.length >= 2 ? visitDays[visitDays.length - 1] >= visitDays[visitDays.length - 2] : true;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Visao Geral</h2>
          <p className="text-sm text-gray-500">Metricas e analise em tempo real do negocio</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadAll} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-600" title="Atualizar">
            <RefreshCw size={16} />
          </button>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            {[7, 30, 90].map(d => (
              <button key={d} onClick={() => setDaysFilter(d)} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${daysFilter === d ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {d}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards Row 1: Traffic & Traffic Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Visits */}
        <div className="bg-white dark:bg-[#151921] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl"><Eye size={20} className="text-blue-600" /></div>
            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${visitTrendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {visitTrendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {t.visitsInPeriod || 0}
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{fmtCompact(t.totalVisits || 0)}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total de Visitas</p>
          <div className="mt-3 -mb-1">
            <Sparkline data={visitDays} color="#3b82f6" />
          </div>
        </div>

        {/* Chat Conversations */}
        <div className="bg-white dark:bg-[#151921] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-violet-50 dark:bg-violet-900/20 rounded-xl"><Bot size={20} className="text-violet-600" /></div>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-violet-50 text-violet-600">{t.chatsInPeriod || 0}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{fmtCompact(t.chatOpens || 0)}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Chatbot Conversas</p>
          <div className="mt-3 -mb-1">
            <Sparkline data={chatDays} color="#8b5cf6" />
          </div>
        </div>

        {/* Contacts / Leads */}
        <div className="bg-white dark:bg-[#151921] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-green-50 dark:bg-green-900/20 rounded-xl"><Users size={20} className="text-green-600" /></div>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${t.contactsInPeriod > 0 ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'}`}>
              {t.contactsInPeriod || 0}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{fmtCompact(t.totalClients || 0)}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Clientes Cadastrados</p>
          <div className="mt-3">
            <p className="text-[11px] text-gray-500">
              <span className="font-bold text-green-600">{t.contacts || 0}</span> contatos via formulario
            </p>
            <p className="text-[11px] text-gray-500">
              <span className="font-bold text-blue-600">{t.briefings || 0}</span> briefings recebidos
            </p>
          </div>
        </div>

        {/* Engagement */}
        <div className="bg-white dark:bg-[#151921] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-orange-50 dark:bg-orange-900/20 rounded-xl"><Target size={20} className="text-orange-600" /></div>
            <div className="text-xs font-bold px-2 py-1 rounded-full bg-blue-50 text-blue-600">{p.signedContracts || 0}</div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{t.engagementRate}%</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Taxa de Engajamento</p>
          <div className="mt-3">
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
              <div className="h-full bg-gradient-to-r from-violet-500 to-primary-500 rounded-full transition-all" style={{ width: `${Math.min(t.engagementRate * 2, 100)}%` }} />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Conversas + Contatos / Visitas</p>
          </div>
        </div>
      </div>

      {/* KPI Cards Row 2: Financial & Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Revenue */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 p-6 rounded-2xl border border-green-200 dark:border-green-900/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600"><DollarSign size={20} /></div>
            <div>
              <h3 className="font-bold text-green-800 dark:text-green-300">Receita Total</h3>
              <p className="text-[10px] text-green-600 dark:text-green-400">Confirmada em contratos</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{fmt(p.totalRevenue || 0)}</p>
          <div className="mt-4 flex items-center gap-4 text-xs text-green-700 dark:text-green-300">
            <span className="flex items-center gap-1"><Briefcase size={12} /> {p.totalProjects || 0} projetos</span>
            <span className="flex items-center gap-1"><CheckCircle2 size={12} /> {p.activeProjects || 0} ativos</span>
          </div>
        </div>

        {/* Pipeline Funnel */}
        <div className="bg-white dark:bg-[#151921] p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600"><TrendingUp size={20} /></div>
            <h3 className="font-bold text-gray-900 dark:text-white">Funil de Projetos</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Visitantes', value: t.totalVisits || 0, color: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10' },
              { label: 'Chatbot', value: t.chatOpens || 0, color: 'bg-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/10' },
              { label: 'Clientes', value: t.totalClients || 0, color: 'bg-green-500', bg: 'bg-green-50 dark:bg-green-900/10' },
              { label: 'Contratos Assinados', value: p.signedContracts || 0, color: 'bg-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/10' },
            ].map((item, i) => (
              <div key={i} className={`${item.bg} rounded-xl p-3`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{item.label}</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Status */}
        <div className="bg-white dark:bg-[#151921] p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600"><PieChart size={20} /></div>
            <h3 className="font-bold text-gray-900 dark:text-white">Status dos Projetos</h3>
          </div>
          <div className="space-y-3">
            {statusBreakdown.length > 0 ? statusBreakdown.map((item: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[item.status] || 'bg-gray-500'}`} />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{STATUS_LABELS[item.status] || item.status}</span>
                </div>
                <span className="text-xs font-bold bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-sm">{item.count}</span>
              </div>
            )) : <p className="text-center text-xs text-gray-400 py-8">Nenhum projeto registrado.</p>}
          </div>
        </div>
      </div>

      {/* Alerts Row */}
      {(a.unreadMessages > 0 || a.newBriefings > 0 || a.pendingProjects > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {a.unreadMessages > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 p-4 rounded-xl flex items-center gap-3">
              <Inbox size={20} className="text-yellow-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-yellow-800 dark:text-yellow-300">{a.unreadMessages} mensagens nao lidas</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">Contatos aguardando resposta</p>
              </div>
            </div>
          )}
          {a.newBriefings > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 p-4 rounded-xl flex items-center gap-3">
              <FileCheck size={20} className="text-blue-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-blue-800 dark:text-blue-300">{a.newBriefings} briefings novos</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Briefings aguardando revisao</p>
              </div>
            </div>
          )}
          {a.pendingProjects > 0 && (
            <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-900/30 p-4 rounded-xl flex items-center gap-3">
              <Activity size={20} className="text-purple-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-purple-800 dark:text-purple-300">{a.pendingProjects} projetos pendentes</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">Projetos aguardando acao</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Row: Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Visits Chart */}
        <div className="bg-white dark:bg-[#151921] p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600"><BarChart3 size={18} /></div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Visitas Diarias</h3>
              <p className="text-[10px] text-gray-400">Ultimos {daysFilter} dias</p>
            </div>
          </div>
          {visitDays.some((v: number) => v > 0) ? (
            <Sparkline data={visitDays} color="#3b82f6" height={64} />
          ) : (
            <div className="text-center py-12 text-gray-400 text-xs">Nenhuma visita registrada ainda.<br />Visitas sao rastreadas ao abrir o site.</div>
          )}
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between text-xs text-gray-500">
            <span>Media: {Math.round(visitDays.reduce((a: number, b: number) => a + b, 0) / Math.max(visitDays.filter((v: number) => v > 0).length, 1))}/dia</span>
            <span>Total: {t.visitsInPeriod || 0} no periodo</span>
          </div>
        </div>

        {/* Top Pages */}
        <div className="bg-white dark:bg-[#151921] p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-600"><MousePointer size={18} /></div>
            <h3 className="font-bold text-gray-900 dark:text-white">Paginas Mais Visitadas</h3>
          </div>
          <div className="space-y-3">
            {topPages.length > 0 ? topPages.map((pg: any, i: number) => {
              const maxViews = topPages[0]?.views || 1;
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-600 dark:text-gray-300 capitalize flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-gray-400 w-4">#{i + 1}</span>
                      {pg.path || '/'}
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">{pg.views}</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                    <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${(pg.views / maxViews) * 100}%` }} />
                  </div>
                </div>
              );
            }) : (
              <p className="text-center text-xs text-gray-400 py-8">Sem dados de paginas ainda</p>
            )}
          </div>
          {/* Referrers */}
          {topReferrers.length > 0 && (
            <>
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Origem do Trafego</h4>
                <div className="space-y-2">
                  {topReferrers.map((ref: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 truncate flex-1 pr-2" title={ref.referrer}>{ref.referrer}</span>
                      <span className="font-bold text-gray-900 dark:text-white shrink-0">{ref.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Recent Messages */}
        <div className="bg-white dark:bg-[#151921] p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600"><MessageSquare size={18} /></div>
              <h3 className="font-bold text-gray-900 dark:text-white">Mensagens Recentes</h3>
            </div>
            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">{recentMessages.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 max-h-[320px]">
            <div className="space-y-4 relative pl-2">
              <div className="absolute top-2 left-[11px] bottom-2 w-px bg-gray-100 dark:bg-gray-800" />
              {recentMessages.length > 0 ? recentMessages.map((msg: any, i: number) => (
                <div key={i} className="flex gap-3 relative">
                  <div className="w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#151921] shrink-0 mt-1.5 z-10 bg-primary-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{msg.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-snug truncate">{msg.subject}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">{new Date(msg.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              )) : (
                <p className="text-center text-xs text-gray-400 py-8">Nenhuma mensagem recebida</p>
              )}
            </div>
          </div>
          {/* Recent Transactions mini */}
          {recentTransactions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Transacoes Recentes</h4>
              <div className="space-y-2">
                {recentTransactions.slice(0, 3).map((tx: any, i: number) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <CreditCard size={10} className="text-gray-400" />
                      {tx.type}
                    </span>
                    <span className={`font-bold ${tx.status === 'approved' ? 'text-green-600' : 'text-orange-600'}`}>
                      {fmt(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
