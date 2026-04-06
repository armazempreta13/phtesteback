# ARQUITETURA DE BACKEND E ENGENHARIA DE DADOS

**Projeto:** PH.dev Platform  
**Versão do Documento:** 3.0.0  
**Data de Atualização:** Dezembro 2025

---

## 1.0 VISÃO GERAL DA ARQUITETURA

### 1.1 Contexto e Objetivo do Sistema

Este documento especifica a arquitetura completa do backend para a plataforma PH.dev, que gerencia o ciclo de vida de projetos de desenvolvimento de software sob demanda. O sistema migra de uma arquitetura client-side com armazenamento volátil em LocalStorage para uma arquitetura de backend em nuvem com persistência de dados, autenticação robusta e processamento server-side.

A plataforma atende dois perfis de usuário principais:

**Clientes:** Visualizam seus projetos contratados, acompanham progresso em tempo real, realizam pagamentos via PIX através do Mercado Pago, fazem upload de briefings e assets necessários ao desenvolvimento, recebem notificações sobre mudanças de status e acessam entregas finalizadas.

**Administradores:** Gerenciam todos os projetos independente do cliente, atualizam status e percentuais de conclusão, fazem upload de entregas e contratos assinados, têm visibilidade completa sobre o financeiro de todos os projetos, criam novos projetos e associam clientes, e enviam notificações customizadas.

### 1.2 Análise Comparativa de Plataformas Backend

A escolha da plataforma de backend deve considerar múltiplos fatores técnicos, operacionais e financeiros. Abaixo está uma análise detalhada das três principais opções viáveis para este projeto.

#### 1.2.1 Supabase

**Descrição Geral:**
Supabase é uma plataforma Backend-as-a-Service de código aberto que oferece PostgreSQL como banco de dados principal, com camadas adicionais de autenticação, storage de objetos, edge functions e realtime subscriptions. Posiciona-se como alternativa open-source ao Firebase.

**Arquitetura Técnica:**
A plataforma baseia-se em PostgreSQL 15+ como núcleo, com o GoTrue para autenticação JWT, PostgREST para geração automática de APIs RESTful a partir do schema do banco, Realtime para subscriptions via WebSockets, Storage baseado em S3 para arquivos, e Edge Functions executadas em runtime Deno para lógica server-side.

**Vantagens Específicas para o Projeto:**
O uso de PostgreSQL relacional permite modelagem robusta com foreign keys, constraints e triggers nativos, essencial para a integridade referencial entre projetos, transações e usuários. O Row Level Security nativo do PostgreSQL fornece segurança no nível do banco de dados, eliminando a necessidade de camada intermediária de autorização. As Edge Functions rodam em Deno, que possui suporte nativo a TypeScript e APIs modernas, facilitando a integração com Mercado Pago e serviços de email. O Realtime Subscriptions permite que clientes vejam atualizações de progresso instantaneamente sem polling. A geração automática de APIs REST e GraphQL a partir do schema elimina boilerplate de desenvolvimento. O Storage com políticas de acesso granulares integra-se nativamente com as permissões do banco de dados.

**Limitações e Considerações:**
A curva de aprendizado do PostgreSQL e RLS pode ser íngreme para desenvolvedores familiarizados apenas com bancos NoSQL. Edge Functions têm cold start ocasional, embora menor que AWS Lambda tradicional. O plano gratuito possui limites de 500MB de database e 1GB de storage, exigindo upgrade conforme crescimento. Documentação ainda em evolução comparada a plataformas mais maduras. Vendor lock-in moderado, embora seja possível self-host devido à natureza open-source.

**Modelo de Precificação:**
Plano gratuito adequado para MVP e testes iniciais. Plano Pro a partir de 25 dólares mensais oferece 8GB database, 100GB storage, 50GB bandwidth e suporte por email. Plano Team adiciona SAML SSO e ambientes de staging. Cobrança adicional por compute hours das Edge Functions após cota incluída.

#### 1.2.2 Firebase

**Descrição Geral:**
Firebase é a plataforma Backend-as-a-Service do Google, oferecendo banco de dados NoSQL em tempo real, autenticação integrada, cloud functions, hosting, analytics e múltiplos serviços complementares. É a solução BaaS mais madura e amplamente adotada do mercado.

