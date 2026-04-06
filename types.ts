
import React from 'react';
import { LucideIcon } from 'lucide-react';

export type ViewType = 'home' | 'about' | 'services' | 'portfolio' | 'process' | 'contact' | 'zenith-demo' | 'aether-demo' | 'nexus-demo' | 'aura-demo' | 'vertex-demo' | '404' | 'terms' | 'privacy' | 'blog' | 'faq' | 'login' | 'client-portal' | 'admin-dashboard' | 'briefing';

export interface NavItem {
  label: string;
  id: ViewType;
}

export interface NavigationProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  onLogoClick?: () => void; // Optional trigger for Easter Egg
}

export interface Skill {
  name: string;
  icon: LucideIcon;
  color: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface ServicePackage {
  id: string;
  title: string;
  subtitle: string;
  purpose: string;
  features: string[];
  techStack: string[];
  price: string;
  icon: any; // Changed from LucideIcon to any to support persistence serialization
  recommendedFor: string;
  details: string;
  highlight?: boolean;
  // Detailed Page Fields
  fullDescription: string;
  deliverables: string[]; // What IS included
  notIncluded: string[];  // What is NOT included
  timeline: string;
  faqs: FAQ[];
}

export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  tags: string[];
  demoUrl: string;
  liveUrl?: string; 
  featured?: boolean;
  // Case Study Fields
  challenge?: string;
  solution?: string;
  result?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string; // Markdown or Text
  image: string;
  date: string;
  readTime: string;
  author: string;
  category: string;
  published?: boolean;
}

export interface ProcessStep {
  id: number;
  title: string;
  description: string;
  checklist: string[];
  icon: LucideIcon;
}

// --- Chatbot Types ---

export interface ChatMessage {
  id: string;
  text: string | React.ReactNode;
  isUser: boolean;
  type?: 'text' | 'summary' | 'multi-select' | 'process-info' | 'options' | 'input';
  options?: ChatOption[];
}

export interface ChatOption {
  label: string;
  value: string;
  nextId?: string; // The ID of the next step in the flow
  action?: (data: any) => void;
}

export interface ChatStep {
  id: string;
  message: string | ((data: BudgetData) => string);
  type?: 'text' | 'input' | 'options' | 'multi-select' | 'process-info' | 'summary';
  options?: ChatOption[]; // Fixed options
  dynamicOptions?: (data: BudgetData) => ChatOption[]; // Dynamic options based on state
  nextId?: string; // Default next step if not option-based
  inputPlaceholder?: string; // For text input steps
  validation?: string | ((value: string) => boolean | { isValid: boolean; message?: string; cleaned?: string }); // Simple validation
  key?: keyof BudgetData; // The key in BudgetData to update
  allowSkip?: boolean;
}

export interface BudgetData {
  name: string;
  email?: string; // Added email field
  projectType: string;
  designStatus: string;
  functionalities: string[];
  details: string;
  budgetRange?: string; // O que o cliente "quer" gastar
  calculatedEstimation?: string; // O valor calculado pelo sistema
  contactMethod?: string;
  backendNeeds?: string;
  timeline?: string;
  referenceLinks?: string;
  targetAudience?: string;
  hasDomain?: string;
  hasHosting?: string;
  designFormat?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  projectType: string;
  budget: string;
  message: string;
}

export interface ChatbotProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onNavigate: (view: ViewType) => void;
  contextService?: ServicePackage | null;
  extraElevation?: boolean;
  initialMode?: 'sales' | 'support';
}

export type ProjectStatus = 'new' | 'briefing' | 'development' | 'review' | 'completed';

export interface ContractData {
  status: 'draft' | 'sent_to_client' | 'signed';
  adminSignature?: string | null;
  clientSignature?: string | null;
  sentAt?: string;
  signedAt?: string;
}

export interface PaymentOrder {
  id: string;
  description: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  expiresAt: string;
  pixCode: string;
  qrBase64?: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  url: string;
  size?: string;
  type?: string;
}

export interface ClientNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'payment';
  date: string;
  read: boolean;
}

export interface DetailedBriefingData {
  // 1. Estratégia
  businessSummary: string; // Resumo do negócio
  objective: string; // Objetivo principal do site
  targetAudience: string; // Público-alvo detalhado
  usp: string; // Diferencial único (Unique Selling Proposition)
  competitors: string; // Concorrentes

  // 2. Identidade Visual
  brandingStatus: string; // Tem manual de marca?
  colors: string; // Paleta de cores
  typographyPreference: string; // Preferência de fontes
  logoStatus: string; // Status do logo
  visualVibe: string; // Adjetivos (Moderno, Sério, Divertido...)

  // 3. Conteúdo & Estrutura
  sitemap: string; // Quais páginas?
  copyStatus: string; // Quem escreve os textos?
  mediaStatus: string; // Quem fornece fotos/vídeos?
  
  // 4. Referências
  referenceSites: string; // Links que gosta
  referenceDislikes: string; // O que NÃO gosta

  // 5. Funcionalidades
  functionalities: string[]; // Lista de features
  integrations: string; // Integrações externas (CRM, Pixel)
  
  // 6. Técnico
  hostingStatus: string;
  domainName: string;
  deadline: string;
  
  notes: string;
}

export interface ClientProject {
  id: string;
  clientName: string;
  cpf?: string; 
  email: string;
  projectName: string;
  status: ProjectStatus;
  progress: number;
  nextMilestone: string;
  dueDate: string;
  lastUpdate: string;
  previewUrl?: string; // Optional URL for project preview
  financial: {
    total: number;
    paid: number;
    status: 'pending' | 'partial' | 'paid';
    nextPaymentDate?: string;
  };
  tasks: Array<{ id: string; title: string; completed: boolean }>;
  files: ProjectFile[];
  links: { figma?: string; [key: string]: string | undefined };
  activity: Array<{ id: string; text: string; date: string; type: 'info' | 'success' | 'alert' }>;
  notifications: ClientNotification[];
  contract?: ContractData;
  paymentOrder?: PaymentOrder | null;
  tempPassword?: string;
  
  briefing?: DetailedBriefingData; // NOVO CAMPO ATUALIZADO
}

export interface DashboardMetric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: any;
}
