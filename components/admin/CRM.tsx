import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, LayoutDashboard, CheckCircle2, QrCode, Check, Edit, Mail, Users, Loader2, AlertCircle } from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';
import { Button } from '../Button';
import { CreateProjectModal } from '../admin/modals/CreateProjectModal';
import { EditProjectModal } from '../admin/modals/EditProjectModal';
import { ProjectBriefingModal } from '../admin/modals/ProjectBriefingModal';
import { EmailGeneratorModal } from '../EmailGeneratorModal';
import { ContractGeneratorModal } from '../ContractGeneratorModal';
import { ClientProject, ViewType } from '../../types';
import { ClientBriefingPage } from '../ClientBriefingPage';
import { api } from '../../lib/api';

// Map backend project to ClientProject frontend type
function mapBackendProject(row: any): ClientProject {
  // Parse JSON fields
  let contract = {};
  let briefing = {};
  let paymentOrder = null;
  let activity = [];
  let notifications = [];
  let tasks = [];
  let links = {};
  let financial = { total: 0, paid: 0, status: 'pending' as const };

  try { contract = row.contract ? (typeof row.contract === 'string' ? JSON.parse(row.contract) : row.contract) : {}; } catch {}
  try { briefing = row.briefing ? (typeof row.briefing === 'string' ? JSON.parse(row.briefing) : row.briefing) : {}; } catch {}
  try { paymentOrder = row.payment_order ? (typeof row.payment_order === 'string' ? JSON.parse(row.payment_order) : row.payment_order) : null; } catch {}
  try { activity = row.activity ? (typeof row.activity === 'string' ? JSON.parse(row.activity) : row.activity) : []; } catch {}
  try { notifications = row.notifications ? (typeof row.notifications === 'string' ? JSON.parse(row.notifications) : row.notifications) : []; } catch {}
  try { tasks = row.tasks ? (typeof row.tasks === 'string' ? JSON.parse(row.tasks) : row.tasks) : []; } catch {}
  try { links = row.links ? (typeof row.links === 'string' ? JSON.parse(row.links) : row.links) : {}; } catch {}

  financial = {
    total: row.financial_total ?? row.budget ?? 0,
    paid: row.financial_paid ?? 0,
    status: row.financial_status ?? 'pending',
  };

  // Map status
  const statusMap: Record<string, string> = { 'pending': 'new', 'approved': 'development' };
  const status = statusMap[row.status] || row.status || 'new';

  return {
    id: row.id.toString(),
    clientName: row.client_name || 'Cliente',
    cpf: row.client_cpf || '',
    email: row.client_email || '',
    projectName: row.title || 'Sem titulo',
    status: status as any,
    progress: row.progress ?? 0,
    nextMilestone: row.next_milestone || 'Inicio do Projeto',
    dueDate: row.deadline ? new Date(row.deadline).toLocaleDateString('pt-BR') : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
    lastUpdate: new Date(row.updated_at || row.created_at).toLocaleDateString('pt-BR'),
    financial,
    contract: contract as any,
    briefing: briefing as any,
    paymentOrder,
    activity,
    notifications,
    tasks,
    links,
    files: row.files ? (typeof row.files === 'string' ? JSON.parse(row.files) : row.files) : [],
  };
}

interface CRMProps {
    onNavigate: (view: ViewType) => void;
}

