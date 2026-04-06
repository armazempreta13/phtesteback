
import { useState, useEffect } from 'react';

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Media query para mobile (md breakpoint do Tailwind é 768px)
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    
    // Handler otimizado
    const handleMediaQueryChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    // Estado inicial
    setIsMobile(mediaQuery.matches);

    // Modern event listener (mais performático que 'resize')
    mediaQuery.addEventListener('change', handleMediaQueryChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaQueryChange);
    };
  }, []);

  return isMobile;
};