**Arquitetura Técnica:**
O Firebase oferece duas opções de banco de dados: Realtime Database baseado em JSON e Firestore com modelo de documentos. Cloud Functions rodam em Node.js no runtime do Google Cloud Platform. Authentication suporta múltiplos provedores incluindo email/senha, OAuth e SAML. Storage utiliza Google Cloud Storage. Hosting integrado com CDN global para servir assets estáticos. Firebase Extensions oferecem integrações prontas com Stripe, Algolia, SendGrid e outros serviços.

**Vantagens Específicas para o Projeto:**
Maturidade comprovada com milhões de aplicações em produção. Documentação extensiva e comunidade ativa com abundância de tutoriais e soluções. Firestore possui sync offline nativo, permitindo que clientes visualizem dados mesmo sem conexão e sincronizem automaticamente ao reconectar. Security Rules permitem controle de acesso declarativo similar ao RLS. Integração nativa com Google Cloud Platform facilita expansão futura para serviços complementares. Firebase Extensions para Mercado Pago ou processamento de pagamentos podem acelerar implementação. Console administrativo robusto com analytics detalhado sobre uso e performance.

**Limitações e Considerações:**
Modelo NoSQL pode ser desafiador para relacionamentos complexos entre projetos, transações e usuários, exigindo desnormalização e possível duplicação de dados. Queries limitadas comparadas a SQL, sem suporte nativo a JOINs ou agregações complexas. Cold start das Cloud Functions pode ser significativo, especialmente no plano Spark gratuito. Custos podem escalar rapidamente com leituras/escritas de documentos em alta escala. Vendor lock-in significativo, migração fora do Firebase é complexa. Security Rules possuem sintaxe própria que requer aprendizado específico.

**Modelo de Precificação:**
Plano Spark gratuito limitado a 1GB storage, 10GB bandwidth mensal e 50.000 leituras diárias do Firestore. Plano Blaze pago por uso, com custos baseados em leituras/escritas de documentos, armazenamento, invocações de Cloud Functions e bandwidth. Pode ser econômico em escala pequena mas imprevisível em crescimento rápido.

#### 1.2.3 Render.com

**Descrição Geral:**
Render é uma plataforma de hospedagem moderna focada em simplicidade e desenvolvedores. Diferente de Supabase e Firebase que são BaaS completos, Render oferece infraestrutura gerenciada onde você hospeda suas próprias aplicações backend customizadas, bancos de dados e serviços estáticos.

**Arquitetura Técnica:**
O Render hospeda Web Services que podem ser aplicações Node.js, Python, Go, Rust ou qualquer linguagem. Oferece PostgreSQL e Redis gerenciados como serviços separados. Background Workers para processamento assíncrono. Cron Jobs para tarefas agendadas. Static Sites para servir frontend React. Deploy automático via integração Git. Load balancing e auto-scaling opcional. Certificados SSL automáticos via Let's Encrypt.

**Vantagens Específicas para o Projeto:**
Controle total sobre a arquitetura do backend, permitindo implementar qualquer framework como Express, NestJS, Fastify ou AdonisJS. Sem abstrações proprietárias, facilitando migração futura para outras plataformas. PostgreSQL totalmente gerenciado com backups automáticos e replicação opcional. Deploys zero-downtime automáticos a partir de commits no GitHub. Preview environments para testar mudanças antes de produção. Pricing simples e previsível baseado em recursos alocados, não em uso. Suporta Docker para máxima flexibilidade.

**Limitações e Considerações:**
Requer desenvolvimento completo do backend, incluindo autenticação, autorização, APIs REST, validação de dados e lógica de negócio. Não possui realtime subscriptions nativo, exigindo implementação com Socket.io ou similar. Storage de arquivos requer integração com S3 ou Cloudinary. Ausência de console administrativo para gerenciar dados, necessitando ferramentas como pgAdmin ou Prisma Studio. Responsabilidade total pela segurança da aplicação, sem guardrails automáticos. Menor ecossistema de integrações prontas comparado a Firebase.

