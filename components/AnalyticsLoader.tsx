
import React, { useEffect } from 'react';
import { useCookieConsent } from '../hooks/useCookieConsent';

interface AnalyticsLoaderProps {
  measurementId: string;
}

export const AnalyticsLoader: React.FC<AnalyticsLoaderProps> = ({ measurementId }) => {
  const { consent } = useCookieConsent();

  useEffect(() => {
    // 0. Previne execução se o ID for inválido ou placeholder
    if (!measurementId || measurementId === 'G-XXXXXXXXXX') {
        if (consent === true) console.warn('[Analytics] GA4: Measurement ID não configurado em config.ts. O rastreamento não funcionará.');
        return;
    }

    // 1. Verifica se já existe para evitar duplicação (Idempotência)
    if (document.getElementById('google-analytics')) return;

    if (consent === true) {
      // 2. Carregar a biblioteca gtag.js
      const script = document.createElement('script');
      script.id = 'google-analytics'; // ID para verificação futura
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      script.async = true;
      document.head.appendChild(script);

      // 3. Inicializar o dataLayer
      const inlineScript = document.createElement('script');
      inlineScript.id = 'google-analytics-init';
      inlineScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${measurementId}', { 'anonymize_ip': true });
      `;
      document.head.appendChild(inlineScript);

      console.log(`[Analytics] Scripts injetados com sucesso para ID: ${measurementId}`);
      
      // Limpeza (opcional, já que scripts injetados persistem)
      return () => {
        // Em SPAs, geralmente mantemos o script ativo após o consentimento.
      };
    }
  }, [consent, measurementId]);

  return null; // Este componente não renderiza nada visualmente
};
