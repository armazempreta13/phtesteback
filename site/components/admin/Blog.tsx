
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash, Loader2, AlertCircle } from 'lucide-react';
import { BlogPost } from '../../types';
import { Button } from '../Button';
import { PostEditorModal } from './modals/PostEditorModal';
import { api } from '../../lib/api';

/** Map a raw DB post (from API) to the BlogPost frontend type */
function dbPostToBlogPost(raw: any): BlogPost {
  let tags: string[] = [];
  try {
    tags = raw.tags ? (typeof raw.tags === 'string' ? JSON.parse(raw.tags) : raw.tags) : [];
  } catch {
    tags = [];
  }

  const date = raw.created_at
    ? new Date(raw.created_at).toLocaleDateString('pt-BR')
    : new Date().toLocaleDateString('pt-BR');

  const contentLen = raw.content?.length || 0;
  const readTime = `${Math.max(1, Math.ceil(contentLen / 1000))} min`;

  return {
    id: String(raw.id),
    title: raw.title || '',
    excerpt: raw.excerpt || '',
    content: raw.content || '',
    image: raw.cover_image || '',
    date,
    readTime,
    author: raw.author_id ? String(raw.author_id) : 'Philippe Boechat',
    category: Array.isArray(tags) && tags.length > 0 ? tags[0] : 'Tech', // Use first tag as category
    published: !!raw.published,
  };
}

/** Map BlogPost fields to the backend DB fields for create/update */
function blogPostToDbPayload(post: BlogPost): any {
  const tags = post.category ? [post.category] : [];

  return {
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    cover_image: post.image,
    tags,
    published: post.published ? 1 : 0,
  };
}

export const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const rawPosts = await api.posts.getAll(false); // false = get ALL posts including drafts
      const mapped = rawPosts.map(dbPostToBlogPost);
      setPosts(mapped);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSave = async (post: BlogPost) => {
    try {
      setSaving(true);
      const payload = blogPostToDbPayload(post);

      if (editingPost) {
        // Update existing post
        const raw = await api.posts.update(editingPost.id, payload);
        const updated = dbPostToBlogPost(raw);
        setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
      } else {
        // Create new post
        const raw = await api.posts.create(payload);
        const created = dbPostToBlogPost(raw);
        setPosts(prev => [created, ...prev]);
      }

      setIsPostModalOpen(false);
      setEditingPost(null);
    } catch (err: any) {
      setError(err.message || 'Falha ao salvar post');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este artigo?')) return;

    try {
      await api.posts.delete(id);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      setError(err.message || 'Falha ao deletar post');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Blog & Conte{String.fromCharCode(250)}do</h2>
        <Button
          onClick={() => { setEditingPost(null); setIsPostModalOpen(true); }}
          size="sm"
          leftIcon={<Plus size={16}/>}
          disabled={saving}
        >
          Novo Artigo
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-xs underline">Fechar</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-500">
          <Loader2 size={24} className="animate-spin mr-2" />
          Carregando posts...
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg mb-2">Nenhum artigo encontrado</p>
          <p className="text-sm">Clique em "Novo Artigo" para criar o primeiro.</p>
        </div>
      ) : (
        isPostModalOpen && (
          <PostEditorModal
            post={editingPost}
            onClose={() => { setIsPostModalOpen(false); setEditingPost(null); }}
            onSave={handleSave}
          />
        ),
        <div className="grid gap-4">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center p-4 bg-white dark:bg-[#151921] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                {post.image ? (
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = ''; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Sem imagem</div>
                )}
              </div>
              <div className="flex-1 ml-4 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-gray-900 dark:text-white truncate">{post.title}</h4>
                  {post.published ? (
                    <span className="shrink-0 text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">Publicado</span>
                  ) : (
                    <span className="shrink-0 text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full font-medium">Rascunho</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <span>{post.category}</span>
                  <span>{String.fromCharCode(8226)}</span>
                  <span>{post.date}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditingPost(post); setIsPostModalOpen(true); }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400"
                  disabled={saving}
                >
                  <Edit size={16}/>
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500"
                  disabled={saving}
                >
                  <Trash size={16}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