**Modelo de Precificação:**
Plano gratuito limitado mas utilizável para protótipos, com 750 horas de compute e 1GB PostgreSQL. Web Services a partir de 7 dólares mensais para 512MB RAM. PostgreSQL gerenciado a partir de 7 dólares mensais para 256MB RAM e 1GB storage, escalando até planos enterprise. Bandwidth e compute adicional cobrados separadamente. Pricing transparente sem custos ocultos por requisições ou leituras de banco.

### 1.3 Recomendação Técnica Fundamentada

**Para o estágio atual do projeto PH.dev, recomenda-se iniciar com Supabase pelos seguintes motivos estratégicos:**

**Velocidade de Desenvolvimento:**
O Supabase elimina meses de desenvolvimento que seriam gastos construindo autenticação, APIs RESTful, autorização e realtime do zero no Render. A geração automática de APIs a partir do schema PostgreSQL permite que o time frontend comece a consumir dados em dias ao invés de semanas.

**Segurança por Default:**
O Row Level Security do PostgreSQL fornece uma camada de segurança no nível do banco de dados que é testada em batalha e auditada. Implementar controle de acesso equivalente em backend customizado no Render demandaria semanas de desenvolvimento e testes rigorosos para alcançar o mesmo nível de robustez.

**Realtime Nativo:**
A funcionalidade de subscriptions em tempo real é crítica para a experiência do cliente ao acompanhar progresso de projetos. Implementar WebSockets ou Server-Sent Events customizado no Render adiciona complexidade significativa de infraestrutura e código.

**PostgreSQL Relacional:**
A natureza relacional do projeto, com projetos vinculados a usuários, transações vinculadas a projetos e arquivos vinculados a ambos, beneficia-se fortemente de foreign keys e constraints nativos do PostgreSQL. O Firestore exigiria desnormalização significativa e lógica de sincronização manual.

**Custo Inicial:**
O plano gratuito do Supabase é suficiente para MVP e primeiros clientes. O Render também possui plano gratuito mas exigiria desenvolvimento adicional que representa custo em tempo de engenharia. O Firebase Spark é limitado e custos podem escalar imprevisívelmente.

**Caminho de Migração:**
Por ser open-source, o Supabase permite self-hosting futuro se houver necessidade de controle total. Migrar de Firebase é significativamente mais complexo devido a vendor lock-in. O schema PostgreSQL pode ser facilmente exportado e utilizado em qualquer plataforma futura.

**Ressalvas Importantes:**
Esta recomendação assume equipe com conhecimento básico de SQL e disposição para aprender conceitos de RLS. Para times exclusivamente NoSQL, Firebase pode ter menor friction inicial. Se o projeto evoluir para necessidades muito específicas de infraestrutura não suportadas por BaaS, migração gradual para Render ou AWS torna-se opção.

### 1.4 Fluxo de Dados e Comunicação entre Camadas

#### 1.4.1 Camada Frontend - Aplicação React

O navegador executa a aplicação React que se comunica exclusivamente com o Supabase via biblioteca JavaScript oficial. Todo o bundle do frontend é servido estaticamente via CDN do Supabase ou Cloudflare, contendo apenas código client-side sem segredos ou chaves de API sensíveis.

O cliente Supabase é inicializado com a URL do projeto e a chave pública anônima, que permite acesso público mas respeita todas as políticas de Row Level Security. Esta chave pode ser exposta no código frontend sem riscos pois o RLS garante que usuários não autenticados ou sem permissão não acessem dados restritos.

Todas as chamadas de API são feitas através do cliente Supabase JavaScript, que abstrai requisições HTTP REST ou subscriptions WebSocket. O desenvolvedor frontend não manipula tokens JWT diretamente, a biblioteca gerencia refresh automático e anexa o token em cada requisição.

Componentes React utilizam hooks customizados que encapsulam queries Supabase, fornecendo estados de loading, error e data. A biblioteca React Query ou SWR pode ser integrada para caching inteligente e refetch automático.

#### 1.4.2 Camada de Autenticação - GoTrue

Todas as requisições do frontend passam pelo gateway GoTrue, que valida tokens JWT antes de permitir acesso ao banco de dados ou outros recursos. O GoTrue suporta múltiplos fluxos de autenticação incluindo email/senha com confirmação, magic links sem senha, OAuth com Google e GitHub, e autenticação por telefone com OTP.

