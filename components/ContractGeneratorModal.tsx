import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, Copy, FileText, CheckCircle2, PenTool, Eraser, Undo, Download, ShieldAlert, AlertCircle, Send, Mail, UserCheck, Lock, ArrowDown } from 'lucide-react';
import { ClientProject } from '../types';
import { Button } from './Button';

interface ContractModalProps {
  project: ClientProject;
  onClose: () => void;
  userRole?: 'admin' | 'client';
  onContractUpdate?: (data: any) => void;
}

const SignaturePad = ({ onSave, onCancel }: { onSave: (dataUrl: string) => void, onCancel: () => void }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [points, setPoints] = useState<{x: number, y: number, time: number}[]>([]);
    const [error, setError] = useState<string | null>(null);
    
    const MIN_WIDTH = 1.0;
    const MAX_WIDTH = 4.0;
    const VELOCITY_FILTER_WEIGHT = 0.7;
    const MIN_SIGNATURE_LENGTH = 250; 
    
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
    const lastWidth = useRef(MAX_WIDTH);
    const totalDistance = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const initCanvas = () => {
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            const rect = canvas.getBoundingClientRect();
            
            if (rect.width === 0 || rect.height === 0) {
                setTimeout(initCanvas, 50);
                return;
            }

            canvas.width = rect.width * ratio;
            canvas.height = rect.height * ratio;
            
            const context = canvas.getContext('2d');
            if (context) {
                context.scale(ratio, ratio);
                context.lineCap = 'round';
                context.lineJoin = 'round';
                context.strokeStyle = '#000000';
                setCtx(context);
            }
        };

        const timer = setTimeout(initCanvas, 100);

        const preventDefault = (e: TouchEvent) => {
            if (e.target === canvas) e.preventDefault();
        };
        document.body.addEventListener('touchstart', preventDefault, { passive: false });
        document.body.addEventListener('touchmove', preventDefault, { passive: false });
        document.body.addEventListener('touchend', preventDefault, { passive: false });

        return () => {
            clearTimeout(timer);
            document.body.removeEventListener('touchstart', preventDefault);
            document.body.removeEventListener('touchmove', preventDefault);
            document.body.removeEventListener('touchend', preventDefault);
        };
    }, []);

    const getPoint = (e: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0, time: 0 };
        const rect = canvas.getBoundingClientRect();
        
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as any).clientX;
            clientY = (e as any).clientY;
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top,
            time: new Date().getTime()
        };
    };

    const startDrawing = (e: any) => {
        setIsDrawing(true);
        setError(null);
        const point = getPoint(e);
        setPoints([point]);
        
        if (ctx) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, (MAX_WIDTH + MIN_WIDTH) / 4, 0, Math.PI * 2);
            ctx.fillStyle = 'black';
            ctx.fill();
        }
        lastWidth.current = (MAX_WIDTH + MIN_WIDTH) / 2;
    };

    const draw = (e: any) => {
        if (!isDrawing || !ctx) return;
        e.preventDefault(); 

        const point = getPoint(e);
        const newPoints = [...points, point];
        setPoints(newPoints);

        if (newPoints.length > 2) {
            const lastPoint = newPoints[newPoints.length - 2];
            const controlPoint = newPoints[newPoints.length - 3];
            const endPoint = {
                x: (lastPoint.x + point.x) / 2,
                y: (lastPoint.y + point.y) / 2,
            };

            const dist = Math.sqrt(Math.pow(point.x - lastPoint.x, 2) + Math.pow(point.y - lastPoint.y, 2));
            const time = point.time - lastPoint.time;
            const velocity = time > 0 ? dist / time : 0;
            
            totalDistance.current += dist;

            const targetWidth = Math.max(MIN_WIDTH, MAX_WIDTH / (velocity + 1));
            const newWidth = lastWidth.current * VELOCITY_FILTER_WEIGHT + targetWidth * (1 - VELOCITY_FILTER_WEIGHT);

            ctx.beginPath();
            ctx.moveTo(controlPoint.x, controlPoint.y);
            ctx.quadraticCurveTo(lastPoint.x, lastPoint.y, endPoint.x, endPoint.y);
            ctx.lineWidth = newWidth;
            ctx.stroke();

            lastWidth.current = newWidth;
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setPoints([]);
            totalDistance.current = 0; 
            setError(null);
        }
    };

    const handleSave = () => {
        if (totalDistance.current < MIN_SIGNATURE_LENGTH) {
            setError("Assinatura muito curta. Por favor, assine seu nome completo.");
            return;
        }

        const canvas = canvasRef.current;
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/png');
            onSave(dataUrl);
        }
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 print:hidden">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden"
            >
                <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2"><PenTool size={18} className="text-primary-600"/> Assinatura Digital</h3>
                    <button onClick={onCancel} className="text-gray-400 hover:text-red-500"><X size={20}/></button>
                </div>
                
                <div className="p-5 bg-gray-100 relative">
                    <div className={`relative bg-white rounded-xl border-2 border-dashed overflow-hidden cursor-crosshair shadow-inner touch-none h-64 transition-colors duration-300 ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}>
                        <div className="absolute bottom-16 left-10 right-10 border-b border-gray-200 pointer-events-none"></div>
                        <p className="absolute bottom-12 right-10 text-[10px] text-gray-300 pointer-events-none uppercase tracking-widest">Assine acima</p>
                        
                        <canvas 
                            ref={canvasRef}
                            className="w-full h-full block"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                        />
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute bottom-20 left-0 right-0 flex justify-center pointer-events-none"
                            >
                                <div className="bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                                    <AlertCircle size={14} /> {error}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex justify-between items-center px-5 py-4 border-t border-gray-100 bg-white">
                    <button onClick={clearCanvas} className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors font-medium">
                        <Eraser size={16} /> Limpar
                    </button>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={onCancel} size="sm">Cancelar</Button>
                        <Button onClick={handleSave} size="sm" leftIcon={<CheckCircle2 size={16}/>} className="bg-primary-600 text-white hover:bg-primary-700">Confirmar</Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export const ContractGeneratorModal: React.FC<ContractModalProps> = ({ project, onClose, userRole = 'admin', onContractUpdate }) => {
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasReadContract, setHasReadContract] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const [adminSig, setAdminSig] = useState<string | null>(project.contract?.adminSignature || null);
  const [clientSig, setClientSig] = useState<string | null>(project.contract?.clientSignature || null);
  const [status, setStatus] = useState<'draft' | 'sent_to_client' | 'signed'>(project.contract?.status || 'draft');

  const currentDate = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  const formattedValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.financial.total);

  useEffect(() => {
      const checkHeight = () => {
          if (scrollContainerRef.current) {
              const { scrollHeight, clientHeight } = scrollContainerRef.current;
              if (scrollHeight <= clientHeight + 50) {
                  setHasReadContract(true);
              }
          }
      };
      
      setTimeout(checkHeight, 300);
      window.addEventListener('resize', checkHeight);
      return () => window.removeEventListener('resize', checkHeight);
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      if (hasReadContract) return;

      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      if (scrollHeight - scrollTop <= clientHeight + 50) {
          setHasReadContract(true);
      }
  };

  const handleScrollToBottom = () => {
      if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
              top: scrollContainerRef.current.scrollHeight,
              behavior: 'smooth'
          });
      }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    const content = document.getElementById('contract-content');
    if (!content) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Permita popups para baixar o PDF');
      return;
    }

    const fileName = `Contrato_${project.projectName.replace(/\s+/g, '_')}_${project.clientName.replace(/\s+/g, '_')}`;

    printWindow.document.write(`
<!DOCTYPE html>
<html><head><title>${fileName}</title>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; color: #000; }
  .page { width: 210mm; padding: 15mm 18mm; margin: 0 auto; }
  .page h1 { text-align: center; margin-bottom: 10pt; padding-bottom: 6pt; border-bottom: 2px solid #000; color: #000; font-size: 12pt; letter-spacing: 1px; font-weight: bold; }
  .page h2 { font-size: 9.5pt; font-weight: bold; margin-top: 8pt; margin-bottom: 3pt; text-transform: uppercase; color: #000; border-bottom: 0.5px solid #999; padding-bottom: 2pt; }
  .page p { margin-bottom: 3pt; font-size: 9pt; text-align: justify; color: #000; line-height: 1.35; }
  .page p:last-child { margin-bottom: 0; }
  @page { size: A4; margin: 0; }
</style>
</head><body>
<div class="page">${content.innerHTML}</div>
<script>
  setTimeout(function() { window.print(); setTimeout(function(){ window.close(); }, 1000); }, 800);
</script>
</body></html>
    `);
    printWindow.document.close();
  };

  const handleSignatureSave = (dataUrl: string) => {
      if (userRole === 'admin') {
          setAdminSig(dataUrl);
      } else {
          setClientSig(dataUrl);
      }
      setShowSignaturePad(false);
  };

  const handleAction = async () => {
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 1500));

      try {
          if (userRole === 'admin') {
              if (onContractUpdate) {
                  await onContractUpdate({
                      adminSignature: adminSig,
                      status: 'sent_to_client',
                      sentAt: new Date().toISOString()
                  });
              }
              setStatus('sent_to_client');
          } else {
              if (onContractUpdate) {
                  await onContractUpdate({
                      clientSignature: clientSig,
                      status: 'signed',
                      signedAt: new Date().toISOString()
                  });
              }
              setStatus('signed');
          }
      } catch (err) {
          console.error('Contract action failed:', err);
      }
      setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        style={{ printing: 'none' }}
      />

      {showSignaturePad && (
          <SignaturePad 
            onSave={handleSignatureSave}
            onCancel={() => setShowSignaturePad(false)}
          />
      )}

      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-5xl bg-white dark:bg-[#1A1D24] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-[#151921] print:hidden">
            <div className="flex items-center gap-3">
                <div className="bg-slate-800 text-white p-2 rounded-lg shadow-md">
                    <FileText size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Contrato de Serviço</h3>
                    <p className="text-xs text-gray-500 font-medium">
                        {status === 'signed' ? 'Documento Finalizado & Assinado' : 'Minuta Jurídica'}
                    </p>
                </div>
            </div>
            <div className="flex gap-2">
                <Button variant="ghost" onClick={onClose} className="hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20">
                    <X size={20} />
                </Button>
            </div>
        </div>

        <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f3f4f6', padding: '2rem' }}
        >
            
            {userRole === 'client' && !hasReadContract && status === 'sent_to_client' && !clientSig && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-20 print:hidden">
                    <button 
                        onClick={handleScrollToBottom}
                        className="bg-primary-600 text-white px-4 py-2 rounded-full shadow-lg text-xs font-bold animate-bounce flex items-center gap-2 hover:bg-primary-700 transition-colors"
                    >
                        <ArrowDown size={14} /> Ler até o final para Assinar
                    </button>
                </div>
            )}

            <div id="contract-content" style={{ backgroundColor: '#fff', color: '#000', width: '210mm', margin: '0 auto', padding: '15mm 18mm 15mm 18mm', fontFamily: 'Arial, sans-serif', fontSize: '9pt', lineHeight: '1.35' }}>
                <div style={{ textAlign: 'center', marginBottom: '10pt', borderBottom: '2px solid #000', paddingBottom: '6pt' }}>
                    <h1 style={{ fontSize: '12pt', fontWeight: 'bold', margin: 0, color: '#000', letterSpacing: '1px' }}>CONTRATO DE PRESTAÇÃO DE SERVIÇOS — DESENVOLVIMENTO DE SOFTWARE</h1>
                </div>

                <div style={{ marginTop: '8pt', marginBottom: '6pt' }}>
                    <p style={{ marginBottom: '4pt', color: '#000', textAlign: 'justify', fontSize: '9pt' }}>
                        <strong>CONTRATADA:</strong> JOÃO PHILIPPE DE OLIVEIRA BOECHAT, CPF nº 053.795.071-07, RG nº 3.755.968, doravante denominada <strong>CONTRATADA</strong>.
                    </p>
                    <p style={{ marginBottom: '4pt', color: '#000', textAlign: 'justify', fontSize: '9pt' }}>
                        <strong>CONTRATANTE:</strong> <strong>{project.clientName.toUpperCase()}</strong>, e-mail: <strong>{project.email}</strong>, CPF/CNPJ nº <strong>{project.cpf || "______________________"}</strong>, doravante denominado(a) <strong>CONTRATANTE</strong>.
                    </p>
                </div>

                <h2 style={{ fontSize: '9.5pt', fontWeight: 'bold', marginTop: '8pt', marginBottom: '3pt', textTransform: 'uppercase', color: '#000', borderBottom: '0.5px solid #999', paddingBottom: '2pt' }}>Cláusula 1ª — Do Objeto e Escopo</h2>
                <p style={{ marginBottom: '3pt', color: '#000', textAlign: 'justify', fontSize: '9pt' }}>
                    <strong>1.1.</strong> Desenvolvimento da Interface Visual (Frontend) do Website/Aplicação Web denominado <strong>"{project.projectName}"</strong>, incluindo: codificação HTML/CSS/JS (React/Next.js), estruturação de páginas e menus conforme briefing, e implementação de responsividade (mobile/tablet/desktop).
                </p>
                <p style={{ marginBottom: '3pt', color: '#000', textAlign: 'justify', fontSize: '9pt' }}>
                    <strong>1.2. EXCLUSÕES:</strong> Não estão incluídos: integrações funcionais (gateways de pagamento, APIs, NF-e), backend/banco de dados/painéis administrativos/sistemas de login, inserção de conteúdo ou tratamento de imagens, e qualquer funcionalidade não descrita na proposta inicial.
                </p>

                <h2 style={{ fontSize: '9.5pt', fontWeight: 'bold', marginTop: '6pt', marginBottom: '3pt', textTransform: 'uppercase', color: '#000', borderBottom: '0.5px solid #999', paddingBottom: '2pt' }}>Cláusula 2ª — Dos Prazos e Aprovações</h2>
                <p style={{ marginBottom: '3pt', color: '#000', textAlign: 'justify', fontSize: '9pt' }}>
                    <strong>2.1. Entrega prevista:</strong> <strong>{project.dueDate}</strong>, sujeita ao envio pontual de materiais. Atrasos no envio pausam o cronograma. <strong>2.2.</strong> Direito a 3 (três) rodadas de revisão; ajustes extras: R$ 150,00/hora. <strong>2.3.</strong> Paralisação pelo CONTRATANTE superior a 20 dias pode implicar reajuste.
                </p>

                <h2 style={{ fontSize: '9.5pt', fontWeight: 'bold', marginTop: '6pt', marginBottom: '3pt', textTransform: 'uppercase', color: '#000', borderBottom: '0.5px solid #999', paddingBottom: '2pt' }}>Cláusula 3ª — Dos Valores e Pagamento</h2>
                <p style={{ marginBottom: '3pt', color: '#000', textAlign: 'justify', fontSize: '9pt' }}>
                    <strong>Valor total: {formattedValue}</strong> — a) 50% de entrada (sinal); b) 50% na entrega para homologação. <strong>3.1.</strong> Atraso no pagamento: multa de 2% + juros de 1% ao mês. <strong>3.2. Suspensão:</strong> Atraso superior a 3 dias permite à CONTRATADA suspender serviços/acesso sem prejuízo aos prazos.
                </p>

                <h2 style={{ fontSize: '9.5pt', fontWeight: 'bold', marginTop: '6pt', marginBottom: '3pt', textTransform: 'uppercase', color: '#000', borderBottom: '0.5px solid #999', paddingBottom: '2pt' }}>Cláusula 4ª — Da Limitação de Responsabilidade</h2>
                <p style={{ marginBottom: '3pt', color: '#000', textAlign: 'justify', fontSize: '9pt' }}>
                    <strong>4.1.</strong> Não são de responsabilidade da CONTRATADA: falhas de servidores/hospedagem do CONTRATANTE, erros em APIs de terceiros, prejuízos por indisponibilidade, e vazamentos em servidores de terceiros, pois o escopo limita-se à interface visual (Frontend).
                </p>

                <h2 style={{ fontSize: '9.5pt', fontWeight: 'bold', marginTop: '6pt', marginBottom: '3pt', textTransform: 'uppercase', color: '#000', borderBottom: '0.5px solid #999', paddingBottom: '2pt' }}>Cláusula 5ª — Da Rescisão</h2>
                <p style={{ marginBottom: '3pt', color: '#000', textAlign: 'justify', fontSize: '9pt' }}>
                    <strong>5.1.</strong> Desistência imotivada pelo CONTRATANTE: fase inicial — retenção integral do sinal; fase final (após homologação) — cobrança de 100%. <strong>5.2.</strong> Infração contratual: multa não-compensatória de 20% sobre o valor total, cumulada com valores em aberto.
                </p>

                <h2 style={{ fontSize: '9.5pt', fontWeight: 'bold', marginTop: '6pt', marginBottom: '3pt', textTransform: 'uppercase', color: '#000', borderBottom: '0.5px solid #999', paddingBottom: '2pt' }}>Cláusula 6ª — Da Propriedade Intelectual</h2>
                <p style={{ marginBottom: '3pt', color: '#000', textAlign: 'justify', fontSize: '9pt' }}>
                    O código-fonte é propriedade da CONTRATADA até a quitação total. O não pagamento impede o CONTRATANTE de utilizar, publicar ou modificar o código (Lei 9.610/98).
                </p>

                <h2 style={{ fontSize: '9.5pt', fontWeight: 'bold', marginTop: '6pt', marginBottom: '3pt', textTransform: 'uppercase', color: '#000', borderBottom: '0.5px solid #999', paddingBottom: '2pt' }}>Cláusula 7ª — Do Foro</h2>
                <p style={{ marginBottom: '8pt', color: '#000', textAlign: 'justify', fontSize: '9pt' }}>
                    Fica eleito o foro da comarca de <strong>Ceilândia - DF</strong>, com renúncia expressa a qualquer outro.
                </p>

                <p style={{ textAlign: 'center', marginTop: '8pt', marginBottom: '14pt', fontStyle: 'italic', fontSize: '8pt', color: '#666' }}>
                    Brasília (Ceilândia), {currentDate}.
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '30pt', marginTop: '30pt' }}>
                    <div style={{ flex: 1, borderTop: '1px solid #000', textAlign: 'center', paddingTop: '6pt', position: 'relative', minHeight: '75px' }}>
                        {adminSig && <img src={adminSig} alt="Assinatura Contratada" style={{ position: 'absolute', bottom: '25pt', left: '50%', transform: 'translateX(-50%)', height: '40px', maxWidth: '85%' }} />}
                        <p style={{ fontWeight: 'bold', fontSize: '9pt', marginBottom: '2pt', color: '#000' }}>JOÃO PHILIPPE DE OLIVEIRA BOECHAT</p>
                        <p style={{ fontSize: '7.5pt', textTransform: 'uppercase', letterSpacing: '1px', color: '#000' }}>CONTRATADA</p>
                    </div>
                    <div style={{ flex: 1, borderTop: '1px solid #000', textAlign: 'center', paddingTop: '6pt', position: 'relative', minHeight: '75px' }}>
                        {clientSig && <img src={clientSig} alt="Assinatura Cliente" style={{ position: 'absolute', bottom: '25pt', left: '50%', transform: 'translateX(-50%)', height: '40px', maxWidth: '85%' }} />}
                        <p style={{ fontWeight: 'bold', fontSize: '9pt', marginBottom: '2pt', color: '#000' }}>{project.clientName.toUpperCase()}</p>
                        <p style={{ fontSize: '7.5pt', textTransform: 'uppercase', letterSpacing: '1px', color: '#000' }}>CONTRATANTE</p>
                    </div>
                </div>
            </div>

        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A1D24] flex justify-end items-center gap-3 print:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10">
            
            {userRole === 'admin' && (
                <>
                    {status === 'draft' && !adminSig && (
                        <Button variant="outline" onClick={() => setShowSignaturePad(true)} leftIcon={<PenTool size={16}/>} className="animate-pulse border-primary-500 text-primary-600 font-bold">
                            Assinar como Contratada
                        </Button>
                    )}
                    {status === 'draft' && adminSig && (
                        <>
                            <Button variant="ghost" onClick={() => setShowSignaturePad(true)} className="text-gray-400 hover:text-primary-600 text-xs">
                                Refazer Assinatura
                            </Button>
                            <Button 
                                onClick={handleAction} 
                                className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/20"
                                leftIcon={<Send size={16}/>}
                                isLoading={isProcessing}
                            >
                                Enviar para o Cliente
                            </Button>
                        </>
                    )}
                    {(status === 'sent_to_client' || status === 'signed') && (
                        <span className="text-xs font-bold text-green-600 flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-full mr-auto">
                            <CheckCircle2 size={14}/> {status === 'signed' ? 'Contrato Finalizado' : 'Aguardando Cliente'}
                        </span>
                    )}
                </>
            )}

            {userRole === 'client' && (
                <>
                    {status === 'sent_to_client' && !clientSig && (
                        <>
                            {!hasReadContract ? (
                                <div className="flex items-center gap-3">
                                    <p className="text-xs text-orange-600 font-bold flex items-center gap-1 animate-pulse">
                                        <AlertCircle size={14} /> Leia todo o documento.
                                    </p>
                                    <Button disabled variant="secondary" leftIcon={<Lock size={16}/>} className="opacity-50 cursor-not-allowed">
                                        Assinar Contrato
                                    </Button>
                                </div>
                            ) : (
                                <Button variant="outline" onClick={() => setShowSignaturePad(true)} leftIcon={<PenTool size={16}/>} className="animate-pulse border-primary-500 text-primary-600 font-bold">
                                    Assinar como Contratante
                                </Button>
                            )}
                        </>
                    )}
                    {status === 'sent_to_client' && clientSig && (
                        <>
                            <Button variant="ghost" onClick={() => setShowSignaturePad(true)} className="text-gray-400 hover:text-primary-600 text-xs">
                                Refazer
                            </Button>
                            <Button 
                                onClick={handleAction} 
                                className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20"
                                leftIcon={<UserCheck size={16}/>}
                                isLoading={isProcessing}
                            >
                                Finalizar Contrato
                            </Button>
                        </>
                    )}
                </>
            )}

            <div className="flex gap-2 ml-2 pl-2 border-l border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={handlePrint} className="border-gray-300 hover:bg-gray-100" leftIcon={<Printer size={16}/>}>
                    Imprimir
                </Button>
                <Button variant="outline" onClick={handleDownloadPdf} className="border-gray-300 hover:bg-gray-100" leftIcon={<Download size={16}/>}>
                    Salvar PDF
                </Button>
            </div>
        </div>

        <style>{`
            @media print {
                * { margin: 0; padding: 0; box-sizing: border-box; }
                html { background: white; }
                body { background: white; margin: 0; padding: 0; }
                @page { size: A4; margin: 0; }
                
                .fixed, .absolute { position: static !important; }
                .bg-black { display: none !important; }
                .backdrop-blur-sm { display: none !important; }
                
                div[class*="max-w-5xl"] { 
                    width: 100% !important; 
                    max-width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    box-shadow: none !important;
                    border-radius: 0 !important;
                    overflow: visible !important;
                    page-break-after: avoid;
                }
                
                #contract-content { 
                    width: 100% !important;
                    margin: 0 !important;
                    padding: 20mm !important;
                    background: white !important;
                    color: black !important;
                    page-break-inside: avoid;
                }
                
                #contract-content p { page-break-inside: avoid; }
                #contract-content h2 { page-break-after: avoid; }
            }
        `}</style>
      </motion.div>
    </div>
  );
};
