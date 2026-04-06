
import { 
  Code2, 
  Globe, 
  Rocket, 
  Zap,
  CheckCircle2,
  Palette,
  Terminal,
  Server,
  Briefcase,
  Search,
  LayoutTemplate,
  FileCode,
  Settings,
  FileEdit
} from 'lucide-react';
import { NavItem, ProcessStep, ServicePackage, Skill } from './types';
import { SERVICE_PACKAGES as CONFIG_PACKAGES, SKILLS as CONFIG_SKILLS, PROCESS_STEPS as CONFIG_STEPS, CONTACT_CONFIG as CONFIG_CONTACT } from './config';

// Re-exporting from config to maintain single source of truth while keeping file structure
export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', id: 'home' },
  { label: 'Sobre', id: 'about' },
  { label: 'Serviços', id: 'services' },
  { label: 'Portfólio', id: 'portfolio' },
  { label: 'Blog', id: 'blog' },
  { label: 'Processo', id: 'process' },
  { label: 'Contato', id: 'contact' },
];

export const SKILLS: Skill[] = CONFIG_SKILLS;

export const SERVICE_PACKAGES: ServicePackage[] = CONFIG_PACKAGES;

export const PROCESS_STEPS: ProcessStep[] = CONFIG_STEPS;

export const CONTACT_CONFIG = CONFIG_CONTACT;

export const WHATSAPP_NUMBER = CONFIG_CONTACT.WHATSAPP_NUMBER; 
export const EMAIL_CONTACT = CONFIG_CONTACT.EMAIL;