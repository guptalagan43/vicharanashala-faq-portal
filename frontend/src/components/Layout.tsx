import React, { useState, useEffect } from 'react';
import { Outlet, useRouterState } from '@tanstack/react-router';
import { Header } from './Header';
import { Footer } from './Footer';
import { ArrowUp } from 'lucide-react';
import YakshaChat from './YakshaChat';

export const Layout: React.FC = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [mousePos, setMousePos] = useState({ x: -400, y: -400 });
  const [chatOpen, setChatOpen] = useState(false);

  const router = useRouterState();
  const currentPath = router.location.pathname;

  const isChatRoute = currentPath.startsWith('/chat');
  const isAdminRoute = currentPath.startsWith('/admin');
  const isAuthRoute = currentPath.startsWith('/login') || currentPath.startsWith('/signup') || currentPath.startsWith('/forgot-password');
  const showFloatingChat = !isChatRoute && !isAdminRoute && !isAuthRoute;

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      <div className="cursor-glow" style={{ transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)` }} />
      <Header />
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>
        <Outlet />
      </main>
      <Footer />
      
      <button 
        className={`back-to-top ${showBackToTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        title="Back to Top"
      >
        <ArrowUp size={18} />
      </button>

      {showFloatingChat && (
        <>
          <button
            className="yaksha-fab"
            aria-label="Open Yaksha chat"
            onClick={() => setChatOpen(prev => !prev)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '24px', height: '24px' }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>

          {chatOpen && (
            <>
              {/* Desktop floating panel */}
              <div className="yaksha-desktop-container">
                <YakshaChat isModal={true} onClose={() => setChatOpen(false)} />
              </div>

              {/* Mobile slide-down modal sheet */}
              <div
                className="yaksha-modal-overlay open"
                onClick={(e) => { if (e.target === e.currentTarget) setChatOpen(false); }}
                aria-modal="true"
                role="dialog"
                aria-label="Yaksha chat mobile"
              >
                <div className="yaksha-modal-sheet">
                  <YakshaChat isModal={true} onClose={() => setChatOpen(false)} />
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
