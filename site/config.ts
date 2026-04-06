
import { Code2, Globe, Rocket, Zap, CheckCircle2, Palette, Terminal, Server, Briefcase, Search, LayoutTemplate, FileCode, Settings, FileEdit, LucideIcon, Cpu, Ticket, Lightbulb, BookOpen, Calendar } from 'lucide-react';
import { NavItem, ProcessStep, ServicePackage, Skill, Project, FAQ } from './types';

// --- PERFORMANCE FLAGS ---
export const PERFORMANCE_CONFIG = {
  // Define se o HUD de performance deve aparecer
  ENABLE_PERFORMANCE_HUD: true, 
  // Define o intervalo de atualização do monitoramento (ms)
  METRICS_UPDATE_INTERVAL: 1000
};

// --- NOTIFICATIONS CENTER (NOVIDADES) ---
export const NOTIFICATIONS_CONFIG = {
  ENABLED: true, // <--- ATIVE OU DESATIVE AQUI
  ITEMS: [
    {
      id: 'priority_promo',
      type: 'promo', // 'promo' | 'info' | 'tip'
      icon: Calendar,
      title: 'Prioridade na Agenda',
      text: 'A agenda para este mês está fechando. Inicie seu projeto hoje e garanta desenvolvimento imediato sem fila de espera.',
      code: '#PRIORITY',
      actionLabel: 'Garantir Vaga'
    },
    {
      id: 'how_to',
      type: 'info',
      icon: BookOpen,
      title: 'Como funciona?',
      text: 'O processo é simples: Briefing > Proposta > Criação. Veja o passo a passo detalhado.',
      actionLink: 'process',
      actionLabel: 'Ver Processo'
    },
    {
      id: 'perf_tip',
      type: 'tip',
      icon: Lightbulb,
      title: 'Dica de Performance',
      text: 'Sabia que cada segundo de carregamento custa 7% em conversão? Meu foco é velocidade extrema.',
      actionLink: 'blog',
      actionLabel: 'Ler Artigo'
    }
  ]
};

// --- ANALYTICS ---
export const ANALYTICS_CONFIG = {
  // Substitua pelo seu ID real do GA4 (ex: G-XXXXXXXXXX)
  GA_MEASUREMENT_ID: 'G-XXXXXXXXXX', 
};

// --- PERSONAL & CONTACT INFO ---
export const CONTACT_CONFIG = {
  WHATSAPP_NUMBER: "5561993254324", // Format: CountryCodeAreaCodeNumber
  EMAIL: "contato@phstatic.com.br",
  INSTAGRAM_URL: "https://instagram.com/philippeboechat",
  GITHUB_URL: "https://github.com", // Adicionado para SEO SameAs
  // ACESSE https://formspree.io/ para criar seu formulário gratuito e cole o ID abaixo
  // Exemplo: "xdoqkzqa"
  FORMSPREE_ID: "manrbopn", 
  
  // SEO LOCAL DATA
  ADDRESS_COUNTRY: "BR",
  ADDRESS_REGION: "DF",
  ADDRESS_LOCALITY: "Brasília",
  GEO_LAT: "-15.7975",
  GEO_LONG: "-47.8919",
  PRICE_RANGE: "$$"
};

// --- SITE META ---
export const SITE_CONFIG = {
  TITLE: "PH.static",
  SUBTITLE: "Portfolio Profissional",
  URL: "https://phstatic.com.br", // Importante para Canonical
  DESCRIPTION: "Construindo interfaces digitais que combinam estética premium, alta performance e resultados estratégicos para o seu negócio.",
  COPYRIGHT: `© ${new Date().getFullYear()} PH.static. Todos os direitos reservados.`
};

// --- NAVIGATION ---
export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', id: 'home' },
  { label: 'Sobre', id: 'about' },
  { label: 'Serviços', id: 'services' },
  { label: 'Portfólio', id: 'portfolio' },
  { label: 'Blog', id: 'blog' },
  { label: 'Processo', id: 'process' },
  { label: 'FAQ', id: 'faq' }, // Added to Nav
  { label: 'Contato', id: 'contact' },
];

// --- HERO SECTION CONFIG ---
export const HERO_CONFIG = {
  // OPTIONS: 'default' | 'vscode'
  STYLE: 'default', 
  
  STATUS_BADGE: "Engenharia Aumentada & Alta Performance",
  TITLE_PREFIX: "Construo interfaces",
  TITLE_HIGHLIGHT: "de precisão",
  DYNAMIC_WORDS: ["Pixel-Perfect", "Zero-Latência", "Escaláveis", "Algorítmicas", "Instantâneas", "Imersivas", "High-End", "Robustas"],
  
  // Updated Copy for AI Positioning
  SUBTITLE_START: "Expertise humana, precisão algorítmica. Transformo sua visão em código",
  SUBTITLE_HIGHLIGHT_1: "limpo, eficiente",
  SUBTITLE_MIDDLE: " e validado para a ",
  SUBTITLE_HIGHLIGHT_2: "máxima performance",
  SUBTITLE_END: " do seu negócio.",
  
  CTA_PRIMARY: "Investir na Próxima Etapa", // Option 1 selected
  CTA_SECONDARY: "Ver Projetos"
};