Quando um usuário faz login via email/senha, o GoTrue valida as credenciais contra a tabela auth.users, gera um JWT assinado com claims do usuário incluindo user_id e metadados customizados, e retorna tokens de acesso e refresh. O token de acesso possui tempo de vida curto, tipicamente 1 hora, enquanto o refresh token permite renovação por até 30 dias.

O JWT gerado contém claims acessíveis nas políticas RLS via função auth.jwt(), permitindo decisões de autorização baseadas em roles customizados. Por exemplo, um claim app_metadata.role='admin' pode ser verificado para conceder acesso administrativo.

O GoTrue também gerencia fluxos de recuperação de senha via email, confirmação de email em novos cadastros, e revogação de tokens quando usuário faz logout. Sessões podem ser gerenciadas via cookies HTTP-only para maior segurança em ambientes web.

#### 1.4.3 Camada de Dados - PostgreSQL

O PostgreSQL atua como source of truth da aplicação, armazenando dados relacionais com integridade referencial garantida por foreign keys. Todas as tabelas possuem Row Level Security habilitado, garantindo que cada query SELECT retorne apenas linhas que o usuário autenticado tem permissão para acessar, INSERTs sejam permitidos apenas em contextos válidos, e UPDATEs/DELETEs sejam restritos conforme políticas.

O contexto do usuário autenticado é injetado automaticamente em todas as queries via função auth.uid(), que retorna o UUID do usuário logado extraído do JWT. Políticas RLS utilizam esta função em cláusulas USING e WITH CHECK para filtrar dados.

Triggers do PostgreSQL mantêm campos como updated_at sincronizados automaticamente, calculam valores derivados como total pago de um projeto baseado em transações aprovadas, e disparam notificações quando eventos importantes ocorrem.

Functions customizadas em PL/pgSQL encapsulam lógica complexa como cálculo de saldo devedor, validação de regras de negócio antes de mudanças de status, e agregações que seriam custosas no client-side.

O PostgREST gera automaticamente endpoints RESTful para todas as tabelas e views, respeitando as políticas RLS. Uma tabela public.projects expõe automaticamente GET /projects, POST /projects, PATCH /projects/:id e DELETE /projects/:id, com filtragem e ordenação via query parameters.

#### 1.4.4 Camada de Processamento - Edge Functions

Edge Functions são funções serverless escritas em TypeScript que executam em runtime Deno distribuído globalmente. Diferente de lambdas tradicionais, Edge Functions possuem cold start mínimo, tipicamente abaixo de 50ms, pois rodam em ambiente V8 isolado ao invés de containers completos.

Estas funções são utilizadas exclusivamente para lógica que não pode ser exposta ao cliente por questões de segurança ou performance. Os principais casos de uso neste projeto são integração com gateway de pagamento Mercado Pago, onde a chave secreta de API não pode ser exposta no bundle frontend, processamento de webhooks do Mercado Pago para confirmar pagamentos, envio de emails transacionais via SendGrid ou Resend com credenciais SMTP protegidas, e operações administrativas que requerem bypass temporário do RLS.

Edge Functions acessam o banco de dados via cliente Supabase com a chave de serviço service_role, que bypassa RLS e possui acesso administrativo total. Porém, cada função deve implementar validação manual de autorização no início para garantir que apenas usuários com permissão adequada possam invocar operações sensíveis.

Variáveis de ambiente sensíveis como MERCADOPAGO_ACCESS_TOKEN, SENDGRID_API_KEY e SUPABASE_SERVICE_ROLE_KEY são configuradas no painel do Supabase e injetadas no runtime das funções, nunca comitadas no repositório.

#### 1.4.5 Camada de Storage - Armazenamento de Objetos

O Supabase Storage fornece armazenamento de objetos compatível com S3, organizado em buckets. Um bucket chamado project-assets armazena todos os arquivos relacionados a projetos, organizados em estrutura hierárquica por ID do projeto.

Políticas de acesso ao Storage são definidas no painel do Supabase, vinculadas às mesmas funções auth.uid() e permissões RLS do banco. Por exemplo, uma política permite upload apenas se o usuário for admin ou dono do projeto correspondente ao ID da pasta.

URLs de download podem ser públicas para assets que não contêm informações sensíveis, ou assinadas temporariamente com validade de alguns minutos para contratos e entregas confidenciais. URLs assinadas contêm token de acesso que expira automaticamente, prevenindo compartilhamento não autorizado.

