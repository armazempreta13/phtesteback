
import { Project } from './types';

export const PROJECTS_DATA: Project[] = [
  {
    id: 'hce-esquadrias',
    title: 'HCE Esquadrias',
    category: 'Indústria / Corporativo',
    description: 'Site institucional robusto para uma das maiores indústrias de esquadrias. Foco em catálogo de obras, SEO técnico e performance de carregamento.',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2000&auto=format&fit=crop',
    tags: ['React', 'Tailwind CSS', 'SEO', 'Catálogo'],
    demoUrl: 'https://www.hceesquadrias.com.br',
    liveUrl: 'https://www.hceesquadrias.com.br',
    featured: true,
    challenge: "O cliente possuía um site antigo em Wordpress que demorava 8 segundos para carregar, penalizando o SEO e perdendo leads qualificados.",
    solution: "Desenvolvemos uma Single Page Application (SPA) em React com geração estática de catálogo. Implementamos Lazy Loading agressivo de imagens e compressão WebP.",
    result: "Tempo de carregamento reduzido para 0.9s (Google PageSpeed 98/100). Aumento de 40% nos pedidos de orçamento no primeiro mês após o lançamento."
  },
  {
    id: 'zenith-arch',
    title: 'Zenith Architecture',
    category: 'One Page / Design',
    description: 'Conceito de site One-Page minimalista para escritório de arquitetura de alto padrão. Foco em tipografia, espaços em branco e experiência imersiva.',
    image: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2000&auto=format&fit=crop',
    tags: ['One Page', 'Minimalist', 'UI Design', 'Framer Motion'],
    demoUrl: '#internal:zenith-demo', 
    featured: false,
    challenge: "Transmitir a sofisticação e o minimalismo de um escritório de arquitetura sem poluir a tela com menus complexos ou textos excessivos.",
    solution: "Criação de uma One-Page fluida com animações de scroll (Framer Motion), tipografia editorial e uso estratégico de espaços em branco (whitespace).",
    result: "Uma experiência imersiva que prende o usuário. A taxa de rejeição em testes A/B foi 60% menor comparada a layouts tradicionais."
  },
  {
    id: 'aether-mars',
    title: 'Aether Mars Estates',
    category: 'Futuristic / Landing Page',
    description: 'Landing page imersiva para imobiliária espacial de luxo. Design futurista, grids estilo bento e efeitos de glassmorphism avançados.',
    image: 'https://images.unsplash.com/photo-1614728423169-3f65fd722b7e?q=80&w=2000&auto=format&fit=crop',
    tags: ['Futurism', 'Glassmorphism', 'Bento Grid', 'Dark Mode'],
    demoUrl: '#internal:aether-demo',
    featured: true,
    challenge: "Criar uma interface que parecesse vinda do ano 2054 para vender um produto fictício de luxo, mantendo a usabilidade.",
    solution: "Uso pesado de Glassmorphism, gradientes neon, grids assimétricos (Bento Grid) e micro-interações de hover para fugir do padrão web atual.",
    result: "Vencedor de menção honrosa em design de interface futurista. Alta retenção de usuários na demo devido aos elementos interativos."
  }
];
