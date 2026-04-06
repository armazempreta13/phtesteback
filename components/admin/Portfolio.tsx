import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../Button';
import { Project } from '../../types';
import { PortfolioEditorModal } from './modals/PortfolioEditorModal';
import { api } from '../../lib/api';

function mapApiItem(row: any): Project {
  let tags: string[] = [];
  try { tags = typeof row.tech_stack === 'string' ? JSON.parse(row.tech_stack) : row.tech_stack || []; } catch {}
  return {
    id: row.id.toString(),
    title: row.title || '',
    category: row.category || '',
    description: row.description || '',
    image: row.image_url || '',
    tags,
    demoUrl: row.live_url || '',
    liveUrl: row.github_url || '',
    featured: row.featured === 1,
  };
}

function toApiPayload(proj: Project): any {
  return {
    title: proj.title,
    description: proj.description,
    image_url: proj.image,
    tech_stack: proj.tags.length > 0 ? JSON.stringify(proj.tags) : '',
    live_url: proj.demoUrl || '',
    github_url: proj.liveUrl || '',
    category: proj.category,
    featured: proj.featured ? 1 : 0,
  };
}

export const Portfolio: React.FC = () => {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const rawItems = await api.portfolio.getAll();
      setItems(Array.isArray(rawItems) ? rawItems.map(mapApiItem) : []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar portfolio');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (proj: Project) => {
    try {
      if (editingItem) {
        await api.portfolio.update(editingItem.id, toApiPayload(proj));
      } else {
        await api.portfolio.create(toApiPayload(proj));
      }
      await loadItems();
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err: any) {
      alert('Erro ao salvar: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este projeto do portfolio?')) return;
    try {
      await api.portfolio.delete(id);
      setItems(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  if (loading) return <div className="flex justify-center h-64"><Loader2 className="animate-spin text-primary-600" /></div>;
  if (error) {
    return (
      <div className="text-center p-12">
        <AlertCircle className="mx-auto text-red-500 mb-3" />
        <p className="text-gray-500 mb-3">{error}</p>
        <button onClick={loadItems} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold">Tentar Novamente</button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Portfólio</h2>
            <Button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} size="sm" leftIcon={<Plus size={16}/>}>Novo Projeto</Button>
        </div>

        {isModalOpen && (
            <PortfolioEditorModal
                project={editingItem}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
            />
        )}

        <div className="grid gap-4">
            {items.length === 0 && (
                <div className="text-center p-12 bg-gray-50 dark:bg-[#151921] rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500">Nenhum projeto no portfolio. Crie o primeiro!</p>
                </div>
            )}
            {items.map((proj) => (
                <div key={proj.id} className="flex items-center p-4 bg-white dark:bg-[#151921] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                      {proj.image ? (
                        <img src={proj.image} alt={proj.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400"><span className="text-xs">Sem imagem</span></div>
                      )}
                    </div>
                    <div className="flex-1 ml-4 min-w-0">
                        <h4 className="font-bold text-gray-900 dark:text-white truncate">{proj.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <span>{proj.category}</span>{String.fromCharCode(8226)}<span className="flex gap-1">{proj.tags.slice(0,2).map(t=><span key={t} className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{t}</span>)}</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => { setEditingItem(proj); setIsModalOpen(true); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400"><Edit size={16}/></button>
                        <button onClick={() => handleDelete(proj.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500"><Trash size={16}/></button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};
