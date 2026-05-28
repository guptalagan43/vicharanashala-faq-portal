import React from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <header className="site-header" id="site-header">
      <div className="header-inner">
        <Link to="/" className="logo">
          <span className="logo-mark">V</span>
          <span className="logo-text">Vicharanashala</span>
        </Link>
        <nav className="site-nav">
          <Link to="/" className={currentPath === '/' ? 'active' : ''}>Overview</Link>
          <Link to="/faq" className={currentPath === '/faq' ? 'active' : ''}>FAQ</Link>
          <Link to="/chat" className={currentPath === '/chat' ? 'active' : ''}>Yaksha Chat</Link>
          
          <div className="nav-divider" style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 8px' }}></div>
          
          {isAuthenticated ? (
            <div className="user-menu" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                  <UserIcon size={14} />
                </div>
                <span style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {user?.name}
                  {isAdmin && <span style={{ marginLeft: '6px', fontSize: '10px', padding: '2px 6px', background: 'rgba(240,192,64,0.1)', color: 'var(--accent)', borderRadius: '10px' }}>Admin</span>}
                </span>
              </div>
              <button 
                onClick={logout}
                title="Logout"
                style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', transition: 'color 0.2s', cursor: 'pointer' }}
                onMouseOver={(e) => e.currentTarget.style.color = '#ff6b6b'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link to="/login" className={currentPath === '/login' ? 'active' : ''}>Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
};
