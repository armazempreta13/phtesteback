import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SITE_CONFIG as STATIC_SITE,
  HERO_CONFIG as STATIC_HERO,
  ABOUT_CONFIG as STATIC_ABOUT,
  CONTACT_CONFIG as STATIC_CONTACT,
  SERVICE_PACKAGES as STATIC_SERVICES,
  PERFORMANCE_CONFIG as STATIC_PERFORMANCE,
  NOTIFICATIONS_CONFIG as STATIC_NOTIFICATIONS,
  ANALYTICS_CONFIG as STATIC_ANALYTICS,
  EASTER_EGG_CONFIG as STATIC_EASTER_EGG,
  PROCESS_STEPS as STATIC_PROCESS,
  FAQ_DATA as STATIC_FAQ,
  FINANCIAL_NOTE as STATIC_FINANCIAL_NOTE,
  SKILLS as STATIC_SKILLS,
  NAV_ITEMS as STATIC_NAV_ITEMS
} from '../config';
import { PROJECTS_DATA as STATIC_PROJECTS } from '../projectsData';
import { BlogPost, Project, ServicePackage, ProcessStep, FAQ, Skill, NavItem } from '../types';
import { api } from '../lib/api';

const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: "O que você não vê, você sente: A Ciência do Frontend",
    excerpt: "Descubra como a performance técnica impacta diretamente nas vendas.",
    content: `Conteúdo completo do artigo...`,
    image: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=2000",
    date: "2023-10-27",
    readTime: "5 min",
    author: "Philippe Boechat",
    category: "Engenharia",
  }
];

interface ContentState {
  site: typeof STATIC_SITE;
  hero: typeof STATIC_HERO;
  about: typeof STATIC_ABOUT;
  contact: typeof STATIC_CONTACT;
  performance: typeof STATIC_PERFORMANCE;
  notifications: typeof STATIC_NOTIFICATIONS;
  analytics: typeof STATIC_ANALYTICS;
  easterEgg: typeof STATIC_EASTER_EGG;
  financialNote: string;

  blogPosts: BlogPost[];
  projects: Project[];
  services: ServicePackage[];
  process: ProcessStep[];
  faq: FAQ[];
  skills: Skill[];
  navItems: NavItem[];
}

