
# DOCUMENTAÇÃO DE ARQUITETURA DE SOFTWARE & DESIGN SYSTEM

**Projeto:** PH.dev Platform
**Versão:** 2.5.0-stable
**Classificação:** Documentação Técnica
**Última Revisão:** Outubro 2023

---

## 1. RESUMO EXECUTIVO

A **PH.dev Platform** é uma aplicação web progressiva (PWA) de alta performance, desenvolvida para atuar como portfólio interativo, ferramenta de vendas automatizada e portal de gestão de clientes (SaaS-lite).

Diferente de sites estáticos tradicionais, esta plataforma utiliza uma arquitetura **Single Page Application (SPA)** baseada em React 18, focada em:
1.  **Engenharia de Performance:** Otimização agressiva de Core Web Vitals.
2.  **Conversão Automatizada:** Chatbot heurístico para qualificação de leads.
3.  **Gestão Desacoplada:** CMS Headless baseado em JSON para fácil manutenção sem banco de dados complexo.

---

## 2. DESIGN SYSTEM (UI/UX)

O sistema visual segue o paradigma **"Utility-First"** utilizando Tailwind CSS, com uma estética *Clean Tech* orientada a tipografia e espaçamento.

### 2.1 Paleta de Cores (Tokens)

As cores são definidas semanticamente para garantir consistência e suporte nativo a Dark Mode.

| Token Semântico | Valor HEX (Light) | Valor HEX (Dark) | Aplicação |
| :--- | :--- | :--- | :--- |
| **Brand Primary** | `#7C3AED` (Violet 600) | `#8B5CF6` (Violet 500) | Ações principais, CTAs, Highlights. |
| **Brand Surface** | `#FFFFFF` (White) | `#0A0A0A` (Zinc 950) | Fundo da página, Cards principais. |
| **Surface Secondary** | `#F9FAFB` (Gray 50) | `#18181B` (Zinc 900) | Seções alternadas, Modais, Inputs. |
| **Text Primary** | `#111827` (Gray 900) | `#F3F4F6` (Gray 100) | Títulos, Corpo de texto principal. |
| **Text Secondary** | `#6B7280` (Gray 500) | `#9CA3AF` (Gray 400) | Legendas, Metadados, Placeholders. |
| **Feedback Success** | `#16A34A` (Green 600) | `#22C55E` (Green 500) | Confirmação de ação, Pagamento aprovado. |
| **Feedback Error** | `#DC2626` (Red 600) | `#EF4444` (Red 500) | Mensagens de erro, Ações destrutivas. |
| **Feedback Warning** | `#CA8A04` (Yellow 600) | `#FACC15` (Yellow 400) | Alertas de sistema, Status pendente. |

### 2.2 Tipografia

A tipografia utiliza um par clássico de Sans-Serif moderna para legibilidade e Geometric Sans para impacto visual.

*   **Display (Títulos):** `Poppins`
    *   Pesos: 600 (SemiBold), 700 (Bold), 800 (ExtraBold).
    *   Uso: Hero section, Cabeçalhos de seção H1-H3.
*   **Body (Texto):** `Inter`
    *   Pesos: 300 (Light), 400 (Regular), 500 (Medium).
    *   Uso: Parágrafos, UI Controls, Botões.
*   **Monospace (Código):** `System Mono` / `Fira Code`
    *   Uso: Blocos de código, IDs de transação, Logs.

### 2.3 Motion Design (Física)

Todas as interações utilizam física de mola (Spring Physics) via `framer-motion` para sensação de naturalidade.

*   **Entradas:** `type: "spring", stiffness: 300, damping: 30`
*   **Hovers:** `scale: 1.05` (Micro-interações)
*   **Transição de Página:** `opacity: 0 -> 1` (Duration: 0.3s)

---

## 3. ARQUITETURA DE SOFTWARE

### 3.1 Stack Tecnológica

*   **Core:** React 18 + TypeScript 5.
*   **Build Tool:** Vite (ESBuild) para Hot Module Replacement instantâneo.
*   **Estilização:** Tailwind CSS v3.
*   **Animação:** Framer Motion.
*   **Estado Global:** React Context API (Sem Redux para reduzir bundle size).
*   **Roteamento:** Roteamento Virtual customizado (State-based) para preservar estado de animação entre views sem recarregamento.

### 3.2 Estrutura de Diretórios (Domínios)

A estrutura segue o padrão de **Feature-based Folder Structure**, facilitando a escalabilidade.

