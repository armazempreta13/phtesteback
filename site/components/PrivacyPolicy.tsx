
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';
import { ViewType } from '../types';

interface PrivacyPolicyProps {
  onNavigate: (view: ViewType) => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onNavigate }) => {
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
                <Shield size={32} />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white">Política de Privacidade</h1>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
          <p className="lead">
            Sua privacidade é importante para nós. É política do PH Development respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site PH.static e outros sites que possuímos e operamos.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">1. Informações que Coletamos</h3>
          <p>
            Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento. Também informamos por que estamos coletando e como será usado.
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Dados de contato (Nome, E-mail, Telefone) fornecidos voluntariamente em formulários.</li>
              <li>Dados técnicos de navegação (Cookies) para análise de performance e melhoria da experiência.</li>
          </ul>

          <h3 className="text-xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">2. Retenção de Dados</h3>
          <p>
            Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios comercialmente aceitáveis ​​para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">3. Compartilhamento de Dados</h3>
          <p>
            Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">4. Cookies</h3>
          <p>
            Nosso site usa cookies para melhorar a experiência do usuário. Você é livre para recusar a nossa solicitação de informações pessoais, entendendo que talvez não possamos fornecer alguns dos serviços desejados.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">5. Compromisso do Usuário</h3>
          <p>
            O usuário se compromete a fazer uso adequado dos conteúdos e da informação que o PH Development oferece no site e com caráter enunciativo, mas não limitativo:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>A) Não se envolver em atividades que sejam ilegais ou contrárias à boa fé a à ordem pública;</li>
            <li>B) Não difundir propaganda ou conteúdo de natureza racista, xenofóbica, jogos de sorte ou azar, qualquer tipo de pornografia ilegal, de apologia ao terrorismo ou contra os direitos humanos;</li>
            <li>C) Não causar danos aos sistemas físicos (hardwares) e lógicos (softwares) do PH Development, de seus fornecedores ou terceiros.</li>
          </ul>

          <h3 className="text-xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">6. Mais Informações</h3>
          <p>
            Esperemos que esteja esclarecido e, como mencionado anteriormente, se houver algo que você não tem certeza se precisa ou não, geralmente é mais seguro deixar os cookies ativados, caso interaja com um dos recursos que você usa em nosso site.
          </p>
          <p className="mt-4 text-sm opacity-70">
            Esta política é efetiva a partir de <strong>Outubro/2023</strong>.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