interface ContentContextType {
  content: ContentState;
  updateContent: (section: keyof ContentState, data: any) => void;
  addBlogPost: (post: BlogPost) => void;
  updateBlogPost: (id: string, post: Partial<BlogPost>) => void;
  deleteBlogPost: (id: string) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  resetContent: () => void;
  exportConfig: () => string;
  isAdminOpen: boolean;
  toggleAdmin: () => void;
  loading: boolean;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<ContentState>({
    site: STATIC_SITE,
    hero: STATIC_HERO,
    about: STATIC_ABOUT,
    contact: STATIC_CONTACT,
    performance: STATIC_PERFORMANCE,
    notifications: STATIC_NOTIFICATIONS,
    analytics: STATIC_ANALYTICS,
    easterEgg: STATIC_EASTER_EGG,
    financialNote: STATIC_FINANCIAL_NOTE,

    blogPosts: INITIAL_BLOG_POSTS,
    projects: STATIC_PROJECTS,
    services: STATIC_SERVICES,
    process: STATIC_PROCESS,
    faq: STATIC_FAQ,
    skills: STATIC_SKILLS,
    navItems: STATIC_NAV_ITEMS,
  });

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  /**
   * Boot sequence: Load settings from API, fallback to defaults
   */
  useEffect(() => {
    let cancelled = false;
    const boot = async () => {
      setLoading(true);
      try {
        // Try loading blog posts from API
        const blogRes = await api.posts.getAll(false).catch(() => null);
        if (blogRes && Array.isArray(blogRes) && blogRes.length > 0 && !cancelled) {
          const mappedPosts = blogRes.map((raw: any) => {
            let tags: string[] = [];
            try { tags = raw.tags ? (typeof raw.tags === 'string' ? JSON.parse(raw.tags) : raw.tags) : []; } catch {}
            return {
              id: String(raw.id),
              title: raw.title || '',
              excerpt: raw.excerpt || '',
              content: raw.content || '',
              image: raw.cover_image || '',
              date: raw.created_at ? new Date(raw.created_at).toLocaleDateString('pt-BR') : '2023-10-27',
              readTime: '5 min',
              author: 'Philippe Boechat',
              category: tags.length > 0 ? tags[0] : 'Tech',
              published: !!raw.published,
            };
          });
          setContent(prev => ({ ...prev, blogPosts: mappedPosts }));
        }
      } catch (e) {
        // API not available, keep static defaults
      }

      try {
        // Load portfolio from API
        const portfolioRes = await api.portfolio.getAll().catch(() => null);
        if (portfolioRes && Array.isArray(portfolioRes) && portfolioRes.length > 0 && !cancelled) {
          const mappedProjects = portfolioRes.map((raw: any) => {
            let tags: string[] = [];
            try { tags = raw.tech_stack ? (typeof raw.tech_stack === 'string' ? JSON.parse(raw.tech_stack) : raw.tech_stack) : []; } catch {}
            return {
              id: String(raw.id),
              title: raw.title || '',
              category: raw.category || '',
              description: raw.description || '',
              image: raw.image_url || '',
              tags,
              demoUrl: raw.live_url || '',
              liveUrl: raw.github_url || '',
              featured: raw.featured === 1,
            };
          });
          setContent(prev => ({ ...prev, projects: mappedProjects }));
        }
      } catch (e) {
        // API not available, keep static defaults
      }

      try {
        // Load site settings from API
        const settingsRes = await api.settings.getAll().catch(() => null);
        if (settingsRes?.data && !cancelled) {
          const d = settingsRes.data;
          setContent(prev => ({
            ...prev,
            site: d.site ? { ...prev.site, ...d.site } : prev.site,
            contact: d.contact ? { ...prev.contact, ...d.contact } : prev.contact,
            performance: d.performance ? { ...prev.performance, ...d.performance } : prev.performance,
            notifications: d.notifications ? { ...prev.notifications, ...d.notifications } : prev.notifications,
            easterEgg: d.easterEgg ? { ...prev.easterEgg, ...d.easterEgg } : prev.easterEgg,
            skills: Array.isArray(d.skills) ? d.skills : prev.skills,
          }));
        }
      } catch (e) {
        // API not available, keep static defaults
      }

      if (!cancelled) setLoading(false);
    };

    boot();
    return () => { cancelled = true; };
  }, []);

  /**
   * Update content section + sync to Settings API
   */
  const updateContent = async (section: keyof ContentState, data: any) => {
    setContent(prev => {
      const currentValue = prev[section];

      if (Array.isArray(currentValue) || typeof currentValue !== 'object' || currentValue === null) {
        const newContent = { ...prev, [section]: data };
        syncSetting(section, data);
        return newContent;
      }

      const newValue = { ...(currentValue as object), ...data };
      const newContent = { ...prev, [section]: newValue };

      // For nested object sections, sync the whole section
      if (['site', 'contact', 'performance', 'notifications', 'easterEgg', 'skills'].includes(section)) {
        syncSetting(section as string, newValue);
      }
      return newContent;
    });
  };

  /**
   * Silently sync to settings API (fire and forget)
   */
  const syncSetting = async (section: string, data: any) => {
    try {
      await api.settings.update({ [section]: data });
    } catch (e) {
      console.warn('Settings sync failed:', e);
    }
  };

