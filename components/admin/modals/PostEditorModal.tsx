
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileEdit, X, Save } from 'lucide-react';
import { BlogPost } from '../../../types';
import { Button } from '../../Button';

interface Props {
    post: BlogPost | null;
    onClose: () => void;
    onSave: (post: BlogPost) => void;
}

export const PostEditorModal: React.FC<Props> = ({ post, onClose, onSave }) => {
    const [formData, setFormData] = useState<BlogPost>({
        id: post?.id || '',
        title: post?.title || '',
        excerpt: post?.excerpt || '',
        content: post?.content || '',
        image: post?.image || '',
        date: post?.date || new Date().toLocaleDateString('pt-BR'),
        readTime: post?.readTime || '5 min',
        author: post?.author || 'Philippe Boechat',
        category: post?.category || 'Tech',
        published: post?.published ?? false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            id: formData.id || `post_${Date.now()}`,
        });
    };

    return (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white dark:bg-[#151921] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-[#1A1D24]">
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <FileEdit size={18} /> {post ? 'Editar Artigo' : 'Novo Artigo'}
                        </h3>
                        {/* Published Toggle */}
                        <label className="flex items-center gap-2 ml-4 cursor-pointer select-none">
                            <span className="text-xs font-bold uppercase text-gray-500">Publicado</span>
                            <div
                                onClick={() => setFormData({ ...formData, published: !formData.published })}
                                className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                                    formData.published
                                        ? 'bg-green-500'
                                        : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                            >
                                <div
                                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                                        formData.published ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                />
                            </div>
                        </label>
                    </div>
                    <button onClick={onClose}>
                        <X size={20} className="text-gray-400 hover:text-red-500" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-500">Título</label>
                            <input name="title" value={formData.title} onChange={handleChange} className="w-full border rounded-lg p-2 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white" required />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-500">Categoria</label>
                            <input name="category" value={formData.category} onChange={handleChange} className="w-full border rounded-lg p-2 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white" required />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-500">Autor</label>
                            <input name="author" value={formData.author} onChange={handleChange} className="w-full border rounded-lg p-2 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-500">Data</label>
                            <input name="date" value={formData.date} onChange={handleChange} className="w-full border rounded-lg p-2 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-500">Tempo de Leitura</label>
                            <input name="readTime" value={formData.readTime} onChange={handleChange} className="w-full border rounded-lg p-2 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-500">URL da Imagem</label>
                        <input name="image" value={formData.image} onChange={handleChange} className="w-full border rounded-lg p-2 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white" placeholder="https://..." />
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-500">Resumo (Excerpt)</label>
                        <textarea name="excerpt" value={formData.excerpt} onChange={handleChange} className="w-full border rounded-lg p-2 h-20 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white" required />
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-500">Conteúdo Completo</label>
                        <textarea name="content" value={formData.content} onChange={handleChange} className="w-full border rounded-lg p-2 h-64 font-mono text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white" required />
                    </div>
                </form>
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#1A1D24] flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose} size="sm">Cancelar</Button>
                    <Button onClick={handleSubmit} size="sm" leftIcon={<Save size={16} />}>
                        {formData.published ? 'Publicar Artigo' : 'Salvar Artigo'}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};
