
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Check, ChevronRight, ChevronLeft, Send, Sparkles, Target, Palette, 
    Layout, Globe, FileText, Upload, Image, PenTool, 
    Smartphone, ShoppingCart, MessageSquare, Search, Zap, Lock, AlertTriangle, ServerOff, Monitor,
    HelpCircle, User, BarChart3, MousePointer2, ThumbsUp, ThumbsDown, Home, Type, MousePointerClick,
    DollarSign, Calendar, Coffee, Layers, Compass, RefreshCcw, Server, Star, Briefcase, ArrowUp, Menu, CheckCircle2,
    Database, Mail, Video, Share2, Map, Shield, Languages, Box, Headphones
} from 'lucide-react';
import { Button } from './Button';
import { useContent } from '../contexts/ContentContext';

// --- TYPES ---
interface BriefingOption {
    id: string;
    label: string;
    icon?: any;
    description?: string;
    visualColor?: string[]; 
    fontFamily?: string; 
    preview?: React.ReactNode; // New preview prop
}

interface QuestionStep {
    id: string;
    title: string;
    subtitle: string;
    expertTip?: string; 
    type: 'single' | 'multi' | 'text' | 'info' | 'agreement' | 'color-picker' | 'visual-style' | 'typography' | 'visual-layout';
    options?: BriefingOption[];
    placeholder?: string;
    required?: boolean;
    agreementText?: string;
}

interface ClientBriefingPageProps {
    forcedServiceType?: string;
    onCustomBack?: () => void;
}

// --- VISUAL COMPONENTS ---

const ColorPaletteOption = ({ colors, isSelected }: { colors: string[], isSelected: boolean }) => (
    <div className={`flex gap-1 p-2 rounded-full border-2 transition-all ${isSelected ? 'border-primary-600 scale-110 shadow-md' : 'border-transparent'}`}>
        {colors.map((c, i) => (
            <div key={i} className="w-6 h-6 rounded-full shadow-sm border border-black/10" style={{ backgroundColor: c }} />
        ))}
    </div>
);

const VisualStyleCard: React.FC<{ option: BriefingOption, isSelected: boolean, onClick: () => void }> = ({ option, isSelected, onClick }) => {
    const Icon = option.icon || Layout;
    return (
        <button
            onClick={onClick}
            className={`
                relative w-full text-left group overflow-hidden rounded-2xl border-2 transition-all duration-300
                ${isSelected 
                    ? 'border-primary-600 bg-primary-50/50 shadow-lg ring-1 ring-primary-600' 
                    : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-md'
                }
            `}
        >
            <div className={`h-24 flex items-center justify-center transition-colors ${isSelected ? 'bg-primary-100' : 'bg-gray-100 group-hover:bg-gray-50'}`}>
               <Icon size={40} className={isSelected ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-400'} strokeWidth={1.5} />
            </div>
            <div className="p-5">
                <h4 className={`font-bold text-base mb-1 ${isSelected ? 'text-primary-900' : 'text-gray-900'}`}>{option.label}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{option.description}</p>
            </div>
            {isSelected && (
                <div className="absolute top-3 right-3 bg-primary-600 text-white p-1 rounded-full shadow-sm">
                    <Check size={14} strokeWidth={3} />
                </div>
            )}
        </button>
    );
};

const LayoutPreviewCard: React.FC<{ option: BriefingOption, isSelected: boolean, onClick: () => void }> = ({ option, isSelected, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`
                relative w-full text-left group overflow-hidden rounded-2xl border-2 transition-all duration-300 h-full flex flex-col
                ${isSelected 
                    ? 'border-primary-600 bg-primary-50/30 ring-1 ring-primary-600 shadow-md' 
                    : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-sm'
                }
            `}
        >
            <div className="h-32 bg-gray-50 border-b border-gray-100 flex items-center justify-center p-4">
                {option.preview}
            </div>
            <div className="p-5 flex-1">
                <h4 className={`font-bold text-base mb-1 ${isSelected ? 'text-primary-900' : 'text-gray-900'}`}>{option.label}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{option.description}</p>
            </div>
            {isSelected && (
                <div className="absolute top-3 right-3 bg-primary-600 text-white p-1 rounded-full shadow-sm z-10">
                    <Check size={14} strokeWidth={3} />
                </div>
            )}
        </button>
    );
};

