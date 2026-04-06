
import React, { useState } from 'react';
import { ViewType } from '../types';
import { Sidebar } from './admin/Sidebar';
import { Overview } from './admin/Overview';
import { CRM } from './admin/CRM';
import { Blog } from './admin/Blog';
import { Portfolio } from './admin/Portfolio';
import { Settings } from './admin/Settings';

interface AdminDashboardProps {
  onLogout: () => void;
  onNavigate: (view: ViewType) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'leads' | 'cms' | 'portfolio' | 'settings'>('overview');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0D12] flex font-sans">
      
      {/* Sidebar de Navegação */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={onLogout} 
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 ml-64 p-8">
        
        {activeTab === 'overview' && <Overview />}
        
        {activeTab === 'leads' && <CRM onNavigate={onNavigate} />}
        
        {activeTab === 'cms' && <Blog />}
        
        {activeTab === 'portfolio' && <Portfolio />}
        
        {activeTab === 'settings' && <Settings />}

      </main>
    </div>
  );
};