export const CRM: React.FC<CRMProps> = ({ onNavigate }) => {
  const { updateProject, createProject, sendNotification } = useProject();

  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ClientProject | null>(null);
  const [briefingProject, setBriefingProject] = useState<ClientProject | null>(null);
  const [emailModalProject, setEmailModalProject] = useState<ClientProject | null>(null);
  const [contractProject, setContractProject] = useState<ClientProject | null>(null);
  const [briefingPreviewType, setBriefingPreviewType] = useState<string | null>(null);

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await api.projects.getAll();
      const rawProjects = res.data?.projects || [];
      setProjects(rawProjects.map(mapBackendProject));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar projetos');
    } finally {
      setLoading(false);
    }
  };

  const getServiceTypeFromProject = (project: ClientProject) => {
      const name = project.projectName.toLowerCase();
      if (name.includes('landing') || name.includes('express')) return 'landing-page';
      if (name.includes('site') || name.includes('institucional')) return 'business';
      return 'custom';
  };

  const handleCreateProject = async (data: { clientName: string; cpf?: string; email: string; projectName: string; totalValue: number }) => {
    try {
      await api.projects.create({
        client_name: data.clientName,
        client_email: data.email,
        client_cpf: data.cpf || '',
        title: data.projectName,
        financial_total: data.totalValue,
        financial_paid: 0,
        financial_status: 'pending',
        status: 'pending',
        progress: 0,
      });
      await loadProjects();
      setIsCreateModalOpen(false);
    } catch (err: any) {
      alert('Erro ao criar projeto: ' + err.message);
    }
  };

  const handleEditSave = async (id: string, data: Partial<ClientProject>, notify: boolean, emailMsg?: string) => {
    try {
      const updatePayload: any = {};
      if (data.clientName) updatePayload.client_name = data.clientName;
      if (data.projectName) updatePayload.title = data.projectName;
      if (data.email) updatePayload.client_email = data.email;
      if (data.status) updatePayload.status = data.status === 'new' ? 'pending' : data.status;
      if (typeof data.progress === 'number') updatePayload.progress = data.progress;
      if (data.nextMilestone) updatePayload.next_milestone = data.nextMilestone;
      if (data.dueDate) updatePayload.deadline = data.dueDate;
      if (data.financial) {
        updatePayload.financial_total = data.financial.total;
        updatePayload.financial_paid = data.financial.paid;
        updatePayload.financial_status = data.financial.status;
      }
      if (data.contract) updatePayload.contract = data.contract;
      if (data.briefing) updatePayload.briefing = data.briefing;
      if (data.paymentOrder !== undefined) updatePayload.payment_order = data.paymentOrder;
      if (data.activity) updatePayload.activity = data.activity;
      if (data.notifications) updatePayload.notifications = data.notifications;
      if (data.tasks) updatePayload.tasks = data.tasks;
      if (data.links) updatePayload.links = data.links;

      await api.projects.update(parseInt(id), updatePayload);
      setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data, lastUpdate: new Date().toLocaleDateString('pt-BR') } : p));

      if (notify && emailMsg && editingProject) {
        sendNotification(id, { title: 'Projeto Atualizado', message: emailMsg, type: 'info' });
      }
    } catch (err: any) {
      alert('Erro ao atualizar: ' + err.message);
    }
  };

  const handleBriefingSave = (id: string, data: Partial<ClientProject>) => {
    handleEditSave(id, data, false);
  };

  const handleApprovePayment = async (project: ClientProject) => {
    if (!project.paymentOrder) return;
    const newPaid = project.financial.paid + project.paymentOrder.amount;
    const isTotal = newPaid >= project.financial.total;
    await api.projects.update(parseInt(project.id), {
      payment_order: null,
      financial_total: project.financial.total,
      financial_paid: newPaid,
      financial_status: isTotal ? 'paid' : 'partial',
    });
    await loadProjects();
  };

  const handleGenerateContract = async (project: ClientProject) => {
    try {
      await api.contract.generate(parseInt(project.id));
      const res = await api.projects.getAll();
      const rawProjects = res.data?.projects || [];
      const updatedRaw = rawProjects.find((p: any) => p.id === project.id);
      if (updatedRaw) {
        setContractProject(mapBackendProject(updatedRaw));
      }
    } catch (err: any) {
      alert('Erro ao gerar contrato: ' + err.message);
    }
  };

  const handleGeneratePayment = async (project: ClientProject, type: 'signal' | 'final') => {
    const amount = type === 'signal' ? (project.financial.total / 2) : (project.financial.total - project.financial.paid);
    const mockOrder = {
      id: `tx_${Date.now()}`,
      description: type === 'signal' ? `Sinal de 50% - ${project.projectName}` : `Parcela Final - ${project.projectName}`,
      amount,
      status: 'pending',
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      pixCode: "00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5913PH Development6008Brasilia62070503***6304ABCD",
    };
    await api.projects.update(parseInt(project.id), { payment_order: mockOrder });
    await loadProjects();
  };

  const handleContractUpdate = async (contractData: any) => {
    if (!contractProject) return;
    try {
      await api.contract.update(parseInt(contractProject.id), contractData);
      await loadProjects();
    } catch (err: any) {
      alert('Erro ao atualizar contrato: ' + err.message);
    }
  };

  const handleCopyBriefingLink = (project: ClientProject) => {
    const type = getServiceTypeFromProject(project);
    const link = `${window.location.origin}/?page=briefing&service=${type}`;
    navigator.clipboard.writeText(link);
    alert(`Link copiado! (${type})`);
  };

  const handleOpenBriefingInternal = (project: ClientProject) => {
    const type = getServiceTypeFromProject(project);
    setBriefingPreviewType(type);
  };

  const STATUS_LABELS: Record<string, string> = {
    'new': 'Novo Lead',
    'pending': 'Novo Lead',
    'briefing': 'Briefing',
    'development': 'Em Desenvolvimento',
    'review': 'Em Revisão',
    'completed': 'Concluido',
  };

  if (loading) return <div className="flex justify-center h-64"><Loader2 className="animate-spin text-primary-600" /></div>;
  if (error) {
    return (
      <div className="text-center p-12">
        <AlertCircle className="mx-auto text-red-500 mb-3" />
        <p className="text-gray-500 mb-3">{error}</p>
        <button onClick={loadProjects} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold">Tentar Novamente</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
        {briefingPreviewType && (
            <div className="fixed inset-0 z-[200] bg-white overflow-auto animate-in slide-in-from-bottom duration-300">
                <div className="absolute top-4 right-4 z-[210]">
                    <button onClick={() => setBriefingPreviewType(null)} className="bg-white/90 backdrop-blur-md text-red-600 hover:bg-red-50 px-4 py-2 rounded-full shadow-lg font-bold flex items-center gap-2 border border-red-100">
                        Fechar Pré-visualização
                    </button>
                </div>
                <ClientBriefingPage forcedServiceType={briefingPreviewType} onCustomBack={() => setBriefingPreviewType(null)} />
            </div>
        )}

        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestão de Projetos</h2>
            <Button leftIcon={<Plus size={16}/>} size="sm" onClick={() => setIsCreateModalOpen(true)}>Novo Projeto</Button>
        </div>

        {isCreateModalOpen && <CreateProjectModal onClose={() => setIsCreateModalOpen(false)} onCreate={handleCreateProject} />}
        {editingProject && <EditProjectModal project={editingProject} onClose={() => setEditingProject(null)} onSave={handleEditSave} />}
        {briefingProject && <ProjectBriefingModal project={briefingProject} onClose={() => setBriefingProject(null)} onSave={handleBriefingSave} />}
        {emailModalProject && <EmailGeneratorModal project={emailModalProject} onClose={() => setEmailModalProject(null)} onSuccess={() => {}} />}
        {contractProject && <ContractGeneratorModal project={contractProject} onClose={() => setContractProject(null)} userRole="admin" onContractUpdate={handleContractUpdate} />}

        <div className="grid gap-6">
            {projects.length === 0 && (
                <div className="text-center p-12 bg-gray-50 dark:bg-[#151921] rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500">Nenhum projeto encontrado. Crie o primeiro!</p>
                </div>
            )}

            {projects.map((project) => {
                const isContractSigned = project.contract?.status === 'signed';
                const isContractSent = project.contract?.status === 'sent_to_client';
                const isPaid = project.financial.status === 'paid';

                return (
                <div key={project.id} className="bg-white dark:bg-[#151921] rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center font-bold text-xl">
                                {project.clientName.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-gray-900 dark:text-white">{project.projectName}</h4>
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                    {project.clientName} • <span className="opacity-70">{project.email}</span>
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-1 ${
                                project.status === 'completed' ? 'bg-green-100 text-green-700' :
                                project.status === 'development' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-600'
                            }`}>
                                {STATUS_LABELS[project.status] || project.status}
                            </span>
                            <p className="text-xs text-gray-400">Entrega: {project.dueDate}</p>
                        </div>
                    </div>

                    <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-3">
                            <p className="text-xs font-bold text-gray-400 uppercase">Financeiro</p>
                            <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-lg ${isPaid ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                    <DollarSign size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.financial.paid)}
                                        <span className="text-gray-400 font-normal"> / {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.financial.total)}</span>
                                    </p>
                                    <p className="text-[10px] text-gray-500">
                                        {isPaid ? 'Totalmente Quitado' : `Restante: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.financial.total - project.financial.paid)}`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-xs font-bold text-gray-400 uppercase">Progresso</p>
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 mb-1">
                                <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>{project.progress}% Concluído</span>
                                <span>Próx: {project.nextMilestone}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-xs font-bold text-gray-400 uppercase">Ações Rápidas</p>
                            <div className="flex flex-col gap-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => handleCopyBriefingLink(project)} className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors">
                                        Link
                                    </button>
                                    <button onClick={() => handleOpenBriefingInternal(project)} className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm">
                                        Abrir
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    {project.paymentOrder ? (
                                        <button onClick={() => handleApprovePayment(project)} className="col-span-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100">
                                            <CheckCircle2 size={14} /> Aprovar
                                        </button>
                                    ) : !isPaid ? (
                                        <button onClick={() => handleGeneratePayment(project, project.financial.paid === 0 ? 'signal' : 'final')} className="col-span-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border bg-white border-gray-200 hover:bg-gray-50 text-gray-600">
                                            <QrCode size={14} /> Cobrar
                                        </button>
                                    ) : (
                                        <div className="col-span-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border border-transparent text-green-600 bg-green-50/50 cursor-default">
                                            <Check size={14} /> Pago
                                        </div>
                                    )}

                                    <button onClick={async () => {
                                        const hasContract = project.contract && Object.keys(project.contract).length > 1;
                                        if (!hasContract) {
                                            await handleGenerateContract(project);
                                        } else {
                                            setContractProject(project);
                                        }
                                    }} className={`col-span-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
                                        isContractSigned ? 'bg-green-50 border-green-200 text-green-700' :
                                        isContractSent ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                                        'bg-white border-gray-200 hover:bg-gray-50 text-gray-600'
                                    }`}>
                                        {isContractSigned ? 'Contrato' : isContractSent ? 'Enviado' : 'Contrato'}
                                    </button>
                                </div>

                                {['new', 'briefing', 'pending'].includes(project.status) && (
                                    <button onClick={() => setEmailModalProject(project)} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold bg-gray-900 text-white hover:bg-black transition-colors shadow-sm">
                                        <Mail size={14} /> Formalizar Início
                                    </button>
                                )}

                                <button onClick={() => setEditingProject(project)} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border border-gray-200 hover:border-primary-200 hover:text-primary-600 transition-colors">
                                    <Edit size={14} /> Editar Projeto
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )})}
        </div>
    </div>
  );
};