const TypographyCard: React.FC<{ option: BriefingOption, isSelected: boolean, onClick: () => void }> = ({ option, isSelected, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`
                relative w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between
                ${isSelected 
                    ? 'border-primary-600 bg-primary-50/50 ring-1 ring-primary-600 shadow-md' 
                    : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-gray-50'
                }
            `}
        >
            <div>
                <h4 className="text-2xl mb-1" style={{ fontFamily: option.fontFamily }}>Aa</h4>
                <span className="text-sm font-bold text-gray-900">{option.label}</span>
                <p className="text-xs text-gray-500 mt-1">{option.description}</p>
            </div>
            {isSelected && <div className="bg-primary-600 text-white p-1.5 rounded-full"><Check size={16}/></div>}
        </button>
    );
};

// --- MINI WIREFRAMES FOR LAYOUTS ---
const StickyHeaderPreview = () => (
    <div className="w-full h-full bg-white rounded-lg border border-gray-200 shadow-sm relative overflow-hidden flex flex-col">
        <div className="h-4 bg-primary-500 w-full shrink-0 shadow-sm z-10" />
        <div className="flex-1 bg-gray-50 overflow-hidden relative">
            <div className="w-full h-full flex flex-col gap-2 p-2 opacity-30">
                <div className="w-full h-16 bg-gray-300 rounded" />
                <div className="w-2/3 h-2 bg-gray-300 rounded" />
                <div className="w-full h-2 bg-gray-300 rounded" />
            </div>
        </div>
        {/* Scroll indicator implies sticky */}
        <div className="absolute bottom-1 right-1 text-[8px] bg-black/50 text-white px-1 rounded">Fixed</div>
    </div>
);

const SimpleHeaderPreview = () => (
    <div className="w-full h-full bg-white rounded-lg border border-gray-200 shadow-sm relative overflow-hidden flex flex-col">
        <div className="h-4 bg-gray-800 w-full shrink-0" />
        <div className="flex-1 bg-gray-50 p-2 opacity-30 flex flex-col gap-2">
             <div className="w-full h-8 bg-gray-300 rounded" />
             <div className="w-1/2 h-2 bg-gray-300 rounded" />
        </div>
    </div>
);

const SidebarPreview = () => (
    <div className="w-full h-full bg-white rounded-lg border border-gray-200 shadow-sm relative overflow-hidden flex">
        <div className="w-6 h-full bg-gray-800 shrink-0 flex flex-col items-center pt-2 gap-1">
            <div className="w-3 h-3 bg-white/20 rounded-full" />
            <div className="w-3 h-0.5 bg-white/20 rounded" />
            <div className="w-3 h-0.5 bg-white/20 rounded" />
        </div>
        <div className="flex-1 bg-gray-50 p-2 opacity-30 flex flex-col gap-2">
             <div className="w-full h-10 bg-gray-300 rounded" />
             <div className="w-3/4 h-2 bg-gray-300 rounded" />
        </div>
    </div>
);

