import React, { useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, ChevronDown } from 'lucide-react';

export const Header: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
          <Link to="/announcements" className={currentPath === '/announcements' ? 'active' : ''}>Announcements</Link>
          
          <div className="nav-divider" style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 8px' }}></div>
          
          {isAuthenticated ? (
            <div 
              className="user-menu" 
              style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <div 
                className="user-info" 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                  <UserIcon size={14} />
                </div>
                <span style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {user?.name}
                  <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                </span>
              </div>
              
              {isDropdownOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, paddingTop: '12px', zIndex: 100 }}>
                  <div style={{
                    width: '200px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}>
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user?.email}</div>
                    {isAdmin && <span style={{ display: 'inline-block', marginTop: '4px', fontSize: '10px', padding: '2px 6px', background: 'rgba(240,192,64,0.1)', color: 'var(--accent)', borderRadius: '10px' }}>Admin</span>}
                  </div>
                  <Link to="/profile" style={{ padding: '8px 12px', fontSize: '13px', color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)', textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>Profile</Link>
                  <a href="#" style={{ padding: '8px 12px', fontSize: '13px', color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)', textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'} onClick={(e) => e.preventDefault()}>Raise a new issue</a>
                  <a href="#" style={{ padding: '8px 12px', fontSize: '13px', color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)', textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'} onClick={(e) => e.preventDefault()}>Track my issues</a>
                  <a href="#" style={{ padding: '8px 12px', fontSize: '13px', color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)', textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'} onClick={(e) => e.preventDefault()}>Resolve a question</a>
                  <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }}></div>
                  <button 
                    onClick={logout}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', fontSize: '13px', color: '#ff6b6b', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm)', width: '100%', textAlign: 'left' }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,107,107,0.1)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className={currentPath === '/login' ? 'active' : ''}>Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
};