// --- EASTER EGG CONFIG (THE MATRIX / GLITCH MODE) ---
export const EASTER_EGG_CONFIG = {
  ENABLED: false,
  ALLOW_RETRY: false, 
  KONAMI_CODE: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
  LOGO_CLICKS_REQUIRED: 5,
  SECRET_TOKEN: "IA_MASTER_10",
  CONSOLE_HINT: "🔍 Curious? Try the classic Konami Code or tap the logo 5 times..."
};

// --- ABOUT SECTION ---

const ABOUT_MODE: 'default' | 'ai' = 'ai';

const PROFILES = {
  default: {
    TITLE: "Quem está por trás",
    SUBTITLE: "Mais do que código: parceiro estratégico do seu negócio.",
    PARAGRAPHS: [
      "Olá! Sou o PH, um Engenheiro Frontend Sênior apaixonado por unir design e tecnologia. Minha missão não é apenas \"fazer sites\", mas construir ferramentas digitais que impulsionem vendas e autoridade.",
      "Com especialização profunda no ecossistema React & TypeScript, elimino a complexidade técnica para entregar interfaces limpas, rápidas e prontas para escalar."
    ],
    HIGHLIGHTS: [
      { title: "Qualidade Premium", desc: "Design refinado e código limpo." },
      { title: "Performance Extrema", desc: "Sites otimizados para o Google." }
    ]
  },
  ai: {
    TITLE: "Engenharia Aumentada",
    SUBTITLE: "Onde a expertise sênior encontra a aceleração algorítmica.",
    PARAGRAPHS: [
      "Na era da Inteligência Artificial, meu papel evoluiu de desenvolvedor para Engenheiro-Chefe da Produção. Eu opero sob o paradigma da Engenharia Aumentada, que não é uma opção, mas sim o novo padrão de mercado para velocidade e excelência.",
      "Utilizo o poder da IA como um motor de produção para eliminar o risco e o desperdício de tempo. A automação das tarefas de boilerplate e codificação repetitiva resulta em uma economia de tempo que é reinvestida diretamente na otimização da arquitetura e na melhoria do UX/UI.",
      "A IA atua como uma camada de QA (Quality Assurance) algorítmico em tempo real. Isso significa que a performance, acessibilidade e as especificações Pixel-Perfect são validadas em cada linha de código. O resultado é a garantia de um produto final zero-bug.",
      "Você contrata meu domínio de anos de mercado e minha visão estratégica; a IA garante a sua velocidade e precisão. O resultado é a entrega de um código de nível C-Suite, com arquitetura sólida e validação tecnológica."
    ],
    HIGHLIGHTS: [
      { title: "Velocidade 10x", desc: "Produção acelerada por IA." },
      { title: "Zero Bugs", desc: "Validação algorítmica constante." }
    ]
  }
};

export const ABOUT_CONFIG = {
  IMAGE_URL: "https://i.imgur.com/TNMBi27.jpeg",
  EXPERIENCE_YEARS: "Philippe Boechat",
  ...PROFILES[ABOUT_MODE]
};

// --- SKILLS ---
export const SKILLS: Skill[] = [
  { name: 'HTML5/CSS3', icon: Code2, color: 'text-orange-500' },
  { name: 'React.js', icon: Zap, color: 'text-blue-500' },
  { name: 'Tailwind CSS', icon: Palette, color: 'text-cyan-500' },
  { name: 'JavaScript', icon: Terminal, color: 'text-yellow-500' },
  { name: 'Responsividade', icon: Globe, color: 'text-green-600' },
  // Git removido
];

