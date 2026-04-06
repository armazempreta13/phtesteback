import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, X, Save, Star } from 'lucide-react';
import { Project } from '../../../types';
import { Button } from '../../Button';

interface Props {
    project: Project | null;
    onClose: () => void;
    onSave: (proj: Project) => void;
}

export const PortfolioEditorModal: React.FC<Props> = ({ project, onClose, onSave }) => {
    const [formData, setFormData] = useState<Project>({
        id: '',
        title: '',
        category: '',
        description: '',
        image: '',
        tags: [],
        demoUrl: '',
        liveUrl: '',
        featured: false,
        challenge: '',
        solution: '',
        result: '',
        ...(project || {}),
    });
    const [tagsInput, setTagsInput] = useState(project?.tags.join(', ') || '');
    const [clientName, setClientName] = useState('');
    const [year, setYear] = useState(new Date().getFullYear().toString());

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const tagsArray = tagsInput.split(',').map(t => t.trim()).filter(t => t);
        onSave({ ...formData, id: formData.id || `proj_${Date.now()}`, tags: tagsArray });
    };

    return (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white dark:bg-[#151921] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-[#1A1D24]">
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Briefcase size={18}/> {project ? 'Editar Projeto' : 'Novo Projeto'}</h3>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <Star size={14} className={formData.featured ? 'text-yellow-500' : 'text-gray-400'} />
                            <span className={`text-xs font-bold ${formData.featured ? 'text-yellow-600' : 'text-gray-500'}`}>Em Destaque</span>
                            <div
                                onClick={() => setFormData({ ...formData, featured: !formData.featured })}
                                className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${formData.featured ? 'bg-yellow-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                            >
                                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${formData.featured ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>
                        </label>
                    </div>
                    <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-red-500" /></button>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold uppercase text-gray-500">Título</label><input name="title" value={formData.title} onChange={handleChange} className="w-full border rounded-lg p-2 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white" required /></div>
                        <div><label className="text-xs font-bold uppercase text-gray-500">Categoria</label><input name="category" value={formData.category} onChange={handleChange} className="w-full border rounded-lg p-2 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white" required /></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div><label className="text-xs font-bold uppercase text-gray-500">Cliente</label><input value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full border rounded-lg p-2 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white" placeholder="Nome do cliente" /></div>
                        <div><label className="text-xs font-bold uppercase text-gray-500">Ano</label><input value={year} onChange={(e) => setYear(e.target.value)} className="w-full border rounded-lg p-2 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white" placeholder="2024" /></div>
                        <div><label className="text-xs font-bold uppercase text-gray-500">URL da Imagem (Capa)</label><input name="image" value={formData.image} onChange={handleChange} className="w-full border rounded-lg p-2 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white" placeholder="https://..." /></div>
                    </div>
                    <div><label className="text-xs font-bold uppercase text-gray-500">Descrição Curta</label><textarea name="description" value={formData.description} onChange={handleChange} className="w-full border rounded-lg p-2 h-20 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white" required /></div>

                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold uppercase text-gray-500">Demo URL</label><input name="demoUrl" value={formData.demoUrl} onChange={handleChange} className="w-full border rounded-lg p-2 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white" placeholder="https://..." /></div>
                        <div><label className="text-xs font-bold uppercase text-gray-500">Live URL (Opcional)</label><input name="liveUrl" value={formData.liveUrl} onChange={handleChange} className="w-full border rounded-lg p-2 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white" /></div>
                    </div>
                    <div><label className="text-xs font-bold uppercase text-gray-500">Tags (Separadas por vírgula)</label><input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="w-full border rounded-lg p-2 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white" placeholder="React, Tailwind, SEO..." /></div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 space-y-4">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">Case Study (Detalhes)</h4>
                        <div><label className="text-xs font-bold uppercase text-gray-500">O Desafio</label><textarea name="challenge" value={formData.challenge} onChange={handleChange} className="w-full border rounded-lg p-2 h-20 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white" /></div>
                        <div><label className="text-xs font-bold uppercase text-gray-500">A Solução</label><textarea name="solution" value={formData.solution} onChange={handleChange} className="w-full border rounded-lg p-2 h-20 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white" /></div>
                        <div><label className="text-xs font-bold uppercase text-gray-500">O Resultado</label><textarea name="result" value={formData.result} onChange={handleChange} className="w-full border rounded-lg p-2 h-20 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white" /></div>
                    </div>
                </form>
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#1A1D24] flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose} size="sm">Cancelar</Button>
                    <Button onClick={handleSubmit} size="sm" leftIcon={<Save size={16}/>}>Salvar Projeto</Button>
                </div>
            </motion.div>
        </div>
    );
};