A tabela project_files no banco de dados mantém metadados de cada arquivo incluindo nome original, caminho no storage, tipo MIME, tamanho, categoria e quem fez upload. Quando um arquivo é deletado do banco, um trigger ou função pode opcionalmente remover o blob correspondente do Storage para evitar arquivos órfãos.

O frontend utiliza a biblioteca JavaScript do Supabase Storage para fazer upload de arquivos via multipart/form-data, com suporte a progress tracking para mostrar barras de progresso ao usuário. Downloads são feitos via URLs retornadas pela API, que podem ser públicas ou assinadas conforme configuração.

#### 1.4.6 Integrações Externas

**Mercado Pago para Pagamentos PIX:**
A integração com Mercado Pago ocorre exclusivamente via Edge Function para proteger credenciais. Quando cliente solicita pagamento, o frontend chama a Edge Function create-payment-intent passando project_id e valor. A função valida autorização, instancia SDK do Mercado Pago com access token secreto, cria preferência de pagamento com tipo PIX, recebe resposta contendo QR Code em base64 e código Copia e Cola, insere registro na tabela transactions com status pending, e retorna QR Code e transaction_id ao frontend.

O Mercado Pago notifica mudanças de status via webhook configurado no painel apontando para outra Edge Function. Esta função valida autenticidade da notificação via assinatura HMAC, consulta API do Mercado Pago para confirmar status real da transação, atualiza tabela transactions de pending para approved se pagamento confirmado, dispara trigger que atualiza financial_data do projeto incrementando valor pago, e cria notificação para o cliente e admin informando sobre pagamento recebido.

**SendGrid ou Resend para Emails Transacionais:**
Emails como credenciais de acesso, confirmação de pagamento, mudanças de status e relatórios semanais são enviados via Edge Function que encapsula chamadas à API do provedor de email. A função recebe parâmetros como destinatário, template e dados dinâmicos, renderiza template HTML com dados injetados, envia via API do SendGrid ou Resend usando chave de API armazenada em variável de ambiente, e registra envio em tabela de auditoria para rastreamento.

Templates de email são versionados e armazenados no provedor ou em bucket do Storage, permitindo atualização sem redeploy de código. Variáveis dinâmicas como nome do cliente, nome do projeto e valores financeiros são injetadas no momento do envio.

**Cloudflare CDN para Assets Estáticos:**
Opcionalmente, assets do frontend compilado podem ser servidos via Cloudflare para reduzir latência global. O build de produção do React é uploadado ao Cloudflare Pages ou Workers Sites, com cache agressivo de bundles JavaScript e CSS versionados. Imagens e fontes também podem ser servidas via Cloudflare Images para otimização automática e servir formatos modernos como WebP.

---

## 2.0 MODELAGEM DE DADOS

### 2.1 Princípios de Design do Schema

A modelagem de dados segue princípios fundamentais de design de banco de dados relacional, adaptados para as necessidades específicas de uma plataforma de gerenciamento de projetos com componente financeiro.

**Normalização Seletiva:**
As tabelas principais estão normalizadas até a terceira forma normal para eliminar redundância e garantir consistência. Tabelas como profiles, projects e transactions possuem estrutura rígida com colunas bem definidas. Porém, campos que representam snapshots históricos ou dados flexíveis utilizam JSONB para evitar explosão de colunas. Por exemplo, financial_data em projects armazena total, pago e plano de pagamento em JSON ao invés de múltiplas colunas ou tabela separada de parcelas.

**UUID como Padrão de Identificação:**
Todas as chaves primárias utilizam UUID versão 4 gerados via função gen_random_uuid() do PostgreSQL. UUIDs oferecem vantagens significativas sobre auto-increment integers: impossibilidade de enumeração ou predição de IDs por atacantes, facilidade de merge de dados de múltiplas fontes sem conflito de IDs, compatibilidade com sistemas distribuídos onde geração centralizada de IDs seria gargalo, e tamanho fixo de 128 bits que representa trilhões de valores únicos.

A desvantagem de UUIDs é uso ligeiramente maior de espaço, 16 bytes versus 4 ou 8 bytes de integers, e performance de índices marginalmente inferior. Porém, para uma plataforma com volume de dados moderado, as vantagens de segurança superam as desvantagens.