export const ClientBriefingPage: React.FC<ClientBriefingPageProps> = ({ forcedServiceType, onCustomBack }) => {
    const { content } = useContent();
    const FORMSPREE_ID = content.contact.FORMSPREE_ID;

    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [serviceType, setServiceType] = useState<string>('general');
    const [steps, setSteps] = useState<QuestionStep[]>([]);
    
    // Ref para scrollar para o topo ao mudar de passo
    const topRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let type = 'general';
        if (forcedServiceType) {
            type = forcedServiceType;
        } else {
            const params = new URLSearchParams(window.location.search);
            type = params.get('service') || 'general';
        }
        setServiceType(type);
        setSteps(getDetailedSteps(type));
    }, [forcedServiceType]);

    useEffect(() => {
        // Scroll suave para o topo do card quando o passo mudar
        if (topRef.current) {
            topRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [currentStep]);

    // --- 15+ STEPS DETAILED FLOW ---
    const getDetailedSteps = (type: string): QuestionStep[] => {
        return [
            // --- FASE 1: INTRODUÇÃO & CONTEXTO ---
            {
                id: 'intro',
                title: "Briefing Interativo",
                subtitle: "Vou guiar você na definição do projeto perfeito. Você está no controle.",
                type: 'info',
                expertTip: "Este processo substitui 3 reuniões presenciais. Seja detalhista, isso economiza semanas de desenvolvimento."
            },
            {
                id: 'client_identity',
                title: "Quem é você?",
                subtitle: "Para começarmos, qual seu nome e qual cargo você ocupa?",
                type: 'text',
                placeholder: "Ex: Ana Souza, Diretora de Marketing...",
                expertTip: "Saber seu cargo me ajuda a adaptar a linguagem técnica durante o projeto."
            },
            {
                id: 'company_name',
                title: "Sobre a Empresa",
                subtitle: "Qual o nome do negócio/projeto que vamos transformar?",
                type: 'text',
                placeholder: "Ex: TechSolutions Ltda.",
                expertTip: "Vou pesquisar se este nome já existe no Google para garantir exclusividade."
            },
            {
                id: 'project_status',
                title: "Momento Atual",
                subtitle: "Em que fase estamos?",
                type: 'single',
                expertTip: "Redesigns exigem cuidado com SEO para não perder tráfego. Projetos novos exigem foco em descoberta.",
                options: [
                    { id: 'new', label: 'Projeto Novo (Do Zero)', icon: Sparkles, description: 'Não tenho site, quero criar o primeiro.' },
                    { id: 'redesign', label: 'Redesign (Reformulação)', icon: RefreshCcw, description: 'Tenho um site mas está antigo/feio.' },
                    { id: 'migration', label: 'Migração de Plataforma', icon: Server, description: 'Sair do Wix/WordPress para React.' },
                ]
            },

            // --- FASE 2: ESTRATÉGIA ---
            {
                id: 'primary_goal',
                title: "Objetivo Nº 1",
                subtitle: "Se o site pudesse fazer apenas UMA coisa, o que seria?",
                type: 'single',
                expertTip: "Sites que tentam fazer tudo não fazem nada. O foco aumenta a conversão em até 200%.",
                options: [
                    { id: 'leads', label: 'Gerar Leads (Contatos)', icon: User, description: 'Quero que preencham formulários.' },
                    { id: 'sales', label: 'Venda Direta', icon: ShoppingCart, description: 'Quero que comprem no site.' },
                    { id: 'branding', label: 'Autoridade/Branding', icon: Star, description: 'Quero impressionar e informar.' },
                    { id: 'whatsapp', label: 'Chamadas no WhatsApp', icon: MessageSquare, description: 'Quero conversar rapidamente.' },
                ]
            },
            {
                id: 'target_audience',
                title: "Público-Alvo",
                subtitle: "Quem é o cliente dos seus sonhos?",
                type: 'text',
                placeholder: "Ex: Mulheres de 25-40 anos, classe A/B, interessadas em moda sustentável...",
                expertTip: "Vou ajustar o tamanho da fonte, as cores e a linguagem baseando-me nessa resposta."
            },
            {
                id: 'competitors',
                title: "Concorrência",
                subtitle: "Quem são seus concorrentes diretos? (Cole os links)",
                type: 'text',
                placeholder: "1. www.concorrenteA.com.br\n2. www.concorrenteB.com",
                expertTip: "Não para copiar, mas para superá-los. Vou analisar o que eles fazem de errado."
            },

            // --- FASE 3: DESIGN & ESTILO (VISUAL) ---
            {
                id: 'visual_style',
                title: "Personalidade Visual",
                subtitle: "Qual a sensação que o site deve passar?",
                type: 'visual-style',
                expertTip: "O design deve refletir a marca, não apenas o gosto pessoal. Pense no que atrai seu cliente.",
                options: [
                    { id: 'minimal', label: 'Minimalista & Clean', icon: Layout, description: 'Muito branco, respiro, sofisticação.' },
                    { id: 'bold', label: 'Bold & Impactante', icon: Zap, description: 'Fontes grandes, alto contraste, energia.' },
                    { id: 'tech', label: 'Tech & Dark Mode', icon: Monitor, description: 'Fundo escuro, neon, futurista.' },
                    { id: 'corporate', label: 'Corporativo & Sério', icon: Briefcase, description: 'Azul, estruturado, confiança.' },
                ]
            },
            {
                id: 'colors',
                title: "Paleta de Cores",
                subtitle: "Selecione a combinação que mais agrada:",
                type: 'color-picker',
                expertTip: "Cores influenciam 85% da decisão de compra. Azul acalma, vermelho alerta, preto luxa.",
                options: [
                    { id: 'blue', label: 'Confiança (Azuis)', visualColor: ['#1e3a8a', '#3b82f6', '#bfdbfe'] },
                    { id: 'dark', label: 'Premium (Preto/Gold)', visualColor: ['#000000', '#fbbf24', '#525252'] },
                    { id: 'green', label: 'Natureza/Saúde (Verdes)', visualColor: ['#14532d', '#22c55e', '#bbf7d0'] },
                    { id: 'vibrant', label: 'Criativo (Roxo/Rosa)', visualColor: ['#7c3aed', '#ec4899', '#f3e8ff'] },
                    { id: 'custom', label: 'Tenho minha paleta', visualColor: ['#ccc', '#999', '#666'], description: 'Descreverei nas observações.' }
                ]
            },
            {
                id: 'typography',
                title: "Tipografia",
                subtitle: "Qual estilo de letra combina mais com sua voz?",
                type: 'typography',
                expertTip: "Serifas passam tradição. Sem serifas passam modernidade. Monoespaçadas passam tecnologia.",
                options: [
                    { id: 'sans', label: 'Moderna (Sans Serif)', description: 'Limpa, geométrica, fácil de ler. (Ex: Inter)', fontFamily: 'Inter, sans-serif' },
                    { id: 'serif', label: 'Clássica (Serif)', description: 'Elegante, editorial, tradicional. (Ex: Playfair)', fontFamily: 'Playfair Display, serif' },
                    { id: 'mono', label: 'Técnica (Monospace)', description: 'Código, dados, brutalismo. (Ex: Fira Code)', fontFamily: 'Fira Code, monospace' },
                ]
            },
            {
                id: 'nav_style',
                title: "Navegação",
                subtitle: "Como o usuário deve navegar?",
                type: 'visual-layout',
                expertTip: "Menus fixos (Sticky) aumentam a retenção em 20%. Menus laterais são ótimos para apps.",
                options: [
                    { id: 'sticky', label: 'Topo Fixo (Sticky)', preview: <StickyHeaderPreview/>, description: 'O menu acompanha o scroll. Ideal para CTAs constantes.' },
                    { id: 'simple', label: 'Simples (Topo)', preview: <SimpleHeaderPreview/>, description: 'Menu clássico no topo. Desaparece ao rolar.' },
                    { id: 'sidebar', label: 'Lateral / Gaveta', preview: <SidebarPreview/>, description: 'Menu vertical na esquerda. Estilo Dashboard.' },
                ]
            },

            // --- FASE 4: CONTEÚDO & RECURSOS ---
            {
                id: 'content_readiness',
                title: "Status do Conteúdo",
                subtitle: "Textos e Fotos estão prontos?",
                type: 'single',
                expertTip: "O atraso nº 1 em projetos é a entrega de texto. Se não tiver, posso usar placeholders.",
                options: [
                    { id: 'ready', label: 'Tenho Tudo Pronto', icon: Check, description: 'Textos finais e fotos em alta.' },
                    { id: 'partial', label: 'Tenho Parcial', icon: FileText, description: 'Tenho a base, falta refinar.' },
                    { id: 'creating', label: 'Vou Criar Agora', icon: PenTool, description: 'Escreverei durante o projeto.' },
                ]
            },
            {
                id: 'features',
                title: "Funcionalidades",
                subtitle: "O que o site PRECISA ter? (Multipla escolha)",
                type: 'multi',
                expertTip: "Cada funcionalidade adiciona valor e complexidade. Selecione as essenciais para o MVP.",
                options: [
                    { id: 'whatsapp', label: 'Botão WhatsApp Flutuante', icon: MessageSquare, description: 'Chat direto.' },
                    { id: 'form', label: 'Formulário de Contato', icon: Send, description: 'Envio p/ email.' },
                    { id: 'blog', label: 'Blog / Notícias', icon: FileText, description: 'Artigos dinâmicos.' },
                    { id: 'maps', label: 'Mapa Interativo', icon: Map, description: 'Google Maps embed.' },
                    { id: 'gallery', label: 'Galeria / Portfólio', icon: Image, description: 'Grid de fotos.' },
                    { id: 'video', label: 'Vídeo Background', icon: Video, description: 'Capa com vídeo.' },
                    { id: 'analytics', label: 'Google Analytics 4', icon: BarChart3, description: 'Métricas.' },
                    { id: 'pixel', label: 'Pixel do Facebook', icon: Target, description: 'Para anúncios.' },
                    { id: 'crm', label: 'Integração CRM', icon: Database, description: 'Leads no sistema.' },
                    { id: 'multilang', label: 'Multi-idiomas', icon: Languages, description: 'PT/EN/ES.' },
                    { id: 'lgpd', label: 'Banner de Cookies (LGPD)', icon: Shield, description: 'Aviso legal.' },
                    { id: 'search', label: 'Busca no Site', icon: Search, description: 'Campo de pesquisa.' },
                    { id: 'newsletter', label: 'Newsletter', icon: Mail, description: 'Captura de email.' },
                    { id: 'faq', label: 'FAQ (Sanfona)', icon: HelpCircle, description: 'Perguntas frequentes.' },
                    { id: 'chat', label: 'Chat Online (Jivo/Tawk)', icon: Headphones, description: 'Suporte real.' },
                ]
            },
            {
                id: 'inspiration_links',
                title: "Inspiração",
                subtitle: "Cole links de sites que você ama (mesmo de outras áreas).",
                type: 'text',
                placeholder: "Gosto do site da Apple pela limpeza. Gosto do Nubank pelas cores...",
                expertTip: "Referências visuais evitam o 'não era bem isso que eu queria' no final."
            },

            // --- FASE 5: TÉCNICO & ORÇAMENTO ---
            {
                id: 'domain_hosting',
                title: "Domínio & Hospedagem",
                subtitle: "Você já possui o endereço (www)?",
                type: 'single',
                expertTip: "Se não tiver, eu cuido da configuração técnica para você.",
                options: [
                    { id: 'have_both', label: 'Tenho Domínio e Hospedagem', icon: CheckCircle2 },
                    { id: 'have_domain', label: 'Tenho só o Domínio', icon: Globe },
                    { id: 'have_nothing', label: 'Não tenho nada', icon: HelpCircle },
                ]
            },
            {
                id: 'deadline',
                title: "Prazo Ideal",
                subtitle: "Para quando você precisa disso no ar?",
                type: 'single',
                expertTip: "Prazos urgentes (< 7 dias) podem ter taxa de urgência. Prazos normais garantem mais polimento.",
                options: [
                    { id: 'asap', label: 'Urgente (ASAP)', icon: Zap, description: 'O mais rápido possível.' },
                    { id: '15_days', label: '15 a 20 Dias', icon: Calendar, description: 'Prazo padrão confortável.' },
                    { id: '30_days', label: '30+ Dias', icon: Coffee, description: 'Sem pressa, foco total em detalhes.' },
                ]
            },
            {
                id: 'budget_range',
                title: "Investimento",
                subtitle: "Qual faixa de valor se adequa ao seu momento?",
                type: 'single',
                expertTip: "Isso me ajuda a sugerir a melhor solução técnica dentro da sua realidade.",
                options: [
                    { id: 'low', label: 'Até R$ 2.000', icon: DollarSign, description: 'Soluções express e one-page.' },
                    { id: 'mid', label: 'R$ 2.000 - R$ 5.000', icon: DollarSign, description: 'Sites completos e personalizados.' },
                    { id: 'high', label: 'Acima de R$ 5.000', icon: DollarSign, description: 'Projetos complexos e exclusivos.' },
                ]
            },

            // --- FINAL ---
            {
                id: 'tech_agreement',
                title: "Termo Técnico",
                subtitle: "Alinhamento final para garantirmos o sucesso.",
                type: 'agreement',
                expertTip: "Transparência é a chave. Eu cuido do código visual, você foca no seu negócio.",
                agreementText: "Entendo que o serviço contratado é de DESENVOLVIMENTO FRONTEND (Interface Visual e Interatividade). O projeto NÃO inclui a criação de sistemas complexos de backend (como áreas de membros com login, painéis administrativos complexos ou banco de dados dinâmico), salvo se acordado explicitamente à parte."
            },
            {
                id: 'contact_final',
                title: "Último Passo",
                subtitle: "Onde envio a proposta detalhada?",
                type: 'text',
                placeholder: "Seu WhatsApp (com DDD): \nSeu E-mail:",
                expertTip: "Vou analisar suas 18 respostas e criar uma proposta que resolve exatamente o seu problema."
            }
        ];
    };

    const stepData = steps[currentStep];
    const progress = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

    // --- FUNÇÃO MODIFICADA: SEM AUTO-SKIP ---
    const handleOptionToggle = (optionId: string) => {
        if (!stepData) return;
        
        // Apenas atualiza o estado, NÃO avança
        if (['single', 'visual-style', 'color-picker', 'typography', 'visual-layout'].includes(stepData.type)) {
            setAnswers(prev => ({ ...prev, [stepData.id]: optionId }));
        } 
        else if (stepData.type === 'multi') {
            const current = answers[stepData.id] || [];
            const updated = current.includes(optionId) 
                ? current.filter((item: string) => item !== optionId)
                : [...current, optionId];
            setAnswers(prev => ({ ...prev, [stepData.id]: updated }));
        }
    };

    const handleTextChange = (text: string) => {
        setAnswers(prev => ({ ...prev, [stepData.id]: text }));
    };

    const handleAgreement = () => {
        setAnswers(prev => ({ ...prev, [stepData.id]: !prev[stepData.id] }));
    };

    // --- NAVEGAÇÃO EXPLÍCITA ---
    const handleNext = () => {
        // Validação Simples
        if (stepData.required && !answers[stepData.id]) {
            alert("Por favor, preencha este campo para continuar.");
            return;
        }
        if (stepData.type === 'agreement' && !answers[stepData.id]) {
            alert("Por favor, confirme a leitura do termo técnico.");
            return;
        }

        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        } else if (onCustomBack) {
            onCustomBack();
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        
        // IMPROVED PAYLOAD STRUCTURE
        const payload: any = {
            _subject: `🚀 Briefing: ${answers['company_name'] || 'Novo Projeto'}`,
            _replyto: answers['email'] || '', // If available, though usually extracted from contact_final text
            
            // --- HEADER ---
            "=== 1. CLIENTE & CONTEXTO ===": "==========================",
            "NOME/CARGO": answers['client_identity'],
            "EMPRESA": answers['company_name'],
            "STATUS ATUAL": answers['project_status'],
            
            // --- STRATEGY ---
            "=== 2. ESTRATÉGIA ===": "==========================",
            "OBJETIVO": answers['primary_goal'],
            "PÚBLICO-ALVO": answers['target_audience'],
            "CONCORRÊNCIA": answers['competitors'],
            
            // --- VISUAL ---
            "=== 3. IDENTIDADE VISUAL ===": "==========================",
            "ESTILO": answers['visual_style'],
            "CORES": answers['colors'],
            "TIPOGRAFIA": answers['typography'],
            "LAYOUT NAV": answers['nav_style'],
            "REF. VISUAIS": answers['inspiration_links'],
            
            // --- SCOPE ---
            "=== 4. ESCOPO & RECURSOS ===": "==========================",
            "CONTEÚDO PRONTO?": answers['content_readiness'],
            "FUNCIONALIDADES": Array.isArray(answers['features']) ? answers['features'].join(', ') : answers['features'],
            
            // --- TECH ---
            "=== 5. TÉCNICO & PRAZO ===": "==========================",
            "INFRA (DOMÍNIO/HOST)": answers['domain_hosting'],
            "PRAZO DESEJADO": answers['deadline'],
            "ORÇAMENTO": answers['budget_range'],
            
            // --- CONTACT ---
            "=== 6. CONTATO FINAL ===": "==========================",
            "DADOS DE CONTATO": answers['contact_final']
        };

        if (FORMSPREE_ID && FORMSPREE_ID !== 'SEU_ID_AQUI') {
            try {
                await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
                    method: 'POST',
                    body: JSON.stringify(payload),
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
                });
            } catch (e) {
                console.error("Erro envio", e);
            }
        } else {
            await new Promise(r => setTimeout(r, 1500));
        }

        setIsSubmitting(false);
        setIsSuccess(true);
    };

    // --- RENDERIZADORES DE ÍCONES DE IMPORTAÇÃO ---
    // (Necessário pois o ícone vem como objeto React e não string em alguns casos)
    // No código acima, importamos ArrowUp, Menu, CheckCircle2, RefreshCcw, etc.

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white max-w-lg w-full rounded-3xl shadow-2xl p-10 text-center"
                >
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check size={48} className="text-green-600" />
                    </div>
                    <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">Briefing Recebido!</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        Você completou todas as etapas. Tenho tudo que preciso para criar uma proposta cirúrgica para o projeto <strong>{answers['company_name']}</strong>.
                        <br/><br/>Entrarei em contato em breve com a estimativa de horas e valor.
                    </p>
                    <Button onClick={() => onCustomBack ? onCustomBack() : window.location.href = '/'} className="w-full justify-center">
                        {onCustomBack ? 'Fechar Janela' : 'Voltar ao Site'}
                    </Button>
                </motion.div>
            </div>
        );
    }

    if (!stepData) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

    // Helper para verificar se o botão "Próximo" deve estar habilitado
    const isNextDisabled = () => {
        if (stepData.type === 'info') return false; // Info sempre pode avançar
        if (stepData.type === 'text') return !answers[stepData.id] || answers[stepData.id].length < 2;
        if (stepData.type === 'agreement') return !answers[stepData.id];
        // Para seletores, precisa ter algo selecionado
        if (['single', 'multi', 'visual-style', 'color-picker', 'typography', 'visual-layout'].includes(stepData.type)) {
            const val = answers[stepData.id];
            if (Array.isArray(val)) return val.length === 0;
            return !val;
        }
        return false;
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col items-center justify-center p-4 md:p-6 transition-colors duration-500">
            
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 h-full md:h-auto min-h-[600px]">
                
                {/* LEFT COLUMN: QUESTION CARD */}
                <motion.div 
                    layout
                    ref={topRef}
                    className="lg:col-span-8 bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col relative z-10 border border-gray-100"
                >
                    {/* Header Bar */}
                    <div className="bg-white px-8 py-6 border-b border-gray-100 flex justify-between items-center sticky top-0 z-20">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-2 py-0.5 rounded">Etapa {currentStep + 1} de {steps.length}</span>
                            </div>
                            <div className="h-1.5 w-32 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div className="h-full bg-primary-600" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {onCustomBack && (
                                <button onClick={onCustomBack} className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-gray-50 rounded-full" title="Sair">
                                    <ThumbsDown size={18} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 p-8 md:p-12 flex flex-col">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={stepData.id}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.3 }}
                                className="flex-1 flex flex-col"
                            >
                                <div className="mb-8">
                                    <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-3 leading-tight">{stepData.title}</h2>
                                    <p className="text-lg text-gray-500 font-light">{stepData.subtitle}</p>
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 max-h-[60vh] lg:max-h-none pb-4">
                                    
                                    {/* --- INFO TYPE --- */}
                                    {stepData.type === 'info' && (
                                        <div className="flex flex-col items-center justify-center py-10 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm text-primary-600">
                                                <MousePointer2 size={40} />
                                            </div>
                                            <p className="text-gray-600 max-w-md mx-auto text-lg leading-relaxed px-4">
                                                Você está no controle. Navegue pelas perguntas, volte se mudar de ideia e construa o escopo ideal para o seu negócio.
                                            </p>
                                        </div>
                                    )}

                                    {/* --- AGREEMENT TYPE --- */}
                                    {stepData.type === 'agreement' && (
                                        <div className="py-4 space-y-6">
                                            <div className="bg-orange-50 border-l-4 border-orange-400 p-6 rounded-r-xl">
                                                <div className="flex items-center gap-2 mb-3 text-orange-800 font-bold uppercase text-sm"><AlertTriangle size={18}/> Escopo Técnico</div>
                                                <p className="text-orange-900 text-sm md:text-base leading-relaxed">{stepData.agreementText}</p>
                                            </div>
                                            <button onClick={handleAgreement} className={`w-full p-5 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-3 ${answers[stepData.id] ? 'bg-primary-600 border-primary-600 text-white shadow-lg' : 'border-gray-200 hover:border-primary-400 hover:bg-gray-50 text-gray-600'}`}>
                                                {answers[stepData.id] ? <Check size={22} /> : <div className="w-6 h-6 border-2 border-current rounded-md" />}
                                                <span>Li, compreendi e concordo</span>
                                            </button>
                                        </div>
                                    )}

                                    {/* --- VISUAL STYLE TYPE --- */}
                                    {stepData.type === 'visual-style' && stepData.options && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {stepData.options.map(opt => (
                                                <VisualStyleCard 
                                                    key={opt.id} 
                                                    option={opt} 
                                                    isSelected={answers[stepData.id] === opt.id} 
                                                    onClick={() => handleOptionToggle(opt.id)} 
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* --- LAYOUT TYPE (NEW) --- */}
                                    {stepData.type === 'visual-layout' && stepData.options && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {stepData.options.map(opt => (
                                                <LayoutPreviewCard 
                                                    key={opt.id} 
                                                    option={opt} 
                                                    isSelected={answers[stepData.id] === opt.id} 
                                                    onClick={() => handleOptionToggle(opt.id)} 
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* --- TYPOGRAPHY TYPE --- */}
                                    {stepData.type === 'typography' && stepData.options && (
                                        <div className="space-y-4">
                                            {stepData.options.map(opt => (
                                                <TypographyCard
                                                    key={opt.id}
                                                    option={opt}
                                                    isSelected={answers[stepData.id] === opt.id}
                                                    onClick={() => handleOptionToggle(opt.id)}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* --- COLOR PICKER TYPE --- */}
                                    {stepData.type === 'color-picker' && stepData.options && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {stepData.options.map(opt => (
                                                <button key={opt.id} onClick={() => handleOptionToggle(opt.id)} className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left group ${answers[stepData.id] === opt.id ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600' : 'border-gray-100 hover:border-primary-200 hover:bg-gray-50'}`}>
                                                    <ColorPaletteOption colors={opt.visualColor || []} isSelected={answers[stepData.id] === opt.id} />
                                                    <div className="flex-1">
                                                        <span className={`font-bold text-sm block ${answers[stepData.id] === opt.id ? 'text-primary-900' : 'text-gray-700'}`}>{opt.label}</span>
                                                        {opt.description && <span className="text-xs text-gray-400">{opt.description}</span>}
                                                    </div>
                                                    {answers[stepData.id] === opt.id && <Check size={18} className="text-primary-600" />}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* --- STANDARD OPTIONS (SINGLE/MULTI) --- */}
                                    {(stepData.type === 'single' || stepData.type === 'multi') && stepData.options && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {stepData.options.map((option) => {
                                                const isSelected = stepData.type === 'multi' ? (answers[stepData.id] || []).includes(option.id) : answers[stepData.id] === option.id;
                                                const Icon = option.icon || Sparkles;
                                                return (
                                                    <button 
                                                        key={option.id} 
                                                        onClick={() => handleOptionToggle(option.id)} 
                                                        className={`
                                                            flex items-start gap-4 p-5 rounded-2xl border-2 transition-all group text-left h-full
                                                            ${isSelected 
                                                                ? 'border-primary-600 bg-primary-50 text-primary-900 ring-1 ring-primary-600 shadow-md transform scale-[1.02]' 
                                                                : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50 text-gray-600 hover:shadow-sm'
                                                            }
                                                        `}
                                                    >
                                                        <div className={`p-2 rounded-xl shrink-0 transition-colors ${isSelected ? 'bg-white text-primary-600 shadow-sm' : 'bg-gray-100 text-gray-400 group-hover:bg-white group-hover:text-primary-500'}`}>
                                                            <Icon size={22} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <span className="font-bold text-sm block mb-1">{option.label}</span>
                                                            {option.description && <span className="text-xs opacity-80 font-medium leading-relaxed block">{option.description}</span>}
                                                        </div>
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-colors ${isSelected ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-300'}`}>
                                                            {isSelected && <Check size={12} strokeWidth={4} />}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* --- TEXT INPUT --- */}
                                    {stepData.type === 'text' && (
                                        <div className="relative group">
                                            <textarea
                                                autoFocus
                                                value={answers[stepData.id] || ''}
                                                onChange={(e) => handleTextChange(e.target.value)}
                                                placeholder={stepData.placeholder}
                                                className="w-full h-48 bg-white border-2 border-gray-200 rounded-2xl p-6 text-lg focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none resize-none transition-all placeholder:text-gray-300 shadow-sm group-hover:border-gray-300"
                                            />
                                            <div className="absolute bottom-4 right-4 text-xs text-gray-400 pointer-events-none bg-white px-2 rounded font-mono">
                                                {(answers[stepData.id] || '').length} chars
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer Controls */}
                    <div className="p-6 md:p-8 border-t border-gray-100 flex justify-between items-center bg-white sticky bottom-0 z-20">
                        <button 
                            onClick={handlePrev} 
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-colors text-gray-500 hover:bg-gray-100 hover:text-gray-900`}
                        >
                            <ChevronLeft size={18} /> Voltar
                        </button>
                        
                        <Button 
                            onClick={handleNext} 
                            isLoading={isSubmitting} 
                            disabled={isNextDisabled()}
                            size="lg" 
                            className="px-10 shadow-xl shadow-primary-600/20 disabled:opacity-50 disabled:cursor-not-allowed" 
                            rightIcon={currentStep === steps.length - 1 ? <Send size={18} /> : <ChevronRight size={18} />}
                        >
                            {currentStep === steps.length - 1 ? 'Finalizar e Enviar' : 'Continuar'}
                        </Button>
                    </div>
                </motion.div>

                {/* RIGHT COLUMN: EXPERT TIPS */}
                <div className="lg:col-span-4 flex flex-col gap-6 pt-8 lg:pt-0">
                    <AnimatePresence mode="wait">
                        {stepData.expertTip && (
                            <motion.div 
                                key={`tip-${stepData.id}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: 0.2 }}
                                className="bg-gray-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden group border border-gray-800"
                            >
                                <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-yellow-400 ring-1 ring-white/20">
                                            <Sparkles size={20} fill="currentColor" />
                                        </div>
                                        <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-gray-400">Consultoria</h3>
                                    </div>
                                    <p className="text-lg font-light leading-relaxed text-gray-100">
                                        "{stepData.expertTip}"
                                    </p>
                                    <div className="mt-8 flex items-center gap-3 opacity-60 text-xs border-t border-white/10 pt-4">
                                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center font-bold">PH</div>
                                        <div>
                                            <p className="font-bold text-white">PH Boechat</p>
                                            <p>Frontend Engineer</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Progress Helper */}
                    <div className="hidden lg:flex flex-col gap-2">
                        {steps.map((s, i) => (
                            <div key={s.id} className="flex items-center gap-3 text-xs">
                                <div className={`w-2 h-2 rounded-full ${i === currentStep ? 'bg-primary-600 animate-pulse' : i < currentStep ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                                <span className={`${i === currentStep ? 'font-bold text-gray-900' : 'text-gray-400'}`}>{s.title}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};