// --- SERVICES ---
export const SERVICE_PACKAGES: ServicePackage[] = [
  {
    id: 'essential',
    title: 'Landing Page Express',
    subtitle: 'Página Única de Vendas',
    purpose: 'Ideal para lançar seu produto ou serviço rapidamente na internet.',
    recommendedFor: 'Autônomos, Pequenos Negócios, Promoções.',
    details: 'Uma página focada em conversão, leve e direta ao ponto.',
    price: 'A partir de R$ 900',
    techStack: ['React', 'TailwindCSS', 'Vite'],
    features: [
      'Site de Página Única (One Page)',
      'Totalmente Adaptado para Celular',
      'Arquivo de Edição Fácil (Textos)',
      'Botões de WhatsApp/Contato',
      'Hospedagem Gratuita'
    ],
    icon: Rocket,
    highlight: false,
    fullDescription: "A Landing Page Express é a solução perfeita para quem está começando e precisa de presença digital \"para ontem\". Eu crio uma página limpa, bonita e organizada, onde seu cliente entende o que você vende e clica no botão de comprar ou chamar no WhatsApp. Sem enrolação técnica, foco no resultado.",
    deliverables: [
      "Desenvolvimento em React (Tecnologia moderna)",
      "Até 4 seções (Ex: Capa, Sobre, Serviços, Contato)",
      "Arquivo de Configuração para editar textos facilmente",
      "Configuração do seu Domínio (.com.br)",
      "Links testados para suas redes sociais"
    ],
    notIncluded: [
      "Painel Administrativo (Wordpress/CMS)",
      "Criação de Logo ou Identidade Visual",
      "Banco de Dados ou Login de Usuário"
    ],
    timeline: "3 a 7 dias úteis.",
    faqs: [
      {
        question: "Como edito os textos sem painel?",
        answer: "Eu entrego um arquivo de configuração simples. Você altera o texto lá e o site atualiza. Não precisa saber programar, é só mudar as frases entre aspas!"
      },
      {
        question: "Preciso pagar mensalidade?",
        answer: "Pela minha parte, não! O código é seu. Você terá custos apenas anuais do domínio (aprox. R$ 40/ano)."
      },
      {
        question: "Funciona no celular?",
        answer: "Sim! Desenvolvo pensando primeiro no celular (Mobile First), garantindo que fique perfeito em qualquer tela."
      }
    ]
  },
  {
    id: 'business',
    title: 'Site Profissional',
    subtitle: 'Presença Digital Completa',
    purpose: 'Para empresas que precisam passar mais credibilidade e informações.',
    recommendedFor: 'Consultórios, Escritórios, Agências, Prestadores de Serviço.',
    details: 'Site com múltiplas páginas (Home, Sobre, Serviços, Contato).',
    price: 'A partir de R$ 1.800',
    techStack: ['React', 'Next.js', 'Tailwind', 'Forms'],
    features: [
      'Até 5 Páginas Internas',
      'Arquivo de Edição Fácil (Textos)',
      'Formulário de Contato Funcional',
      'Mapa de Localização',
      'Boas práticas de SEO'
    ],
    icon: Briefcase,
    highlight: true,
    fullDescription: "O Site Profissional é o cartão de visitas digital da sua empresa. Diferente da Landing Page, aqui temos espaço para contar sua história, detalhar cada serviço em páginas separadas e criar uma estrutura mais robusta. Ideal para quem quer passar autoridade e ser encontrado no Google.",
    deliverables: [
      "Estrutura Multi-páginas (Rotas)",
      "Páginas: Início, Sobre, Serviços, Galeria, Contato",
      "Arquivo centralizado para edição de textos e preços",
      "Formulário que envia para seu e-mail",
      "Botão flutuante do WhatsApp",
      "Deploy e Configuração de SSL (Cadeado de segurança)"
    ],
    notIncluded: [
      "Painel Administrativo (Wordpress/CMS)",
      "Sistema de Login ou Área do Cliente",
      "E-commerce (Carrinho de compras)"
    ],
    timeline: "10 a 15 dias úteis.",
    faqs: [
      {
        question: "O site aparece no Google?",
        answer: "Construo o site seguindo as boas práticas (semântica HTML) para que o Google consiga ler e indexar seu site corretamente."
      },
      {
        question: "Consigo alterar fotos e textos?",
        answer: "Sim, através do arquivo de configuração que deixo preparado. Para trocas de imagens, basta substituir o arquivo na pasta correta."
      }
    ]
  },
  {
    id: 'custom',
    title: 'Sob Medida',
    subtitle: 'Projetos Específicos',
    purpose: 'Para demandas que fogem do padrão ou ajustes pontuais.',
    recommendedFor: 'Refatoração, Novas Seções, Ideias Específicas.',
    details: 'Orçamento flexível baseado na complexidade.',
    price: 'A Combinar',
    techStack: ['React', 'JS/TS', 'Tailwind'],
    features: [
      'Desenvolvimento de Interface (Front)',
      'Componentes Customizados',
      'Ajustes em Sites React Existentes',
      'Atualização de Conteúdo',
      'Consultoria Técnica de Front'
    ],
    icon: Settings,
    highlight: false,
    fullDescription: "Se o seu projeto não se encaixa nos pacotes anteriores, o 'Sob Medida' é para você. Aqui analisamos sua necessidade específica. Pode ser uma página com um design muito diferenciado, uma manutenção em um site React que você já tem, ou apenas a criação do Frontend para um sistema que outra pessoa fará o Backend.",
    deliverables: [
      "Definidos caso a caso",
      "Código limpo e documentado",
      "Entrega dos Arquivos do Projeto (Zip)"
    ],
    notIncluded: [
      "Backend (Banco de dados, Login, Painel Admin)",
      "Integrações de API (foco apenas no visual)"
    ],
    timeline: "Definido conforme a demanda.",
    faqs: [
      {
        question: "Você faz sistemas com login?",
        answer: "Não. Meu foco é exclusivamente o Frontend (a parte visual e interativa). Não configuro servidores ou banco de dados."
      },
      {
        question: "Como funciona o orçamento?",
        answer: "Conversamos sobre o que você precisa, eu estimo as horas de trabalho e te passo um valor fechado."
      }
    ]
  }
];

