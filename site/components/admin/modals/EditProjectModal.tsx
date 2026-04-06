
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, X, Clock, Calculator, RefreshCw, Check, Send, Save } from 'lucide-react';
import { ClientProject, ProjectStatus } from '../../../types';
import { Button } from '../../Button';

interface Props {
    project: ClientProject;
    onClose: () => void;
    onSave: (id: string, data: Partial<ClientProject>, notify: boolean, notifyMessage?: string) => void;
}

export const EditProjectModal: React.FC<Props> = ({ project, onClose, onSave }) => {
    const [activeTab, setActiveTab] = useState<'general' | 'timeline' | 'financial'>('general');
    const [notifyClient, setNotifyClient] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        projectName: project.projectName,
        clientName: project.clientName,
        email: project.email,
        status: project.status,
        progress: project.progress,
        dueDate: project.dueDate,
        nextMilestone: project.nextMilestone,
        totalValue: project.financial.total,
        paidValue: project.financial.paid
    });

    const STATUS_LABELS: Record<string, string> = {
        'new': 'Novo Lead',
        'briefing': 'Fase de Briefing',
        'development': 'Em Desenvolvimento',
        'review': 'Em Revisão',
        'completed': 'Projeto Concluído'
    };

    const MILESTONE_OPTIONS = [
        "Briefing completo",
        "Contrato Assinado",
        "Design / Wireframe Aprovado",
        "Desenvolvimento Frontend Iniciado",
        "Integração de Conteúdo",
        "Testes & QA",
        "Aguardando Aprovação Final",
        "Deploy em Produção",
        "Projeto Finalizado"
    ];

    const calculateSmartDeadline = () => {
        const today = new Date();
        let daysToAdd = 15; 
        
        const name = formData.projectName.toLowerCase();
        if (name.includes('landing') || name.includes('express')) daysToAdd = 7;
        else if (name.includes('ecommerce') || name.includes('loja')) daysToAdd = 30;
        else if (name.includes('sistema') || name.includes('app')) daysToAdd = 45;

        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + daysToAdd);
        
        setFormData(prev => ({
            ...prev,
            dueDate: futureDate.toLocaleDateString('pt-BR')
        }));
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as ProjectStatus;
        let newProgress = formData.progress;

        if (newStatus === 'new') newProgress = 0;
        if (newStatus === 'briefing') newProgress = 10;
        if (newStatus === 'development' && formData.progress < 20) newProgress = 25;
        if (newStatus === 'review') newProgress = 90;
        if (newStatus === 'completed') newProgress = 100;

        setFormData(prev => ({ ...prev, status: newStatus, progress: newProgress }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        let emailMessage = '';
        if (notifyClient) {
            const updates = [];
            if (formData.status !== project.status) updates.push(`Status alterado para: <strong>${STATUS_LABELS[formData.status]}</strong>`);
            if (Number(formData.progress) > project.progress) updates.push(`Progresso avançou para: <strong>${formData.progress}%</strong>`);
            if (formData.dueDate !== project.dueDate) updates.push(`Nova previsão de entrega: <strong>${formData.dueDate}</strong>`);
            if (formData.nextMilestone !== project.nextMilestone) updates.push(`Próximo passo: <strong>${formData.nextMilestone}</strong>`);
            
            if (updates.length > 0) {
                emailMessage = `<p>Olá, <strong>${formData.clientName}</strong>.</p><p>Houve uma atualização importante no seu projeto <strong>${formData.projectName}</strong>:</p><ul>${updates.map(u => `<li>${u}</li>`).join('')}</ul><p>Acesse seu portal para ver os detalhes completos.</p>`;
            } else {
                emailMessage = `<p>Olá, <strong>${formData.clientName}</strong>.</p><p>Os dados do seu projeto <strong>${formData.projectName}</strong> foram atualizados administrativamente.</p>`;
            }
        }

        await onSave(project.id, {
            ...formData,
            progress: Number(formData.progress),
            financial: {
                ...project.financial,
                total: Number(formData.totalValue),
                paid: Number(formData.paidValue),
                status: Number(formData.paidValue) >= Number(formData.totalValue) ? 'paid' : Number(formData.paidValue) > 0 ? 'partial' : 'pending'
            }
        } as Partial<ClientProject>, notifyClient, emailMessage);

        setIsSaving(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                className="relative bg-white dark:bg-[#151921] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                            <Settings size={20} className="text-primary-600"/> 
                            Gerenciar Projeto
                        </h3>
                        <p className="text-xs text-gray-500">Alterações aqui notificam o cliente automaticamente.</p>
                    </div>
                    <button onClick={onClose} className="hover:bg-gray-200 p-2 rounded-full transition-colors"><X size={20} className="text-gray-400" /></button>
                </div>
                
                <div className="flex border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#151921]">
                    <button onClick={() => setActiveTab('general')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'general' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Visão Geral</button>
                    <button onClick={() => setActiveTab('timeline')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'timeline' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Cronograma</button>
                    <button onClick={() => setActiveTab('financial')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'financial' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Financeiro</button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-6">
                        {activeTab === 'general' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nome do Projeto</label><input name="projectName" value={formData.projectName} onChange={handleChange} className="w-full border rounded-lg p-2.5 text-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" /></div>
                                    <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Cliente Responsável</label><input name="clientName" value={formData.clientName} onChange={handleChange} className="w-full border rounded-lg p-2.5 text-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" /></div>
                                </div>
                                <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">E-mail de Acesso</label><input name="email" value={formData.email} onChange={handleChange} className="w-full border rounded-lg p-2.5 text-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" /></div>
                            </motion.div>
                        )}
                        {activeTab === 'timeline' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-xl flex items-start gap-3">
                                    <Clock size={20} className="text-blue-600 mt-0.5" />
                                    <div><h4 className="text-sm font-bold text-blue-900 dark:text-blue-300">Automação de Prazos</h4><p className="text-xs text-blue-700 dark:text-blue-400 mt-1 mb-2">O sistema pode calcular a data ideal baseada no escopo.</p><button type="button" onClick={calculateSmartDeadline} className="text-xs bg-white dark:bg-blue-900 border border-blue-200 dark:border-blue-700 px-3 py-1.5 rounded-md font-bold text-blue-700 dark:text-blue-200 shadow-sm flex items-center gap-2"><Calculator size={12}/> Calcular Entrega Sugerida</button></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Fase Atual</label><div className="relative"><select name="status" value={formData.status} onChange={handleStatusChange} className="w-full border rounded-lg p-2.5 text-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"><option value="new">Novo Lead (0%)</option><option value="briefing">Briefing (10%)</option><option value="development">Desenvolvimento (25-80%)</option><option value="review">Em Revisão (90%)</option><option value="completed">Concluído (100%)</option></select><RefreshCw size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none"/></div></div>
                                    <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Progresso Real (%)</label><div className="flex items-center gap-2"><input type="range" name="progress" min="0" max="100" value={formData.progress} onChange={handleChange} className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600" /><span className="text-sm font-mono font-bold w-10 text-right">{formData.progress}%</span></div></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Prazo de Entrega</label><input name="dueDate" value={formData.dueDate} onChange={handleChange} className="w-full border rounded-lg p-2.5 text-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white" /></div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Próximo Marco</label>
                                        <input 
                                            list="milestone-options"
                                            name="nextMilestone" 
                                            value={formData.nextMilestone} 
                                            onChange={handleChange} 
                                            className="w-full border rounded-lg p-2.5 text-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white" 
                                            placeholder="Selecione ou digite..."
                                        />
                                        <datalist id="milestone-options">
                                            {MILESTONE_OPTIONS.map((opt, i) => (
                                                <option key={i} value={opt} />
                                            ))}
                                        </datalist>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        {activeTab === 'financial' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Valor Total</label><div className="relative"><span className="absolute left-3 top-2.5 text-gray-400 text-sm">R$</span><input type="number" name="totalValue" value={formData.totalValue} onChange={handleChange} className="w-full border rounded-lg py-2.5 pl-9 pr-3 text-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono font-bold" /></div></div>
                                    <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Valor Pago</label><div className="relative"><span className="absolute left-3 top-2.5 text-gray-400 text-sm">R$</span><input type="number" name="paidValue" value={formData.paidValue} onChange={handleChange} className="w-full border rounded-lg py-2.5 pl-9 pr-3 text-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono font-bold text-green-600" /></div></div>
                                </div>
                                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"><div className="flex justify-between items-center text-sm mb-2"><span className="text-gray-500">Status Financeiro</span><span className={`font-bold px-2 py-0.5 rounded text-xs ${Number(formData.paidValue) >= Number(formData.totalValue) ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{Number(formData.paidValue) >= Number(formData.totalValue) ? 'QUITADO' : 'PENDENTE'}</span></div><div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-1"><div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, (Number(formData.paidValue) / Number(formData.totalValue)) * 100)}%` }}></div></div></div>
                            </motion.div>
                        )}
                    </div>
                    <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#151921] flex justify-between items-center">
                        <label className="flex items-center gap-2 cursor-pointer select-none"><div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${notifyClient ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-300'}`} onClick={() => setNotifyClient(!notifyClient)}>{notifyClient && <Check size={14} className="text-white" />}</div><span className="text-xs font-bold text-gray-600 dark:text-gray-300">Enviar E-mail de Atualização</span></label>
                        <div className="flex gap-2"><Button type="button" variant="ghost" onClick={onClose} size="sm">Cancelar</Button><Button type="submit" isLoading={isSaving} leftIcon={notifyClient ? <Send size={16}/> : <Save size={16}/>} size="sm" className="shadow-lg shadow-primary-600/20">{notifyClient ? 'Salvar & Enviar' : 'Salvar Alterações'}</Button></div>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};
