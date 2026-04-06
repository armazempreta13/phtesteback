
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, FileText, Palette, Layout, Globe, Server, Send, Loader2, Target, MessageSquare, Image as ImageIcon, Link as LinkIcon, Settings, HelpCircle, AlertCircle } from 'lucide-react';
import { ClientProject, DetailedBriefingData } from '../../../types';
import { Button } from '../../Button';
import { useContent } from '../../../contexts/ContentContext';

interface Props {
    project: ClientProject;
    onClose: () => void;
    onSave: (id: string, data: Partial<ClientProject>) => void;
}

// Configuração das Abas para melhor organização
const TABS = [
    { id: 'strategy', label: 'Estratégia', icon: Target },
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'content', label: 'Conteúdo', icon: FileText },
    { id: 'tech', label: 'Técnico', icon: Server }
];

export const ProjectBriefingModal: React.FC<Props> = ({ project, onClose, onSave }) => {
    const { content } = useContent();
    const FORMSPREE_ID = content.contact.FORMSPREE_ID;

    const [activeTab, setActiveTab] = useState('strategy');
    const [isSending, setIsSending] = useState(false);
    
    // Inicialização segura dos dados, garantindo que novos campos não quebrem briefings antigos
    const [formData, setFormData] = useState<DetailedBriefingData>({
        businessSummary: project.briefing?.businessSummary || '',
        objective: project.briefing?.objective || '',
        targetAudience: project.briefing?.targetAudience || '',
        usp: project.briefing?.usp || '',
        competitors: project.briefing?.competitors || '',
        
        brandingStatus: project.briefing?.brandingStatus || '',
        colors: project.briefing?.colors || '',
        typographyPreference: project.briefing?.typographyPreference || '',
        logoStatus: project.briefing?.logoStatus || '',
        visualVibe: project.briefing?.visualVibe || '',
        
        sitemap: project.briefing?.sitemap || '',
        copyStatus: project.briefing?.copyStatus || '',
        mediaStatus: project.briefing?.mediaStatus || '',
        
        referenceSites: project.briefing?.referenceSites || '',
        referenceDislikes: project.briefing?.referenceDislikes || '',
        
        functionalities: project.briefing?.functionalities || [],
        integrations: project.briefing?.integrations || '',
        
        hostingStatus: project.briefing?.hostingStatus || '',
        domainName: project.briefing?.domainName || '',
        deadline: project.briefing?.deadline || '',
        notes: project.briefing?.notes || ''
    });

    const handleChange = (field: keyof DetailedBriefingData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveAndSend = async () => {
        setIsSending(true);

        // 1. Salvar Localmente / DB (Prioridade Máxima)
        onSave(project.id, { briefing: formData });

        // 2. Preparar Payload Bonito para Formspree
        if (!FORMSPREE_ID || FORMSPREE_ID === 'SEU_ID_AQUI') {
            alert("Briefing salvo no sistema! (Envio de e-mail cancelado: Formspree ID não configurado)");
            setIsSending(false);
            onClose();
            return;
        }

        const emailPayload = {
            _subject: `📋 Briefing Detalhado: ${project.projectName} - ${project.clientName}`,
            _replyto: project.email,
            
            // CABEÇALHO
            "CLIENTE": project.clientName,
            "PROJETO": project.projectName,
            "DATA": new Date().toLocaleDateString('pt-BR'),

            // 1. ESTRATÉGIA
            "--- 1. ESTRATÉGIA DE NEGÓCIO ---": "--------------------------------",
            "RESUMO DO NEGÓCIO": formData.businessSummary || "N/A",
            "OBJETIVO PRINCIPAL": formData.objective || "N/A",
            "PÚBLICO-ALVO": formData.targetAudience || "N/A",
            "DIFERENCIAL (USP)": formData.usp || "N/A",
            "CONCORRENTES": formData.competitors || "N/A",

            // 2. DESIGN
            "--- 2. IDENTIDADE VISUAL ---": "--------------------------------",
            "STATUS DA MARCA": formData.brandingStatus || "N/A",
            "PREFERÊNCIA DE CORES": formData.colors || "N/A",
            "ESTILO VISUAL (VIBE)": formData.visualVibe || "N/A",
            "LOGO": formData.logoStatus || "N/A",
            "TIPOGRAFIA": formData.typographyPreference || "N/A",

            // 3. CONTEÚDO E REFERÊNCIAS
            "--- 3. CONTEÚDO & REFERÊNCIAS ---": "--------------------------------",
            "SITEMAP (PÁGINAS)": formData.sitemap || "N/A",
            "QUEM ESCREVE OS TEXTOS?": formData.copyStatus || "N/A",
            "QUEM FORNECE FOTOS?": formData.mediaStatus || "N/A",
            "REFERÊNCIAS (GOSTA)": formData.referenceSites || "N/A",
            "O QUE NÃO GOSTA": formData.referenceDislikes || "N/A",

            // 4. TÉCNICO
            "--- 4. TÉCNICO & FUNCIONAL ---": "--------------------------------",
            "FUNCIONALIDADES": formData.functionalities.join(', ') || "Básico",
            "INTEGRAÇÕES": formData.integrations || "N/A",
            "DOMÍNIO": formData.domainName || "N/A",
            "HOSPEDAGEM": formData.hostingStatus || "N/A",
            "PRAZO IDEAL": formData.deadline || "N/A",
            "NOTAS FINAIS": formData.notes || "N/A"
        };

        try {
            const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
                method: 'POST',
                body: JSON.stringify(emailPayload),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                alert("Briefing salvo no CRM e enviado para seu e-mail com sucesso!");
            } else {
                alert("Briefing salvo no sistema, mas houve um erro ao enviar o e-mail.");
            }
        } catch (error) {
            console.error(error);
            alert("Briefing salvo no sistema (Erro de conexão no envio do e-mail).");
        } finally {
            setIsSending(false);
            onClose();
        }
    };

    // Componente de Campo com Explicação
    const FieldBlock = ({ 
        label, 
        field, 
        placeholder, 
        explanation, 
        rows = 3,
        type = "textarea"
    }: { 
        label: string, 
        field: keyof DetailedBriefingData, 
        placeholder?: string, 
        explanation: string,
        rows?: number,
        type?: "textarea" | "input"
    }) => (
        <div className="mb-8 group">
            <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-bold text-gray-800 dark:text-gray-100">{label}</label>
                <div className="relative group/tooltip">
                    <HelpCircle size={14} className="text-gray-400 cursor-help" />
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 w-64 bg-gray-900 text-white text-xs p-2 rounded shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
                        {explanation}
                    </div>
                </div>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">{explanation}</p>
            
            {type === "textarea" ? (
                <textarea 
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-y shadow-sm text-gray-900 dark:text-white"
                    rows={rows}
                    placeholder={placeholder}
                    value={formData[field] as string}
                    onChange={(e) => handleChange(field, e.target.value)}
                />
            ) : (
                <input 
                    type="text"
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm text-gray-900 dark:text-white"
                    placeholder={placeholder}
                    value={formData[field] as string}
                    onChange={(e) => handleChange(field, e.target.value)}
                />
            )}
        </div>
    );

    const SectionTitle = ({ title, icon: Icon }: { title: string, icon: any }) => (
        <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-100 dark:border-gray-800">
            <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600">
                <Icon size={20} />
            </div>
            <h4 className="font-bold text-lg text-gray-900 dark:text-white">{title}</h4>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-gray-100/50 dark:bg-black/50 backdrop-blur-sm overflow-hidden">
            <motion.div 
                initial={{ scale: 0.98, opacity: 0, y: 10 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                className="relative bg-white dark:bg-[#151921] w-full max-w-5xl h-full md:h-[90vh] md:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-[#1A1D24] shrink-0">
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-lg">
                            <FileText size={20} className="text-primary-600"/> Briefing de Projeto
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">Preencha com o máximo de detalhes possível para garantir o alinhamento.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"><X size={20} className="text-gray-400" /></button>
                </div>

                <div className="flex flex-col md:flex-row h-full overflow-hidden">
                    
                    {/* Sidebar Tabs */}
                    <div className="w-full md:w-64 bg-gray-50 dark:bg-[#0F1115] border-r border-gray-100 dark:border-gray-800 flex md:flex-col overflow-x-auto md:overflow-visible shrink-0">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all border-l-4 whitespace-nowrap md:whitespace-normal ${
                                    activeTab === tab.id 
                                    ? 'bg-white dark:bg-[#151921] text-primary-600 border-primary-600 shadow-sm' 
                                    : 'text-gray-500 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800/50'
                                }`}
                            >
                                <tab.icon size={18} /> {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-gray-50/30 dark:bg-[#151921]">
                        
                        {activeTab === 'strategy' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto">
                                <SectionTitle title="Estratégia & Negócio" icon={Target} />
                                
                                <FieldBlock 
                                    label="Resumo do Negócio" 
                                    field="businessSummary" 
                                    explanation="Descreva o que sua empresa faz, quais produtos/serviços vende e há quanto tempo está no mercado."
                                    placeholder="Ex: Somos uma consultoria financeira focada em pequenas empresas, atuando há 5 anos..."
                                />
                                
                                <FieldBlock 
                                    label="Objetivo do Site" 
                                    field="objective" 
                                    explanation="Para que serve este site? Vender diretamente? Captar leads (contatos)? Apenas informar? Fortalecer a marca?"
                                    placeholder="Ex: O objetivo principal é fazer o cliente agendar uma reunião pelo WhatsApp."
                                />

                                <div className="grid md:grid-cols-2 gap-6">
                                    <FieldBlock 
                                        label="Público-Alvo" 
                                        field="targetAudience" 
                                        explanation="Quem é seu cliente ideal? Idade, profissão, gênero, dores e desejos."
                                        placeholder="Ex: Mulheres de 25-40 anos, empresárias, que buscam praticidade..."
                                    />
                                    <FieldBlock 
                                        label="Diferencial (USP)" 
                                        field="usp" 
                                        explanation="Por que o cliente deve escolher você e não o concorrente? O que você tem de único?"
                                        placeholder="Ex: Atendimento 24h, Metodologia exclusiva, Preço mais baixo..."
                                    />
                                </div>

                                <FieldBlock 
                                    label="Principais Concorrentes" 
                                    field="competitors" 
                                    explanation="Liste sites de concorrentes diretos ou indiretos para analisarmos o que eles fazem bem (e mal)."
                                    placeholder="Ex: www.concorrente1.com.br, www.rival.com"
                                    rows={2}
                                />
                            </motion.div>
                        )}

                        {activeTab === 'design' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto">
                                <SectionTitle title="Design & Identidade" icon={Palette} />

                                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900 rounded-xl mb-8 flex gap-3 text-sm text-blue-800 dark:text-blue-300">
                                    <AlertCircle size={20} className="shrink-0"/>
                                    <p>Se você já possui um Manual de Marca ou Guia de Estilo em PDF/Figma, pode pular os detalhes de cor e tipografia e apenas mencionar que enviará o arquivo.</p>
                                </div>

                                <FieldBlock 
                                    label="Vibe Visual (Adjetivos)" 
                                    field="visualVibe" 
                                    explanation="Quais 3 palavras descrevem a sensação que o site deve passar?"
                                    placeholder="Ex: Minimalista, Tecnológico e Sério. OU Colorido, Divertido e Jovem."
                                    type="input"
                                />

                                <div className="grid md:grid-cols-2 gap-6">
                                    <FieldBlock 
                                        label="Cores da Marca" 
                                        field="colors" 
                                        explanation="Quais são as cores principais? Se tiver os códigos Hex (ex: #0000FF), melhor ainda."
                                        placeholder="Azul Marinho e Dourado..."
                                        type="input"
                                    />
                                    <FieldBlock 
                                        label="Status do Logo" 
                                        field="logoStatus" 
                                        explanation="Você tem o logo em alta qualidade (Vetor/PNG sem fundo) ou precisa criar/vetorizar?"
                                        placeholder="Tenho em PDF vetorizado."
                                        type="input"
                                    />
                                </div>

                                <FieldBlock 
                                    label="Sites de Referência (Inspiração)" 
                                    field="referenceSites" 
                                    explanation="Cole links de sites que você acha bonitos, mesmo que sejam de outras áreas. Diga O QUE você gostou neles."
                                    placeholder="Gosto do site da Apple pela limpeza. Gosto do site X pelo menu..."
                                />

                                <FieldBlock 
                                    label="O que EVITAR" 
                                    field="referenceDislikes" 
                                    explanation="O que você odeia em sites? Cores, fontes, animações exageradas, pop-ups..."
                                    placeholder="Não gosto de fundo preto. Odeio menus escondidos..."
                                    rows={2}
                                />
                            </motion.div>
                        )}

                        {activeTab === 'content' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto">
                                <SectionTitle title="Estrutura & Conteúdo" icon={FileText} />

                                <FieldBlock 
                                    label="Mapa do Site (Páginas)" 
                                    field="sitemap" 
                                    explanation="Quais páginas o site precisa ter? Liste todas."
                                    placeholder="Ex: Home, Sobre Nós, Serviços (com sub-páginas), Blog, Contato, Página de Captura..."
                                />

                                <div className="grid md:grid-cols-2 gap-6">
                                    <FieldBlock 
                                        label="Textos (Copywriting)" 
                                        field="copyStatus" 
                                        explanation="Quem vai escrever os textos? Você já tem tudo pronto, vai escrever, ou precisa contratar um redator?"
                                        placeholder="Vou fornecer os textos em Word."
                                        type="input"
                                    />
                                    <FieldBlock 
                                        label="Fotos e Vídeos" 
                                        field="mediaStatus" 
                                        explanation="Você tem fotos profissionais da empresa/produtos? Ou usaremos banco de imagens?"
                                        placeholder="Tenho fotos do escritório. Preciso de banco de imagem para o resto."
                                        type="input"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'tech' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto">
                                <SectionTitle title="Técnico & Funcionalidades" icon={Server} />

                                <FieldBlock 
                                    label="Funcionalidades Específicas" 
                                    field="notes" /* Usando notes temporariamente ou criar campo novo se preferir */
                                    explanation="O site precisa fazer algo especial além de mostrar informações? (Ex: Filtros avançados, Área de membros, Calculadora, Agendamento)"
                                    placeholder="Preciso de um formulário que calcule orçamento na hora..."
                                />

                                <FieldBlock 
                                    label="Integrações" 
                                    field="integrations" 
                                    explanation="O site precisa conectar com alguma ferramenta externa? (CRM, Email Marketing, Pixel do Facebook, Google Analytics)"
                                    placeholder="Integrar com Mailchimp e RD Station."
                                    type="input"
                                />

                                <div className="grid md:grid-cols-2 gap-6">
                                    <FieldBlock 
                                        label="Domínio (www)" 
                                        field="domainName" 
                                        explanation="Você já comprou o endereço (ex: empresa.com.br)? Se sim, onde?"
                                        placeholder="Já tenho no Registro.br"
                                        type="input"
                                    />
                                    <FieldBlock 
                                        label="Hospedagem" 
                                        field="hostingStatus" 
                                        explanation="Você já tem servidor? Se não, eu cuido disso (recomendado Vercel/Netlify para performance)."
                                        placeholder="Não tenho, aceito sugestão."
                                        type="input"
                                    />
                                </div>

                                <FieldBlock 
                                    label="Prazo Ideal" 
                                    field="deadline" 
                                    explanation="Para quando você precisa do site no ar? Existe algum evento ou lançamento atrelado a essa data?"
                                    placeholder="Preciso lançar dia 15 do próximo mês."
                                    type="input"
                                />
                            </motion.div>
                        )}

                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1A1D24] flex justify-end gap-3 shrink-0">
                    <Button variant="ghost" onClick={onClose} disabled={isSending}>Cancelar e Fechar</Button>
                    <Button 
                        onClick={handleSaveAndSend} 
                        leftIcon={isSending ? <Loader2 size={16} className="animate-spin"/> : <Send size={16}/>}
                        isLoading={isSending}
                        className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/20"
                    >
                        {isSending ? 'Processando...' : 'Salvar & Enviar por E-mail'}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};
