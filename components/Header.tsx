
import React, { useState, useEffect } from 'react';
import { Code2, User, LayoutDashboard, Briefcase, LogOut, ChevronRight } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';
import { NavigationProps, ViewType } from '../types';

// Estendendo as props para incluir dados de autenticação
interface HeaderProps extends NavigationProps {
  userRole?: 'guest' | 'client' | 'admin';
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, onLogoClick, userRole = 'guest', onLogout }) => {
  const { content } = useContent();
  const NAV_ITEMS = content.navItems;
  const EASTER_EGG_CONFIG = content.easterEgg;

  const [isScrolled, setIsScrolled] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (view: ViewType) => {
    onNavigate(view);
  };

  // Easter Egg Trigger Logic
  const handleLogoInteraction = (e: React.MouseEvent) => {
    if (!EASTER_EGG_CONFIG.ENABLED) {
        handleNavClick('home');
        return;
    }

    if (logoClicks + 1 >= EASTER_EGG_CONFIG.LOGO_CLICKS_REQUIRED) {
        e.preventDefault();
        setLogoClicks(0);
        if (onLogoClick) onLogoClick();
        return;
    }

    setLogoClicks(prev => prev + 1);
    setTimeout(() => setLogoClicks(0), 1000);
    handleNavClick('home');
  };

  const getHeaderClasses = () => {
      const base = "fixed top-0 w-full z-[49] transition-all duration-300 border-b";
      if (isScrolled) {
          return `${base} bg-white/90 backdrop-blur-md shadow-sm py-3 border-gray-100`;
      }
      return `${base} bg-transparent py-5 border-transparent`;
  };

  // Renderização condicional do botão de área logada
  const renderAuthButton = () => {
    if (userRole === 'admin') {
      return (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleNavClick('admin-dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full text-xs font-bold hover:bg-black transition-all shadow-lg shadow-gray-900/20 active:scale-95 border border-gray-700"
          >
            <LayoutDashboard size={14} className="text-green-400" />
            Painel Admin
          </button>
          <button 
            onClick={onLogout}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        </div>
      );
    }

    if (userRole === 'client') {
      return (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleNavClick('client-portal')}
            className="group flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 border border-primary-200 rounded-full text-xs font-bold hover:bg-primary-100 transition-all shadow-sm active:scale-95"
          >
            <div className="bg-white p-1 rounded-full shadow-sm">
              <Briefcase size={12} className="text-primary-600" />
            </div>
            Minha Área
            <ChevronRight size={12} className="opacity-50 group-hover:translate-x-0.5 transition-transform"/>
          </button>
          <button 
            onClick={onLogout}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        </div>
      );
    }

    // Estado Guest (Padrão)
    return (
      <>
        <button 
          onClick={() => handleNavClick('login')}
          className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:text-primary-600 font-medium transition-colors text-sm"
        >
          <User size={18} />
          Login
        </button>

        <button 
          onClick={() => handleNavClick('contact')}
          className="ml-2 px-6 py-2.5 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-primary-600 hover:-translate-y-0.5 transition-all duration-300 shadow-lg shadow-gray-900/20 hover:shadow-primary-600/30 active:scale-95"
        >
          Orçamento
        </button>
      </>
    );
  };

  return (
    <header className={getHeaderClasses()}>
      <div className="container mx-auto px-4 md:px-8 flex justify-center md:justify-between items-center relative z-50">
        {/* Logo */}
        <button 
          onClick={handleLogoInteraction}
          className="flex items-center gap-2 group focus:outline-none select-none cursor-pointer"
          title={EASTER_EGG_CONFIG.ENABLED ? "Home" : undefined}
        >
          <div className={`bg-primary-600 text-white p-2 rounded-lg transition-all duration-300 shadow-lg shadow-primary-600/20 ${logoClicks > 0 ? 'scale-90 bg-primary-700' : 'group-hover:rotate-12 group-hover:scale-110'}`}>
            <Code2 size={22} className={logoClicks > 2 ? "animate-pulse" : ""} />
          </div>
          <span className={`font-display font-bold text-xl md:text-2xl tracking-tight transition-colors duration-300 text-gray-900 group-hover:text-primary-600`}>
            PH<span className="text-primary-600">.static</span>
          </span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
          {NAV_ITEMS.map((item) => {
             if (item.id === 'contact') return null;
             const isActive = currentView === item.id;
             return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.id)}
                className={`relative px-4 py-2 text-sm font-medium transition-colors duration-300 group ${
                  isActive 
                    ? 'text-primary-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
                <span className={`absolute bottom-1 left-4 h-0.5 bg-primary-600 rounded-full transition-all duration-300 ease-out ${
                  isActive ? 'w-[calc(100%-2rem)] opacity-100' : 'w-0 opacity-0 group-hover:w-[calc(100%-2rem)] group-hover:opacity-100'
                }`} />
              </button>
            );
          })}
          
          <div className="w-px h-5 bg-gray-200 mx-3"></div>

          {/* Área de Autenticação Dinâmica */}
          {renderAuthButton()}
        </nav>
      </div>
    </header>
  );
};