  // Blog CRUD — syncs to API
  const addBlogPost = async (post: BlogPost) => {
    try {
      const categoryArr = post.category ? [post.category] : [];
      const res = await api.posts.create({
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        cover_image: post.image,
        tags: categoryArr,
        published: post.published ? 1 : 0,
      });
      if (res) {
        setContent(prev => ({ ...prev, blogPosts: [post, ...prev.blogPosts] }));
      }
    } catch (e) {
      setContent(prev => ({ ...prev, blogPosts: [post, ...prev.blogPosts] }));
    }
  };

  const updateBlogPost = async (id: string, data: Partial<BlogPost>) => {
    try {
      const categoryArr = data.category ? [data.category] : undefined;
      const payload: any = {};
      if (data.title) payload.title = data.title;
      if (data.excerpt !== undefined) payload.excerpt = data.excerpt;
      if (data.content !== undefined) payload.content = data.content;
      if (data.image !== undefined) payload.cover_image = data.image;
      if (categoryArr) payload.tags = categoryArr;
      if (data.published !== undefined) payload.published = data.published ? 1 : 0;

      if (Object.keys(payload).length > 0) {
        await api.posts.update(id, payload);
      }
    } catch (e) {
      console.warn('Blog update sync failed:', e);
    } finally {
      setContent(prev => ({
        ...prev,
        blogPosts: prev.blogPosts.map(p => p.id === id ? { ...p, ...data } : p),
      }));
    }
  };

  const deleteBlogPost = async (id: string) => {
    try {
      await api.posts.delete(id);
    } catch (e) {
      console.warn('Blog delete sync failed:', e);
    }
    setContent(prev => ({
      ...prev,
      blogPosts: prev.blogPosts.filter(p => p.id !== id),
    }));
  };

  // Portfolio CRUD — syncs to API
  const addProject = async (project: Project) => {
    try {
      await api.portfolio.create({
        title: project.title,
        description: project.description,
        image_url: project.image,
        tech_stack: JSON.stringify(project.tags),
        live_url: project.demoUrl || '',
        github_url: project.liveUrl || '',
        category: project.category,
        featured: project.featured ? 1 : 0,
      });
    } catch (e) {
      console.warn('Portfolio create sync failed:', e);
    }
    setContent(prev => ({ ...prev, projects: [project, ...prev.projects] }));
  };

  const updateProject = async (id: string, data: Partial<Project>) => {
    try {
      const payload: any = {};
      if (data.title) payload.title = data.title;
      if (data.description !== undefined) payload.description = data.description;
      if (data.image !== undefined) payload.image_url = data.image;
      if (data.tags !== undefined) payload.tech_stack = JSON.stringify(data.tags);
      if (data.demoUrl !== undefined) payload.live_url = data.demoUrl;
      if (data.liveUrl !== undefined) payload.github_url = data.liveUrl;
      if (data.category !== undefined) payload.category = data.category;
      if (data.featured !== undefined) payload.featured = data.featured ? 1 : 0;

      if (Object.keys(payload).length > 0) {
        await api.portfolio.update(id, payload);
      }
    } catch (e) {
      console.warn('Portfolio update sync failed:', e);
    }
    setContent(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, ...data } : p),
    }));
  };

  const deleteProject = async (id: string) => {
    try {
      await api.portfolio.delete(id);
    } catch (e) {
      console.warn('Portfolio delete sync failed:', e);
    }
    setContent(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id),
    }));
  };

  const resetContent = () => {
    if (window.confirm("Tem certeza? Isso apagará todas as edições e restaurará o padrão.")) {
      window.location.reload();
    }
  };

  const exportConfig = () => JSON.stringify(content, null, 2);
  const toggleAdmin = () => setIsAdminOpen(prev => !prev);

  return (
    <ContentContext.Provider value={{
      content,
      updateContent,
      addBlogPost,
      updateBlogPost,
      deleteBlogPost,
      addProject,
      updateProject,
      deleteProject,
      resetContent,
      exportConfig,
      isAdminOpen,
      toggleAdmin,
      loading,
    }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent deve ser usado dentro de um ContentProvider');
  }
  return context;
};
