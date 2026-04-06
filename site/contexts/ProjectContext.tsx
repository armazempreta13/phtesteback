import React, { createContext, useContext, useState, useEffect } from 'react';
import { ClientProject, ProjectFile, ClientNotification } from '../types';
import { api } from '../lib/api';

interface ProjectContextType {
  projects: ClientProject[];
  currentProjectId: string;
  updateProject: (id: string, data: Partial<ClientProject>) => void;
  createProject: (data: { clientName: string; cpf?: string; email: string; projectName: string; totalValue: number }) => void;
  addFile: (projectId: string, file: ProjectFile) => void;
  sendNotification: (projectId: string, notification: Omit<ClientNotification, 'id' | 'date' | 'read'>) => void;
  markNotificationsAsRead: (projectId: string) => void;
  setCurrentProjectId: (id: string) => void;
  getProject: (id: string) => ClientProject | undefined;
  reloadProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Map backend project row to ClientProject type
function mapBackendProject(row: any): ClientProject {
  let contract = {};
  let briefing = {};
  let paymentOrder = null;
  let activity = [];
  let notifications = [];
  let tasks = [];
  let links = {};

  try { contract = row.contract ? (typeof row.contract === 'string' ? JSON.parse(row.contract) : row.contract) : {}; } catch {}
  try { briefing = row.briefing ? (typeof row.briefing === 'string' ? JSON.parse(row.briefing) : row.briefing) : {}; } catch {}
  try { paymentOrder = row.payment_order ? (typeof row.payment_order === 'string' ? JSON.parse(row.payment_order) : row.payment_order) : null; } catch {}
  try { activity = row.activity ? (typeof row.activity === 'string' ? JSON.parse(row.activity) : row.activity) : []; } catch {}
  try { notifications = row.notifications ? (typeof row.notifications === 'string' ? JSON.parse(row.notifications) : row.notifications) : []; } catch {}
  try { tasks = row.tasks ? (typeof row.tasks === 'string' ? JSON.parse(row.tasks) : row.tasks) : []; } catch {}
  try { links = row.links ? (typeof row.links === 'string' ? JSON.parse(row.links) : row.links) : {}; } catch {}

  const statusMap: Record<string, string> = { 'pending': 'new', 'approved': 'development' };
  const status = statusMap[row.status] || row.status || 'new';

  return {
    id: row.id.toString(),
    clientName: row.client_name || row.joined_client_name || 'Cliente',
    cpf: row.client_cpf || '',
    email: row.client_email || '',
    projectName: row.title || 'Sem titulo',
    status: status as any,
    progress: row.progress ?? 0,
    nextMilestone: row.next_milestone || 'Inicio do Projeto',
    dueDate: row.deadline ? new Date(row.deadline).toLocaleDateString('pt-BR') : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
    lastUpdate: new Date(row.updated_at || row.created_at).toLocaleDateString('pt-BR'),
    financial: {
      total: row.financial_total ?? row.budget ?? 0,
      paid: row.financial_paid ?? 0,
      status: row.financial_status ?? 'pending',
    },
    contract: contract as any,
    briefing: briefing as any,
    paymentOrder,
    activity,
    notifications,
    tasks,
    links,
  };
}

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string>('');

  const loadProjects = async () => {
    try {
      const res = await api.projects.getAll();
      const rawProjects = res.data?.projects || [];
      const mapped = rawProjects.map(mapBackendProject);
      setProjects(mapped);
      if (mapped.length > 0 && !currentProjectId) {
        setCurrentProjectId(mapped[0].id);
      }
    } catch (e) {
      console.error('ProjectContext: failed to load projects from API', e);
      setProjects([]);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const createProject = async (data: { clientName: string; cpf?: string; email: string; projectName: string; totalValue: number }) => {
    try {
      const res = await api.projects.create({
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

      if (res.data?.project) {
        const newProj = mapBackendProject(res.data.project);
        setProjects(prev => [newProj, ...prev]);
        if (!currentProjectId) setCurrentProjectId(newProj.id);
      }
    } catch (e) {
      console.error('ProjectContext: createProject failed', e);
    }
  };

  const updateProject = async (id: string, data: Partial<ClientProject>) => {
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
      if (data.contract !== undefined) updatePayload.contract = data.contract;
      if (data.briefing !== undefined) updatePayload.briefing = data.briefing;
      if (data.paymentOrder !== undefined) updatePayload.payment_order = data.paymentOrder;
      if (data.activity !== undefined) updatePayload.activity = data.activity;
      if (data.notifications !== undefined) updatePayload.notifications = data.notifications;
      if (data.tasks !== undefined) updatePayload.tasks = data.tasks;
      if (data.links !== undefined) updatePayload.links = data.links;

      const res = await api.projects.update(parseInt(id), updatePayload);

      setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data, lastUpdate: new Date().toLocaleDateString('pt-BR') } : p));
    } catch (e) {
      console.error('ProjectContext: updateProject failed', e);
    }
  };

  const addFile = (projectId: string, file: ProjectFile) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      updateProject(projectId, { files: [file, ...project.files] });
    }
  };

  const sendNotification = async (projectId: string, notification: Omit<ClientNotification, 'id' | 'date' | 'read'>) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const newNote: ClientNotification = {
        ...notification,
        id: `n${Date.now()}`,
        date: new Date().toLocaleDateString('pt-BR'),
        read: false
      };
      updateProject(projectId, { notifications: [newNote, ...(project.notifications || [])] });
    }
  };

  const markNotificationsAsRead = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      updateProject(projectId, { notifications: project.notifications.map(n => ({ ...n, read: true })) });
    }
  };

  const getProject = (id: string) => projects.find(p => p.id === id);

  return (
    <ProjectContext.Provider value={{
      projects,
      currentProjectId,
      updateProject,
      createProject,
      addFile,
      sendNotification,
      markNotificationsAsRead,
      setCurrentProjectId,
      getProject,
      reloadProjects: loadProjects,
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject deve ser usado dentro de um ProjectProvider');
  }
  return context;
};