```
/
├── components/          # Componentes de UI "Burros" (Apresentacionais)
│   ├── AdminPanel.tsx   # Lógica do Painel Administrativo
│   ├── Chatbot.tsx      # Motor de Decisão do Chat
│   ├── ...
├── contexts/            # Camada de Estado Global (Business Logic)
│   ├── ContentContext.tsx # CMS Headless: Gerencia textos e configs
│   └── ProjectContext.tsx # CRM: Gerencia clientes, projetos e auth
├── lib/                 # Serviços e Integrações Externas
│   ├── api.ts           # Camada de Abstração de API (Facade Pattern)
│   ├── pix.ts           # Gerador de Payload BR Code (Banco Central)
│   └── supabaseClient.ts # Conector de Banco de Dados (BaaS)
├── hooks/               # Custom React Hooks
│   ├── useMobile.ts     # Detecção de Viewport otimizada
│   └── useCookieConsent.ts # Gestão de Privacidade
└── config.ts            # Arquivo Central de Configuração (Single Source of Truth)
```

---

## 4. MÓDULOS DE FUNCIONALIDADE (FEATURES)

### 4.1 Chatbot Heurístico (Sales Engine)
O componente `Chatbot.tsx` não utiliza IA generativa cara em tempo real. Ele utiliza uma **Árvore de Decisão Determinística**.
*   **Fluxo:** O arquivo `chatbotFlow.ts` define um grafo de nós conectados.
*   **Estado:** O bot mantém um estado local `BudgetData` que acumula as respostas do usuário.
*   **Saída:** Gera um link profundo (`deep link`) para o WhatsApp, codificando todo o resumo do atendimento na URL, permitindo que o humano continue exatamente de onde o robô parou.

### 4.2 CMS Headless Local (Content Management)
Para evitar a necessidade de um backend complexo para edições simples, o site implementa um CMS no navegador.
*   **Persistência:** Utiliza `localStorage` para salvar edições de texto e configurações feitas no `/admin-dashboard`.
*   **Hot-Swap:** As alterações refletem instantaneamente no site sem rebuild.
*   **Exportação:** Permite exportar um JSON final para ser "commitado" no código (`config.ts`) para persistência definitiva em produção.

### 4.3 Sistema Financeiro (PIX & Gateway)
Implementação híbrida de pagamentos para garantir alta disponibilidade.
*   **Modo API:** Tenta conectar ao Mercado Pago para gerar QR Code dinâmico com Webhook.
*   **Modo Fallback (Offline-First):** Se a API falhar, o sistema utiliza a biblioteca interna `lib/pix.ts` para gerar um QR Code estático padrão Banco Central (EMVCo) baseado na chave PIX configurada, garantindo que a venda nunca seja perdida por erro técnico.

---

## 5. ESTRATÉGIA DE PERFORMANCE (WEB VITALS)

O site foi otimizado para atingir pontuação 95+ no Google Lighthouse.

1.  **Code Splitting:** Componentes pesados (`Chatbot`, `Footer`, `AdminPanel`) são carregados via `React.lazy()` apenas quando necessários.
2.  **Asset Preloading:** Imagens críticas (Hero) possuem tags `<link rel="preload">` no `index.html`.
3.  **Zero Layout Shift (CLS):** Todas as imagens possuem `width` e `height` explícitos ou containers com *aspect-ratio* reservado.
4.  **Memoization:** Uso intensivo de `React.memo` e `useCallback` em componentes de animação (`InteractiveBackground`) para evitar re-renderizações desnecessárias que travam a thread principal.

---

## 6. SEGURANÇA E DADOS

### 6.1 Autenticação
*   **Admin:** Protegido por hash SHA-256 no client-side para o painel simples.
*   **Cliente:** Sistema de Login/Senha simulado ou integrado via Supabase Auth (JWT).
*   **RBAC (Role Based Access Control):** O `ProjectContext` verifica a role (`admin` vs `client`) antes de renderizar componentes sensíveis.

### 6.2 Privacidade (LGPD/GDPR)
*   **Cookies:** Gerenciados estritamente via `useCookieConsent`. Scripts de rastreamento (Google Analytics) só são injetados no DOM *após* o consentimento explícito do usuário.
*   **Dados:** Nenhuma informação sensível é salva em banco de dados sem criptografia.

---

## 7. GUIA DE OPERAÇÃO

### Como Editar Conteúdo
1.  Acesse `/login` e entre como Admin.
2.  Navegue até **Admin Dashboard > Conteúdo**.
3.  Edite os textos. Eles são salvos localmente no seu navegador.
4.  Para publicar para todos, clique em **Exportar JSON**, copie o código e substitua o conteúdo de `config.ts` no repositório.

### Como Gerenciar Projetos (CRM)
1.  No **Admin Dashboard > CRM**, crie um novo projeto.
2.  Defina o E-mail do cliente.
3.  Clique em **Formalizar** para gerar o e-mail de boas-vindas com as credenciais.
4.  O cliente acessa `/login` com as credenciais recebidas.

### Deploy
Este projeto é *Static-Export-Ready*.
```bash
npm run build
# Gera a pasta /dist contendo HTML/CSS/JS estáticos.
# Pode ser hospedado em Vercel, Netlify, AWS S3 ou qualquer servidor Apache/Nginx.
```

---

**Propriedade Intelectual:** PH.dev Platform.
**Contato Técnico:** dev@ph.dev
