
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Clipboard, Wand2 } from 'lucide-react';
import { Button } from '../../Button';

interface Props {
    onClose: () => void;
    onCreate: (data: any) => void;
}

export const CreateProjectModal: React.FC<Props> = ({ onClose, onCreate }) => {
    const [formData, setFormData] = useState({
        projectName: '',
        clientName: '',
        cpf: '',
        email: '',
        totalValue: ''
    });
    const [whatsappPaste, setWhatsappPaste] = useState('');
    const [showPasteArea, setShowPasteArea] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleFillTest = () => {
        const randomId = Math.floor(Math.random() * 1000);
        setFormData({
            projectName: `Projeto Teste #${randomId}`,
            clientName: 'Cliente Teste',
            cpf: '000.000.000-00',
            email: `teste${randomId}@exemplo.com`,
            totalValue: '1500.00'
        });
    };

    const handleParseWhatsapp = () => {
        if (!whatsappPaste) return;

        let name = '';
        let project = '';
        let value = '';
        let email = '';

        const nameMatch = whatsappPaste.match(/(?:Nome|Cliente|👤):\s*\*?([^\n\*]+)\*?/i);
        if (nameMatch) {
            name = nameMatch[1].trim();
        } else {
            const greetingMatch = whatsappPaste.match(/(?:Pronto|Olá|Oi),?\s*([^\!.,\n\r]+)/i);
            if (greetingMatch) {
                name = greetingMatch[1].replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '').trim();
            }
        }

        const projectMatch = whatsappPaste.match(/(?:Tipo|Pacote|Projeto|📦):\s*\*?([^\n\*]+)\*?/i);
        if (projectMatch) project = projectMatch[1].trim();

        const emailMatch = whatsappPaste.match(/[\w\.-]+@[\w\.-]+\.\w+/);
        if (emailMatch) email = emailMatch[0];

        const textUpper = whatsappPaste.toUpperCase();
        const estimateKeywords = ['ESTIMATIVA', 'VALOR FINAL', 'INVESTIMENTO', 'TOTAL'];
        let estimateSection = '';
        
        for (const keyword of estimateKeywords) {
            const idx = textUpper.lastIndexOf(keyword);
            if (idx !== -1) {
                estimateSection = whatsappPaste.substring(idx);
                break;
            }
        }

        const parseBRL = (str: string) => {
            const clean = str.replace(/[^\d,]/g, '');
            if (!clean) return 0;
            return parseFloat(clean.replace(/\./g, '').replace(',', '.'));
        };

        const pricesFound: number[] = [];
        let match;

        if (estimateSection) {
            const loosePriceRegex = /([\d\.]*[\d]+,\d{2})/g;
            while ((match = loosePriceRegex.exec(estimateSection)) !== null) {
                const p = parseBRL(match[1]);
                if (p > 0) pricesFound.push(p);
            }
            if (pricesFound.length > 0) {
                value = Math.max(...pricesFound).toFixed(2);
            }
        }

        if (!value) {
            const strictPriceRegex = /R\$\s*([\d\.]+(?:,\d{1,2})?)/gi;
            const allPrices: number[] = [];
            while ((match = strictPriceRegex.exec(whatsappPaste)) !== null) {
                allPrices.push(parseBRL(match[1]));
            }
            if (allPrices.length > 0) {
                value = allPrices[allPrices.length - 1].toFixed(2);
            }
        }

        if (name || project || value || email) {
            setFormData(prev => ({
                ...prev,
                clientName: name || prev.clientName,
                projectName: project || prev.projectName,
                totalValue: value || prev.totalValue,
                email: email || prev.email
            }));
            
            const btn = document.getElementById('auto-fill-btn');
            if(btn) {
                const originalText = btn.innerText;
                btn.innerText = 'Dados Extraídos! ✅';
                setTimeout(() => btn.innerText = originalText, 2000);
            }
        } else {
            alert("Não consegui identificar os dados automaticamente. Verifique se copiou o texto completo.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.projectName || !formData.email) return;
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        onCreate({
            ...formData,
            totalValue: Number(formData.totalValue) || 0
        });
        setIsLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                className="relative bg-white dark:bg-[#151921] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            >
                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                        <Plus size={20} className="text-primary-600"/> 
                        Novo Projeto
                    </h3>
                    <button onClick={onClose} className="hover:bg-gray-200 p-2 rounded-full transition-colors"><X size={20} className="text-gray-400" /></button>
                </div>
                
                <div className="px-6 pt-4 flex gap-2">
                    <button 
                        type="button"
                        onClick={() => setShowPasteArea(!showPasteArea)}
                        className="flex-1 py-2 px-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg flex items-center justify-center gap-2 text-green-700 text-xs font-bold transition-colors"
                    >
                        <Clipboard size={14} /> Importar WhatsApp
                    </button>
                    <button 
                        type="button"
                        onClick={handleFillTest}
                        className="py-2 px-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center justify-center text-indigo-700 text-xs font-bold transition-colors"
                        title="Preencher com dados de teste"
                    >
                        <Wand2 size={14} /> Teste
                    </button>
                </div>

                <div className="px-6">
                    <AnimatePresence>
                        {showPasteArea && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <textarea
                                    className="w-full mt-2 h-24 p-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none font-mono"
                                    placeholder="Cole aqui o resumo do WhatsApp..."
                                    value={whatsappPaste}
                                    onChange={(e) => setWhatsappPaste(e.target.value)}
                                />
                                <button 
                                    id="auto-fill-btn"
                                    type="button"
                                    onClick={handleParseWhatsapp}
                                    className="w-full mt-2 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-all"
                                >
                                    Auto-preencher Campos
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome do Projeto *</label>
                        <input 
                            required
                            placeholder="Ex: Landing Page Tech"
                            value={formData.projectName}
                            onChange={(e) => setFormData({...formData, projectName: e.target.value})}
                            className="w-full border rounded-lg p-2.5 text-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome do Cliente *</label>
                        <input 
                            required
                            placeholder="Ex: João da Silva"
                            value={formData.clientName}
                            onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                            className="w-full border rounded-lg p-2.5 text-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CPF do Cliente</label>
                        <input 
                            placeholder="000.000.000-00"
                            value={formData.cpf}
                            onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                            className="w-full border rounded-lg p-2.5 text-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">E-mail do Cliente *</label>
                        <input 
                            required
                            type="email"
                            placeholder="cliente@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full border rounded-lg p-2.5 text-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Valor Total Estimado (R$)</label>
                        <input 
                            type="number"
                            placeholder="0.00"
                            value={formData.totalValue}
                            onChange={(e) => setFormData({...formData, totalValue: e.target.value})}
                            className="w-full border rounded-lg p-2.5 text-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 font-mono" 
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancelar</Button>
                        <Button type="submit" isLoading={isLoading} className="flex-1">Criar Projeto</Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};
