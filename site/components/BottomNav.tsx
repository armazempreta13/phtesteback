
import React from 'react';
import { Home, Layers, MessageSquare, Briefcase, Menu } from 'lucide-react';
import { ViewType } from '../types';

interface BottomNavProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  onOpenChat: () => void;
  onToggleMenu: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate, onOpenChat, onToggleMenu }) => {
  
  const NavItem = ({ view, icon: Icon, label }: { view: ViewType, icon: any, label: string }) => {
    const isActive = currentView === view;
    return (
      <button 
        onClick={() => onNavigate(view)}
        className={`flex flex-col items-center justify-center w-full h-full gap-1 active:scale-90 transition-transform ${isActive ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
      >
        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
        <span className="text-[10px] font-medium">{label}</span>
      </button>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 md:hidden pb-safe">
        {/* Glass Background */}
        <div className="absolute inset-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]"></div>
        
        <div className="relative flex justify-around items-center h-16 px-2">
            <NavItem view="home" icon={Home} label="Início" />
            <NavItem view="services" icon={Layers} label="Serviços" />
            
            {/* Central Action Button (Chat) */}
            <div className="relative -top-5">
                <button 
                    onClick={onOpenChat}
                    className="group w-14 h-14 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-primary-600/40 active:scale-95 transition-transform border-4 border-white relative"
                >
                    <span className="absolute inset-0 rounded-full border-2 border-white/50 animate-ping opacity-75"></span>
                    <MessageSquare size={24} fill="currentColor" className="relative z-10" />
                </button>
            </div>

            <NavItem view="portfolio" icon={Briefcase} label="Projetos" />
            
            {/* Menu Trigger */}
            <button 
                onClick={onToggleMenu}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 active:scale-90 transition-transform text-gray-400 hover:text-gray-600`}
            >
                <Menu size={24} />
                <span className="text-[10px] font-medium">Menu</span>
            </button>
        </div>
    </div>
  );
};