// --- PROCESS STEPS ---
export const PROCESS_STEPS: ProcessStep[] = [
  {
    id: 1,
    title: 'Briefing & Conversa',
    description: 'Vou entender o que você precisa e quais são seus gostos.',
    checklist: [
      'Reunião rápida ou conversa por chat',
      'Envio de referências (sites que você gosta)',
      'Definição do conteúdo (textos/fotos)',
      'Acordo de prazos e valores'
    ],
    icon: Search
  },
  {
    id: 2,
    title: 'Estrutura Visual',
    description: 'Definimos a "cara" do site antes de codificar.',
    checklist: [
      'Criação baseada nas suas referências',
      'Definição de cores e tipografia',
      'Aprovação do layout básico',
      'Organização do conteúdo'
    ],
    icon: LayoutTemplate
  },
  {
    id: 3,
    title: 'Codificação 10x',
    description: 'A etapa de Codificação é onde a Engenharia Aumentada entra em ação para garantir a execução mais rápida e precisa do mercado.',
    checklist: [
      'Aceleração de Produção via IA',
      'Validação Algorítmica (QA/SEO)',
      'Curadoria Humana Pixel-Perfect',
      'Arquitetura de Negócio'
    ],
    icon: Cpu 
  },
  {
    id: 4,
    title: 'Entrega & Publicação',
    description: 'Seu site no ar, pronto para receber visitas.',
    checklist: [
      'Testes finais em celular e computador',
      'Configuração do seu domínio (.com.br)',
      'Entrega dos arquivos do projeto',
      'Tutorial de como editar os textos'
    ],
    icon: Rocket
  }
];

// --- GENERAL FAQ (New Section) ---
export const FAQ_DATA: FAQ[] = [
  {
    question: "Quanto tempo demora para meu site ficar pronto?",
    answer: "Para Landing Pages Express, o prazo médio é de 5 a 7 dias úteis após o recebimento de todo o material (textos e imagens). Sites Institucionais levam cerca de 15 dias úteis."
  },
  {
    question: "Vou ter custos mensais com o site?",
    answer: "Comigo, não. O pagamento pelo desenvolvimento é único. Você terá apenas os custos básicos de infraestrutura da internet: renovação anual do Domínio (~R$ 40/ano) e Hospedagem (existem opções gratuitas de alta performance que eu configuro para você)."
  },
  {
    question: "O site vai funcionar no meu celular?",
    answer: "Sim! Adoto a metodologia 'Mobile First'. Isso significa que seu site é desenhado pensando primeiro na experiência em celulares e depois expandido para telas maiores. Ele será 100% responsivo."
  },
  {
    question: "Preciso ter o texto e as fotos prontos?",
    answer: "Idealmente, sim. O desenvolvimento flui muito mais rápido se você já tiver o conteúdo. Porém, se precisar de ajuda, posso utilizar textos provisórios e imagens de banco gratuito para estruturar o layout enquanto você finaliza seu material."
  },
  {
    question: "Você faz sites em WordPress?",
    answer: "Não. Eu utilizo tecnologias modernas (React/Next.js) que garantem um site muito mais rápido, seguro e difícil de ser hackeado do que o WordPress tradicional. O resultado é melhor para o Google e para seu cliente."
  },
  {
    question: "E se eu precisar alterar algo depois da entrega?",
    answer: "Eu entrego um arquivo de configuração onde você pode alterar textos simples. Para mudanças estruturais ou novas seções, ofereço pacotes de manutenção ou orçamento por hora avulsa."
  },
];

export const FINANCIAL_NOTE = "Nosso preço reflete o valor de um processo otimizado por IA, garantindo que você pague por solução rápida, risco zero de boilerplate e código durável, e não por tempo desperdiçado em tarefas manuais.";
