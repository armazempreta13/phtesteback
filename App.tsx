
import React, { useState, Suspense, useCallback, memo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from './lib/api';
import { HelmetProvider } from 'react-helmet-async';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Services } from './components/Services';
import { Portfolio } from './components/Portfolio';
import { Process } from './components/Process';
import { Contact } from './components/Contact';
import { ServiceDetail } from './components/ServiceDetail';
import { EasterEgg } from './components/EasterEgg';
import { CookieBanner } from './components/CookieBanner';
import { AnalyticsLoader } from './components/AnalyticsLoader';
import { NotFound } from './components/NotFound';
import { TermsOfUse } from './components/TermsOfUse';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { Blog } from './components/Blog';
import { AccessibilityMenu } from './components/AccessibilityMenu';
import { BottomNav } from './components/BottomNav';
import { ServicePackage, ViewType } from './types';
import { ContentProvider, useContent } from './contexts/ContentContext'; 
import { ProjectProvider } from './contexts/ProjectContext'; 
import { AdminPanel } from './components/AdminPanel'; 
import { AuthModal } from './components/AuthModal';
import { ClientPortal } from './components/ClientPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { ClientBriefingPage } from './components/ClientBriefingPage';

const ChatbotV2 = React.lazy(() => import('./components/ChatbotV2').then(module => ({ default: module.ChatbotV2 })));
const Chatbot = React.lazy(() => import('./components/Chatbot').then(module => ({ default: module.Chatbot })));
const ZenithOnePage = React.lazy(() => import('./components/ZenithOnePage').then(module => ({ default: module.ZenithOnePage })));
const AetherOnePage = React.lazy(() => import('./components/AetherOnePage').then(module => ({ default: module.AetherOnePage })));
const Footer = React.lazy(() => import('./components/Footer').then(module => ({ default: module.Footer })));
const PerformanceHud = React.lazy(() => import('./components/PerformanceHud').then(module => ({ default: module.PerformanceHud })));
const NotificationCenter = React.lazy(() => import('./components/NotificationCenter').then(module => ({ default: module.NotificationCenter })));
const FAQ = React.lazy(() => import('./components/FAQ').then(module => ({ default: module.FAQ })));

const HeroMemo = memo(Hero);
const AboutMemo = memo(About);
const ServicesMemo = memo(Services);
const PortfolioMemo = memo(Portfolio);
const ProcessMemo = memo(Process);
const ContactMemo = memo(Contact);

