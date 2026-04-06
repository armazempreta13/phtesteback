
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'ph_cookie_consent';

export const useCookieConsent = () => {
  const [consent, setConsent] = useState<boolean | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Verificar localStorage no lado do cliente
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'true') {
        setConsent(true);
        setIsVisible(false);
      } else if (stored === 'false') {
        setConsent(false);
        setIsVisible(false);
      } else {
        // Se não houver registro, mostramos o banner
        setConsent(null);
        setIsVisible(true);
      }
    }
  }, []);

  const acceptCookies = () => {
    setConsent(true);
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const declineCookies = () => {
    setConsent(false);
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, 'false');
  };

  return {
    consent,
    isVisible,
    acceptCookies,
    declineCookies
  };
};
