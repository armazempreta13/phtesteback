
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText } from 'lucide-react';
import { ViewType } from '../types';

interface TermsOfUseProps {
  onNavigate: (view: ViewType) => void;
}

export const TermsOfUse: React.FC<TermsOfUseProps> = ({ onNavigate }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-white dark:bg-dark text-gray-800 dark:text-gray-200 pt-28 pb-20 font-sans transition-colors duration-300"
    >
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <button 
          onClick={() => onNavigate('home')} 
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Voltar para o Início
        </button>

        <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-primary-600 dark:text-primary-400">
                <FileText size={32} />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white">Termos de Uso</h1>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
          <h3 className="text-xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">1. Termos</h3>
          <p>
            Ao acessar ao site PH.static, concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis ​​e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis. Se você não concordar com algum desses termos, está proibido de usar ou acessar este site. Os materiais contidos neste site são protegidos pelas leis de direitos autorais e marcas comerciais aplicáveis.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">2. Uso de Licença</h3>
          <p>
            É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site PH.static , apenas para visualização transitória pessoal e não comercial. Esta é a concessão de uma licença, não uma transferência de título e, sob esta licença, você não pode:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>modificar ou copiar os materiais;</li>
            <li>usar os materiais para qualquer finalidade comercial ou para exibição pública (comercial ou não comercial);</li>
            <li>tentar descompilar ou fazer engenharia reversa de qualquer software contido no site PH.static;</li>
            <li>remover quaisquer direitos autorais ou outras notações de propriedade dos materiais; ou</li>
            <li>transferir os materiais para outra pessoa ou 'espelhe' os materiais em qualquer outro servidor.</li>
          </ul>
          <p className="mt-2">
            Esta licença será automaticamente rescindida se você violar alguma dessas restrições e poderá ser rescindida por PH Development a qualquer momento.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">3. Isenção de responsabilidade</h3>
          <p>
            Os materiais no site da PH.static são fornecidos 'como estão'. PH Development não oferece garantias, expressas ou implícitas, e, por este meio, isenta e nega todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de comercialização, adequação a um fim específico ou não violação de propriedade intelectual ou outra violação de direitos.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">4. Limitações</h3>
          <p>
            Em nenhum caso o PH Development ou seus fornecedores serão responsáveis ​​por quaisquer danos (incluindo, sem limitação, danos por perda de dados ou lucro ou devido a interrupção dos negócios) decorrentes do uso ou da incapacidade de usar os materiais em PH.static, mesmo que PH Development ou um representante autorizado da PH Development tenha sido notificado oralmente ou por escrito da possibilidade de tais danos.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">5. Precisão dos materiais</h3>
          <p>
            Os materiais exibidos no site da PH.static podem incluir erros técnicos, tipográficos ou fotográficos. PH Development não garante que qualquer material em seu site seja preciso, completo ou atual. PH Development pode fazer alterações nos materiais contidos em seu site a qualquer momento, sem aviso prévio.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">6. Links</h3>
          <p>
            O PH Development não analisou todos os sites vinculados ao seu site e não é responsável pelo conteúdo de nenhum site vinculado. A inclusão de qualquer link não implica endosso por PH Development do site. O uso de qualquer site vinculado é por conta e risco do usuário.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">Modificações</h3>
          <p>
            O PH Development pode revisar estes termos de serviço do site a qualquer momento, sem aviso prévio. Ao usar este site, você concorda em ficar vinculado à versão atual desses termos de serviço.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">Lei aplicável</h3>
          <p>
            Estes termos e condições são regidos e interpretados de acordo com as leis do PH Development e você se submete irrevogavelmente à jurisdição exclusiva dos tribunais naquele estado ou localidade.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