function AppContent() {
  const { content } = useContent(); 
  const { navItems: NAV_ITEMS, about: ABOUT_CONFIG, analytics: ANALYTICS_CONFIG, performance: PERFORMANCE_CONFIG } = content;

  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServicePackage | null>(null);
  const [triggerEasterEgg, setTriggerEasterEgg] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [chatInitialMode, setChatInitialMode] = useState<'sales' | 'support'>('sales');
  
  const [authRole, setAuthRole] = useState<'guest' | 'client' | 'admin'>('guest');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [chatVersion, setChatVersion] = useState<'v1' | 'v2'>(() => {
    return (localStorage.getItem('chatbot_version') as 'v1' | 'v2') || 'v1';
  });

  // --- URL PARAMETER HANDLING (ROUTING) ---
  useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const pageParam = params.get('page');

      if (pageParam === 'briefing') {
          setCurrentView('briefing');
      } else if (pageParam === 'admin') {
          setShowAuthModal(true);
      }
  }, []);

  // --- ANALYTICS: Track page views ---
  useEffect(() => {
    api.analytics.track('page_view', window.location.pathname, document.referrer);
  }, []);

  const handleNavigate = useCallback((view: ViewType) => {
    setSelectedService(null);
    
    if (view === 'login') {
        setShowAuthModal(true);
        setIsMobileMenuOpen(false);
        return;
    }

    if (view === 'client-portal' && authRole !== 'client' && authRole !== 'admin') {
        setShowAuthModal(true);
        setIsMobileMenuOpen(false);
        return;
    }

    if (view === 'admin-dashboard' && authRole !== 'admin') {
        setShowAuthModal(true);
        setIsMobileMenuOpen(false);
        return;
    }

    if (view === 'faq') {
        const faqElement = document.getElementById('faq');
        if (faqElement) {
            faqElement.scrollIntoView({ behavior: 'smooth' });
            if (currentView !== 'home') setCurrentView('home');
        } else {
            setCurrentView('home');
            setTimeout(() => {
                document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
            }, 300);
        }
    } else {
        setCurrentView(view);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    setIsMobileMenuOpen(false);
  }, [currentView, authRole]);

  const handleLoginSuccess = (role: 'admin' | 'client') => {
      setAuthRole(role);
      setShowAuthModal(false);
      if (role === 'admin') setCurrentView('admin-dashboard');
      if (role === 'client') setCurrentView('client-portal');
  };

  const handleLogout = () => {
      setAuthRole('guest');
      setCurrentView('home');
  };

  const handleOpenChat = useCallback((mode: 'sales' | 'support' = 'sales') => {
    setChatInitialMode(mode);
    setIsChatOpen(true);
  }, []);

  const handleSelectService = useCallback((service: ServicePackage) => {
    setSelectedService(service);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleBackFromService = useCallback(() => {
    setSelectedService(null);
  }, []);

  const handleLogoTrigger = useCallback(() => {
    setTriggerEasterEgg(true);
    setTimeout(() => setTriggerEasterEgg(false), 500);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // --- EXCLUSIVE FULL SCREEN VIEWS ---
  const isFullScreenView = ['admin-dashboard', 'client-portal', 'zenith-demo', 'aether-demo', 'briefing'].includes(currentView);

  return (
    <HelmetProvider>
        <div className="min-h-screen relative font-sans bg-white dark:bg-dark flex flex-col text-gray-900 dark:text-white overflow-x-hidden transition-colors duration-300">
            <AnalyticsLoader measurementId={ANALYTICS_CONFIG.GA_MEASUREMENT_ID} />

            {/* PRELOADER */}
            <img 
                src={ABOUT_CONFIG.IMAGE_URL} 
                alt="" 
                className="hidden absolute w-0 h-0 overflow-hidden" 
                aria-hidden="true" 
                loading="eager"
                decoding="sync"
                fetchpriority="high"
            />

            {/* GLOBAL COMPONENTS (Hidden on Full Screen Views) */}
            {!isFullScreenView && (
                <>
                    <EasterEgg externalTrigger={triggerEasterEgg} onClose={() => setTriggerEasterEgg(false)} />
                    <CookieBanner />
                    <AccessibilityMenu />
                    <AdminPanel />
                    
                    <AnimatePresence>
                        {showAuthModal && (
                            <AuthModal onClose={() => setShowAuthModal(false)} onLoginSuccess={handleLoginSuccess} />
                        )}
                    </AnimatePresence>

                    <Suspense fallback={null}>
                       <NotificationCenter onNavigate={handleNavigate} />
                    </Suspense>

                    <Header 
                        currentView={currentView} 
                        onNavigate={handleNavigate} 
                        onLogoClick={handleLogoTrigger}
                        userRole={authRole}
                        onLogout={handleLogout}
                    />
                    
                    <AnimatePresence>
                        {isMobileMenuOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 50 }}
                                className="fixed inset-0 bg-white dark:bg-gray-900 z-40 md:hidden flex flex-col pt-24 pb-32 px-6 overflow-y-auto"
                            >
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Menu Completo</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {NAV_ITEMS.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleNavigate(item.id)}
                                            className={`p-4 rounded-2xl text-left border transition-all ${currentView === item.id ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-400' : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}
                                        >
                                            <span className="text-lg font-bold">{item.label}</span>
                                        </button>
                                    ))}
                                    
                                    {/* Botão de Login/Dashboard no Mobile */}
                                    {authRole === 'guest' ? (
                                        <button
                                            onClick={() => handleNavigate('login')}
                                            className="p-4 rounded-2xl text-left border bg-gray-900 dark:bg-black border-gray-900 dark:border-gray-800 text-white col-span-2"
                                        >
                                            <span className="text-lg font-bold">Área do Cliente / Admin</span>
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleNavigate(authRole === 'admin' ? 'admin-dashboard' : 'client-portal')}
                                                className="p-4 rounded-2xl text-left border bg-primary-600 border-primary-600 text-white col-span-2 shadow-lg shadow-primary-600/20"
                                            >
                                                <span className="text-lg font-bold">{authRole === 'admin' ? 'Painel Admin' : 'Minha Área'}</span>
                                                <p className="text-xs opacity-80 mt-1">Acessar Dashboard</p>
                                            </button>
                                            <button
                                                onClick={handleLogout}
                                                className="p-4 rounded-2xl text-left border border-red-200 bg-red-50 text-red-600 col-span-2"
                                            >
                                                <span className="text-lg font-bold">Sair</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                                
                                <div className="mt-8 border-t border-gray-100 dark:border-gray-800 pt-8">
                                    <button onClick={() => handleNavigate('terms')} className="block w-full text-left py-3 text-sm text-gray-500 dark:text-gray-400">Termos de Uso</button>
                                    <button onClick={() => handleNavigate('privacy')} className="block w-full text-left py-3 text-sm text-gray-500 dark:text-gray-400">Política de Privacidade</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}

            {/* MAIN CONTENT AREA */}
            <main className={`flex-grow ${!isFullScreenView ? 'pb-20 md:pb-0' : ''}`}>
                {currentView === 'admin-dashboard' && <AdminDashboard onLogout={handleLogout} onNavigate={handleNavigate} />}
                
                {currentView === 'client-portal' && <ClientPortal onLogout={handleLogout} onNavigate={handleNavigate} isAdmin={authRole === 'admin'} />}
                
                {currentView === 'briefing' && <ClientBriefingPage />}

                {currentView === 'zenith-demo' && (
                    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-black text-white">Carregando Zenith...</div>}>
                        <ZenithOnePage onBack={() => handleNavigate('portfolio')} />
                    </Suspense>
                )}
                
                {currentView === 'aether-demo' && (
                    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-slate-950 text-orange-500 font-mono">INICIALIZANDO SISTEMAS...</div>}>
                        <AetherOnePage onBack={() => handleNavigate('portfolio')} />
                    </Suspense>
                )}

                {currentView === '404' && <NotFound onHome={() => handleNavigate('home')} />}

                {/* Standard Views */}
                {!isFullScreenView && (
                    <AnimatePresence mode="wait">
                        {selectedService ? (
                            <ServiceDetail 
                                key="service-detail"
                                service={selectedService} 
                                onBack={handleBackFromService}
                                onHire={() => handleOpenChat('sales')}
                            />
                        ) : currentView === 'blog' ? (
                            <motion.div key="blog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-24 min-h-screen">
                                <Blog onNavigate={handleNavigate} />
                            </motion.div>
                        ) : currentView === 'terms' ? (
                            <TermsOfUse key="terms" onNavigate={handleNavigate} />
                        ) : currentView === 'privacy' ? (
                            <PrivacyPolicy key="privacy" onNavigate={handleNavigate} />
                        ) : (
                            // Home Group
                            <motion.div key="main-group" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                {currentView === 'home' && <HeroMemo onNavigate={handleNavigate} onOpenChat={() => handleOpenChat('sales')} />}
                                {currentView === 'about' && <div className="pt-24 min-h-screen"><AboutMemo onNavigate={handleNavigate} /></div>}
                                {currentView === 'services' && <div className="pt-24 min-h-screen"><ServicesMemo onSelectService={handleSelectService} /></div>}
                                {currentView === 'portfolio' && <div className="pt-24 min-h-screen"><PortfolioMemo onOpenChat={() => handleOpenChat('sales')} onNavigate={handleNavigate} /></div>}
                                {currentView === 'process' && <div className="pt-24 min-h-screen"><ProcessMemo onOpenChat={() => handleOpenChat('sales')} /></div>}
                                {currentView === 'contact' && <div className="pt-24 min-h-screen"><ContactMemo /></div>}
                                {(currentView === 'home' || currentView === 'faq') && (
                                    <div id="faq-section">
                                        <Suspense fallback={null}><FAQ onOpenChat={() => handleOpenChat('support')} /></Suspense>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </main>

            {/* GLOBAL FOOTER (Conditioned) */}
            {!isFullScreenView && currentView !== 'blog' && (
                <Suspense fallback={null}>
                    <Footer onNavigate={handleNavigate} />
                </Suspense>
            )}
            
            {/* GLOBAL BOTTOM NAV */}
            {!isFullScreenView && (
                <BottomNav 
                    currentView={currentView} 
                    onNavigate={handleNavigate} 
                    onOpenChat={() => handleOpenChat('sales')}
                    onToggleMenu={toggleMobileMenu}
                />
            )}

            {/* PERSISTENT CHATBOT (Kept mounted unless full screen demo) */}
            {!isFullScreenView && (
                <Suspense fallback={null}>
                    {chatVersion === 'v2' ? (
                        <ChatbotV2
                            isOpen={isChatOpen}
                            setIsOpen={setIsChatOpen}
                        />
                    ) : (
                        <Chatbot
                            isOpen={isChatOpen}
                            setIsOpen={setIsChatOpen}
                            onNavigate={handleNavigate}
                            contextService={selectedService}
                            extraElevation={false}
                            initialMode={chatInitialMode}
                        />
                    )}
                </Suspense>
            )}

            {/* CHATBOT VERSION TOGGLE (hidden in production, accessible via dev) */}
            {!isFullScreenView && (
                <button
                    onClick={() => {
                        const next = chatVersion === 'v1' ? 'v2' : 'v1';
                        setChatVersion(next);
                        localStorage.setItem('chatbot_version', next);
                        setIsChatOpen(false);
                    }}
                    className="fixed bottom-2 left-2 z-[90] w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-800 text-[8px] font-mono text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors cursor-pointer"
                    title={`Chatbot ${chatVersion.toUpperCase()} - Clique para trocar`}
                >
                    {chatVersion.toUpperCase()}
                </button>
            )}

            {PERFORMANCE_CONFIG.ENABLE_PERFORMANCE_HUD && (
                <Suspense fallback={null}>
                    <PerformanceHud />
                </Suspense>
            )}
        </div>
    </HelmetProvider>
  );
}

const App = () => (
  <ContentProvider>
    <ProjectProvider>
        <AppContent />
    </ProjectProvider>
  </ContentProvider>
);

export default App;
