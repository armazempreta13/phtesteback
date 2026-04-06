
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Copy, AlertTriangle, ShieldCheck, Clock, Check, AlertCircle } from 'lucide-react';
import { PaymentOrder } from '../types';
import { Button } from './Button';

interface CheckoutScreenProps {
    order: PaymentOrder;
    onPaymentConfirmed?: () => void; // Apenas para simulação local se necessário
}

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ order }) => {
    const [copied, setCopied] = useState(false);
    const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutos de urgência visual

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(order.pixCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Gera a imagem do QR Code usando uma API pública rápida (já que não temos bibliotecas npm instaladas aqui)
    // Se estivesse usando Mercado Pago Real, usaria `order.qrBase64` como src
    const qrCodeUrl = order.qrBase64 
        ? `data:image/png;base64,${order.qrBase64}`
        : `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(order.pixCode)}&bgcolor=ffffff`;

    return (
        <div className="w-full max-w-2xl mx-auto bg-white dark:bg-[#1A1D24] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-8 md:p-10">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Finalize seu pagamento via PIX</h2>
                    <p className="text-gray-500 text-sm">
                        {order.description} • <span className="font-bold text-gray-900 dark:text-white">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.amount)}
                        </span>
                    </p>
                </div>

                <div className="flex flex-col items-center">
                    
                    {/* QR Code Box */}
                    <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-gray-200 mb-6 shadow-sm">
                        <img 
                            src={qrCodeUrl} 
                            alt="QR Code Pix" 
                            className="w-48 h-48 md:w-56 md:h-56 object-contain mix-blend-multiply dark:mix-blend-normal"
                        />
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6 max-w-sm">
                        Abra o app do seu banco, escolha <strong>Pix &gt; Ler QR Code</strong> e aponte a câmera, ou use o botão abaixo.
                    </p>

                    {/* Copy Paste */}
                    <div className="w-full max-w-sm mb-8">
                        <button
                            onClick={handleCopy}
                            className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg transform active:scale-95 ${
                                copied 
                                ? 'bg-green-500 text-white shadow-green-500/30' 
                                : 'bg-yellow-400 hover:bg-yellow-500 text-yellow-950 shadow-yellow-400/30'
                            }`}
                        >
                            {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                            {copied ? 'Código Copiado!' : 'Copiar código Pix'}
                        </button>
                        
                        <div className="flex items-center justify-center gap-2 mt-4 text-xs font-mono text-gray-400">
                            <Clock size={12} />
                            <span>Expira em: {formatTime(timeLeft)}</span>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="w-full bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 text-sm text-gray-600 dark:text-gray-400 space-y-3 border border-gray-100 dark:border-gray-700">
                        <div className="flex gap-3">
                            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">1</div>
                            <p>Abra o aplicativo do seu banco e vá para a área Pix.</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">2</div>
                            <p>Selecione "Pagar com QR Code" ou "Pix Copia e Cola".</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">3</div>
                            <p>Confirme os dados e finalize o pagamento. A aprovação é imediata.</p>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center gap-2 text-[10px] text-green-600 bg-green-50 dark:bg-green-900/10 px-3 py-1.5 rounded-full">
                        <ShieldCheck size={12} />
                        Ambiente Seguro • Pagamento Instantâneo
                    </div>

                </div>
            </div>
            
            {/* Footer Alert */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 text-center border-t border-blue-100 dark:border-blue-900/30">
                <p className="text-xs text-blue-800 dark:text-blue-300 flex items-center justify-center gap-2">
                    <AlertCircle size={14} />
                    Após o pagamento, o acesso será liberado automaticamente.
                </p>
            </div>
        </div>
    );
};