**Timestamps Automáticos e Auditoria:**
Toda tabela possui coluna created_at com valor default NOW() para rastrear momento de inserção. Tabelas que sofrem atualizações também possuem updated_at mantido automaticamente por trigger que sobrescreve o valor com NOW() a cada UPDATE. Este padrão permite queries temporais como projetos criados no último mês ou transações atualizadas recentemente.

Para auditoria completa de quem fez cada mudança, colunas adicionais como created_by e updated_by podem referenciar profiles.id, preenchidas via trigger que acessa auth.uid(). Tabelas sensíveis como transactions podem ter audit trail completo via extensão pgAudit ou trigger que insere em tabela de histórico.

**Soft Deletes Opcional:**
O padrão de soft delete adiciona coluna deleted_at em tabelas onde é importante preservar histórico mesmo após remoção. Ao invés de DELETE real, a aplicação executa UPDATE deleted_at = NOW(). Queries regulares filtram WHERE deleted_at IS NULL para excluir registros deletados, enquanto queries administrativas podem incluir deletados para recuperação.

Este padrão não é implementado inicialmente por simplicidade, mas pode ser adicionado em tabelas críticas como projects se requisitos de auditoria justificarem. O trade-off é complexidade adicional em todas as queries e necessidade de limpeza periódica de registros muito antigos.

**Índices Estratégicos para Performance:**
Índices são criados estrategicamente em colunas frequentemente utilizadas em cláusulas WHERE, JOIN e ORDER BY. Chaves estrangeiras automaticamente recebem índices para otimizar joins. Colunas como status em projects e transactions recebem índices pois são frequentemente filtradas em dashboards administrativos.

Índices parciais são utilizados quando queries filtram por valores específicos. Por exemplo, índice em projects WHERE status = 'development' é menor e mais eficiente que índice completo, pois a maioria das queries administrativas foca em projetos ativos. Índices compostos otimizam queries que filtram por múltiplas colunas simultaneamente, como user_id e status juntos.

**Constraints para Integridade de Dados:**
Constraints do PostgreSQL garantem integridade sem necessidade de validação redundante no código. CHECK constraints validam ranges como progress BETWEEN 0 AND 100 e valores enum como status IN ('new', 'briefing', 'development'). NOT NULL previne valores ausentes em colunas obrigatórias. UNIQUE garante unicidade de valores como external_id em transactions. FOREIGN KEY com ON DELETE CASCADE propaga deleções automaticamente, enquanto ON DELETE SET NULL preserva registros órfãos com referência nula.

**Desnormalização Estratégica em JSONB:**
Campos JSONB como financial_data e metadata permitem armazenar estruturas complexas sem criar múltiplas tabelas relacionadas. financial_data contém objeto com total, paid, currency, next_payment_date e array de payment_plan. Esta desnormalização facilita queries que precisam de snapshot completo do estado financeiro sem joins.

O PostgreSQL fornece operadores poderosos para query de JSONB incluindo extração de chaves via ->, filtragem via @> e indexação via GIN. Porém, JSONB deve ser usado com cautela pois dificulta mudanças de schema e perde garantias de integridade referencial. Use apenas para dados semi-estruturados que mudam frequentemente ou variam entre registros.

### 2.2 Tabela profiles - Perfis de Usuário

Esta tabela estende a funcionalidade da tabela auth.users do Supabase, armazenando informações adicionais de perfil e controle de acesso. A tabela auth.users é gerenciada internamente pelo GoTrue e contém apenas dados essenciais de autenticação como email criptografado, hash de senha e confirmação de email.

**Estrutura e Campos:**

O campo id é chave primária UUID que referencia auth.users.id com ON DELETE CASCADE, garantindo que quando usuário é deletado do sistema de auth, seu perfil também é removido automaticamente. Esta foreign key garante que todo perfil tem usuário correspondente em auth.users.

O campo full_name armazena nome completo do usuário para exibição em interfaces, NOT NULL pois todo usuário deve ter nome. Diferente do email que é sensível e armazenado em auth.users, o nome pode ser público dentro do sistema.

