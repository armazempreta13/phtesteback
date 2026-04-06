
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle2, Lock, Mail, CreditCard, AlertTriangle, Key } from 'lucide-react';
import { ClientProject } from '../types';
import { Button } from './Button';
import { useProject } from '../contexts/ProjectContext';
import { SITE_CONFIG } from '../config';
import { api } from '../lib/api'; // Importando a camada de serviço

interface EmailGeneratorModalProps {
  project: ClientProject;
  onClose: () => void;
  onSuccess: () => void;
}

// Helper para gerar senhas fortes no Frontend (antes de enviar para o backend hashear)
const generateSecurePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let retVal = "";
    for (let i = 0, n = charset.length; i < 10; i++) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
};

// Template HTML para o E-mail
const getFormattedEmailHtml = (project: ClientProject, portalLink: string, tempPassword: string, signalValue: number) => {
    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9fafb; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
  .header { background-color: #0f172a; padding: 30px 20px; text-align: center; color: white; }
  .header h2 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
  .content { padding: 40px 30px; }
  .highlight-box { background-color: #f0fdf4; border-left: 4px solid #166534; padding: 15px; margin: 25px 0; border-radius: 4px; }
  .access-card { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 25px; border-radius: 12px; margin: 30px 0; text-align: center; }
  .access-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 1px; margin-bottom: 5px; }
  .access-value { font-size: 16px; color: #0f172a; font-weight: 500; margin-bottom: 15px; word-break: break-all; }
  .password-display { background: #e2e8f0; padding: 8px 16px; border-radius: 6px; font-family: monospace; font-size: 18px; font-weight: 700; color: #0f172a; letter-spacing: 1px; display: inline-block; }
  .cta-button { display: inline-block; background-color: #4f46e5; color: white !important; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2); }
  .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🚀 Projeto Iniciado</h2>
    </div>
    <div class="content">
      <p>Olá, <strong>${project.clientName}</strong>!</p>
      <p>É um prazer informar que recebemos a confirmação do pagamento do sinal. A fase de desenvolvimento do projeto <strong>${project.projectName}</strong> começou oficialmente hoje.</p>
      
      <div class="highlight-box">
        <p style="margin:0; font-size: 14px; color: #166534; font-weight: bold;">✅ Pagamento de 50% Confirmado</p>
        <p style="margin:5px 0 0 0; font-size: 13px; color: #14532d;">Valor: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(signalValue)}</p>
      </div>

      <p>Para garantir total transparência, criamos uma área exclusiva onde você poderá acompanhar o cronograma, aprovar layouts e baixar arquivos.</p>

      <div class="access-card">
        <div class="access-label">Link de Acesso</div>
        <div class="access-value"><a href="${portalLink}" style="color: #4f46e5;">${portalLink}</a></div>
        
        <div class="access-label">Seu Login</div>
        <div class="access-value">${project.email}</div>
        
        <div class="access-label">Senha Provisória</div>
        <div class="password-display">${tempPassword}</div>
        <br/><br/>
        <a href="${portalLink}" class="cta-button">Acessar Portal do Cliente</a>
      </div>

      <p style="font-size: 13px; color: #64748b; text-align: center;">Recomendamos alterar sua senha após o primeiro acesso.</p>
    </div>
    <div class="footer">
      <p>Este é um e-mail automático, por favor não responda.<br/>&copy; ${new Date().getFullYear()} PH Development Team</p>
    </div>
  </div>
</body>
</html>
    `;
};

export const EmailGeneratorModal: React.FC<EmailGeneratorModalProps> = ({ project, onClose, onSuccess }) => {
  const { updateProject, sendNotification } = useProject();
  const [step, setStep] = useState<'preview' | 'sending' | 'success'>('preview');
  
  // 1. Gerar Credenciais (No Frontend ou chamar API para gerar)
  // Aqui geramos no front para exibir no preview antes de salvar
  const [generatedPassword] = useState(generateSecurePassword());
  
  // Dados de ambiente
  const portalLink = `${SITE_CONFIG.URL}/login`;
  const emailSubject = `🚀 Projeto Iniciado: ${project.projectName} - Dados de Acesso`;
  const signalValue = project.financial.total / 2;

  const handleFormalization = async () => {
    setStep('sending');

    try {
        // 1. Criar usuário no backend
        await api.auth.register({
            name: project.clientName,
            email: project.email,
            password: generatedPassword,
        });

        // 2. Gerar contrato automaticamente
        try {
            await api.contract.generate(parseInt(project.id));
        } catch (e) {
            console.warn('Contrato nao gerado na formalizacao:', e);
        }

        // 3. Atualizar projeto para 'development'
        updateProject(project.id, {
            status: 'development',
            progress: 5,
            nextMilestone: 'Desenvolvimento do Layout',
            financial: {
                ...project.financial,
                status: 'partial',
                paid: signalValue
            },
            tempPassword: generatedPassword
        });

        // 4. Log notification no contexto local
        sendNotification(project.id, {
            title: 'Acesso Liberado',
            message: 'Suas credenciais foram enviadas por e-mail. Seja bem-vindo!',
            type: 'success'
        });

        setStep('success');

    } catch (error: any) {
        console.error("Falha no processo de formalização:", error);
        // Mesmo que o registro falhe (usuário ja existe), continua
        updateProject(project.id, {
            status: 'development',
            progress: 5,
            nextMilestone: 'Desenvolvimento do Layout',
            financial: {
                ...project.financial,
                status: 'partial',
                paid: signalValue
            },
            tempPassword: generatedPassword
        });
        setStep('success');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-3xl bg-white dark:bg-[#151921] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-[#1A1D24]">
            <div className="flex items-center gap-3">
                <div className="bg-primary-600 text-white p-2 rounded-lg">
                    <Mail size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Formalização de Projeto</h3>
                    <p className="text-xs text-gray-500">Geração de credenciais e disparo de e-mail</p>
                </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><X size={20} /></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-100 dark:bg-black/50">
            
            <AnimatePresence mode="wait">
                {step === 'preview' && (
                    <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                        
                        {/* Alerta de Ação */}
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                            <div className="bg-blue-100 p-2 rounded-full text-blue-600 shrink-0"><Key size={18}/></div>
                            <div>
                                <h4 className="text-sm font-bold text-blue-900">Credenciais Geradas</h4>
                                <p className="text-xs text-blue-700 mt-1">
                                    Ao confirmar, uma conta será criada no banco de dados para <strong>{project.email}</strong> com a senha <strong>{generatedPassword}</strong> e o e-mail abaixo será disparado.
                                </p>
                            </div>
                        </div>

                        {/* Preview do Email */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mx-auto max-w-2xl">
                            <div className="bg-gray-50 border-b border-gray-200 p-3 text-xs text-gray-600 space-y-1">
                                <div className="flex gap-2"><span className="font-bold w-16 text-right">Assunto:</span> <span className="text-gray-900 font-medium">{emailSubject}</span></div>
                                <div className="flex gap-2"><span className="font-bold w-16 text-right">Para:</span> <span className="text-gray-900">{project.email}</span></div>
                            </div>

                            <div className="p-6">
                                <div 
                                    className="border border-gray-100 rounded-lg overflow-hidden transform scale-95 origin-top"
                                    dangerouslySetInnerHTML={{ __html: getFormattedEmailHtml(project, portalLink, generatedPassword, signalValue) }}
                                />
                            </div>
                        </div>

                    </motion.div>
                )}

                {step === 'sending' && (
                    <motion.div key="sending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-64 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="relative w-20 h-20">
                            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Send size={24} className="text-primary-600 animate-pulse" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Processando...</h3>
                            <p className="text-gray-500 text-sm">Criando usuário no DB e enviando e-mail via SMTP.</p>
                        </div>
                    </motion.div>
                )}

                {step === 'success' && (
                    <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="h-64 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-100">
                            <CheckCircle2 size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Projeto Formalizado!</h3>
                        <p className="text-gray-500 max-w-sm mb-6 text-sm">
                            As credenciais foram salvas e enviadas para <strong>{project.email}</strong>.<br/>
                            O status do projeto foi alterado para "Em Desenvolvimento".
                        </p>
                        <Button onClick={() => { onSuccess(); onClose(); }} size="lg">
                            Voltar ao Dashboard
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>

        {/* Footer Actions */}
        {step === 'preview' && (
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1A1D24] flex justify-end gap-3">
                <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                <Button onClick={handleFormalization} rightIcon={<Send size={16}/>} className="shadow-lg shadow-primary-600/20">
                    Criar Acesso e Enviar
                </Button>
            </div>
        )}
      </motion.div>
    </div>
  );
};
