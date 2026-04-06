export interface HeroText {
  title: string;
  subtitle: string;
}

export const HERO_TEXTS: HeroText[] = [
  {
    title: "Transformo ideias em sites que convertem",
    subtitle: "Especialista em criar experiências web ultra-rápidas, acessíveis e visualmente impactantes."
  },
  {
    title: "Engenharia Frontend de Alta Performance",
    subtitle: "Não é apenas código. É a sua marca rodando na velocidade que o mercado exige."
  },
  {
    title: "Seu negócio merece um site de Elite",
    subtitle: "Interfaces modernas, otimizadas para o Google e preparadas para escalar suas vendas."
  },
  {
    title: "Desenvolvimento Web sem Limites",
    subtitle: "Do conceito ao deploy: aplicações robustas construídas com React e TypeScript."
  },
  {
    title: "Performance que o Google ama",
    subtitle: "Sites otimizados para Core Web Vitals, garantindo ranqueamento e retenção de usuários."
  },
  {
    title: "Design Premium, Código Impecável",
    subtitle: "A união perfeita entre estética minimalista e arquitetura de software sólida."
  },
  {
    title: "Mais que um site, uma Plataforma",
    subtitle: "Sistemas complexos simplificados através de uma interface intuitiva e responsiva."
  },
  {
    title: "O próximo nível da sua Presença Digital",
    subtitle: "Deixe para trás templates lentos. Tenha uma solução feita sob medida para o seu sucesso."
  },
  {
    title: "Experiências Digitais Memoráveis",
    subtitle: "Crio interfaces que encantam usuários e geram resultados reais para o seu negócio."
  },
  {
    title: "Expertise em React & Next.js",
    subtitle: "Utilizando a stack mais moderna do mercado para entregar produtos de classe mundial."
  },
  {
    title: "Velocidade, Segurança e Escala",
    subtitle: "Fundamentos inegociáveis em todos os projetos que desenvolvo."
  },
  {
    title: "Transformando visitantes em Clientes",
    subtitle: "Layouts estrategicamente desenhados para guiar o usuário até a conversão."
  },
  {
    title: "Soluções Web para o Futuro",
    subtitle: "Aplicações preparadas para crescer junto com a sua empresa, sem dívida técnica."
  },
  {
    title: "Clean Code. Interface Limpa.",
    subtitle: "A beleza está na simplicidade e na eficiência de cada linha de código."
  },
  {
    title: "Sua vitrine digital 24 horas por dia",
    subtitle: "Garanta que sua empresa esteja sempre disponível, rápida e elegante em qualquer dispositivo."
  },
  {
    title: "Tecnologia a favor do seu Negócio",
    subtitle: "Traduzo requisitos complexos em interfaces simples e poderosas."
  },
  {
    title: "Sites Estáticos Ultrarrápidos",
    subtitle: "Carregamento instantâneo para quem não tem tempo a perder."
  },
  {
    title: "Aplicações Web de Ponta a Ponta",
    subtitle: "Domínio total do Frontend para entregar produtos digitais completos."
  },
  {
    title: "Minimalismo que Impacta",
    subtitle: "Design focado no essencial: destacar o seu produto e sua mensagem."
  },
  {
    title: "Codificando o Sucesso da sua Marca",
    subtitle: "Desenvolvimento artesanal, pixel-perfect, feito para durar."
  },
  {
    title: "Navegação Fluida, Resultados Sólidos",
    subtitle: "Animações suaves e usabilidade pensada para maximizar o engajamento."
  },
  {
    title: "Frontend Developer Especialista",
    subtitle: "Anos de experiência transformados em soluções digitais de alto valor."
  },
  {
    title: "Conectando Design e Tecnologia",
    subtitle: "A ponte perfeita entre o visual criativo e a funcionalidade técnica."
  },
  {
    title: "Sua ideia, executada com Maestria",
    subtitle: "Tire seu projeto do papel com quem entende de engenharia de software moderna."
  },
  {
    title: "Inovação em cada Pixel",
    subtitle: "Detalhes que fazem a diferença e colocam sua marca à frente da concorrência."
  }
];

export const getRandomHeroText = (): HeroText => {
  const randomIndex = Math.floor(Math.random() * HERO_TEXTS.length);
  return HERO_TEXTS[randomIndex];
};