O campo role define nível de acesso no sistema, com constraint CHECK limitando valores a 'admin' ou 'client'. Administradores têm acesso total a todos os projetos e funcionalidades administrativas, enquanto clientes veem apenas seus próprios projetos. O default 'client' garante que novos usuários sejam criados com privilégios mínimos por segurança.

Campos opcionais incluem avatar_url contendo URL pública da imagem de perfil que pode referenciar Supabase Storage ou serviço externo como Gravatar, phone para número de telefone formatado internacionalmente, e company_name para clientes empresariais que contratam projetos em nome de organização.

**Relacionamentos:**

profiles.id referencia auth.users.id como descrito acima. Múltiplas outras tabelas referenciam profiles.id via foreign keys, incluindo projects.user_id identificando dono do projeto, project_files.uploaded_by rastreando quem fez upload de cada arquivo, e notifications.user_id direcionando notificações.

**Padrões de Uso:**

Ao criar novo usuário via auth.signUp no GoTrue, um trigger ou função deve inserir registro correspondente em profiles automaticamente. O GoTrue não faz isso nativamente, então implementação via Database Trigger em auth.users ou RPC call do frontend é necessária.

Queries de perfil próprio são comuns e simples: SELECT * FROM profiles WHERE id = auth.uid(). Queries administrativas listam todos os perfis com filtros opcionais: SELECT * FROM profiles WHERE role = 'client' ORDER BY created_at DESC.

Atualizações de perfil são limitadas a campos não-sensíveis como nome e avatar. Mudança de role deve ser restrita a administradores para prevenir escalação de privilégios. Email e senha são gerenciados exclusivamente via APIs GoTrue, não através desta tabela.

### 2.3 Tabela projects - Projetos Contratados

Esta é a tabela central do sistema, armazenando estado completo de cada projeto de desenvolvimento contratado por clientes. Cada registro representa um contrato de projeto com ciclo de vida da criação à entrega.

**Estrutura e Campos:**

O campo id é UUID gerado automaticamente como chave primária, servindo como identificador único do projeto em toda a aplicação.

O campo user_id é foreign key NOT NULL referenciando profiles.id, estabelecendo relacionamento muitos-para-um onde um cliente pode ter múltiplos projetos mas cada projeto pertence a um único cliente. ON DELETE CASCADE garante que se cliente for removido, seus projetos também são deletados.

O campo name armazena título descritivo do projeto como "E-commerce de Vinhos Premium" ou "App Mobile de Delivery", NOT NULL pois todo projeto precisa de nome identificador.

O campo description opcional armazena texto longo com detalhes completos do escopo, podendo conter Markdown para formatação rica. Este campo é preenchido durante fase de briefing e serve como referência durante desenvolvimento.

O campo status controla workflow do projeto através de valores enum validados por CHECK constraint. Os valores possíveis são: 'new' para projeto recém-criado aguardando briefing do cliente, 'briefing' quando cliente enviou informações mas desenvolvimento não iniciou, 'development' durante construção ativa, 'review' quando aguardando aprovação de entrega pelo cliente, 'completed' após finalização e aceite, e 'cancelled' se projeto for cancelado por qualquer motivo. O default 'new' garante estado inicial consistente.

O campo progress é integer entre 0 e 100 validado por CHECK constraint, representando percentual de conclusão. Administradores atualizam manualmente conforme projeto avança. Alternativamente, pode ser calculado automaticamente via trigger baseado em milestones ou tarefas completadas em sistema de gerenciamento de tarefas.

O campo financial_data é JSONB armazenando objeto complexo com estrutura: total representando valor total do contrato em centavos ou unidades menores para evitar imprecisão de ponto flutuante, paid contendo valor já pago pelo cliente em mesma unidade, currency string como 'BRL' ou 'USD', next_payment_date timestamp ISO 8601 da próxima parcela vencendo, e payment_plan array de objetos contendo amount, due_date e status de cada parcela. Este campo permite flexibilidade para diferentes modelos de pagamento parcelado sem criar tabela separada de parcelas.

O campo metadata é JSONB livre para armazenar dados específicos variáveis entre projetos, como tecnologias utilizadas, prazo estimado de entrega, links para repositórios Git, credenciais de ambientes de staging, ou qualquer informação que não justifica coluna dedicada.

**Relacionamentos:**

projects.user_id referencia profiles.id como