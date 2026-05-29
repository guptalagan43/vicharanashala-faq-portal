import React, { useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, User as UserIcon, ChevronDown, Sun, Moon } from 'lucide-react';

export const Header: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <header className="site-header" id="site-header">
      <div className="header-inner">
        <Link to="/" className="logo" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <span className="logo-mark">V</span>
          <span className="logo-text">Vicharanashala</span>
        </Link>
        <nav className="site-nav">
          <Link to="/" className={currentPath === '/' ? 'active' : ''}>Overview</Link>
          <Link to="/faq" className={currentPath === '/faq' ? 'active' : ''}>FAQ</Link>
          <Link to="/chat" className={currentPath === '/chat' ? 'active' : ''}>Yaksha Chat</Link>
          <Link to="/announcements" className={currentPath === '/announcements' ? 'active' : ''}>Announcements</Link>
          <a href="https://samagama.in/" target="_blank" rel="noopener noreferrer">Samagama</a>
          
          <div className="nav-divider" style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 8px' }}></div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              transition: 'all 0.25s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'var(--bg-card-hover)';
              e.currentTarget.style.color = 'var(--accent)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'var(--bg-card)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          
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
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user?.email}</div>
                    {isAdmin && <span style={{ display: 'inline-block', marginTop: '4px', fontSize: '10px', padding: '2px 6px', background: 'var(--accent-glow)', color: 'var(--accent)', borderRadius: '10px' }}>Admin</span>}
                  </div>
                  {!isAdmin && (
                    <>
                      <Link to="/profile" className="dropdown-item">Profile</Link>
                      <Link to="/raise-issue" className="dropdown-item">Raise a new issue</Link>
                      <Link to="/track-issues" className="dropdown-item">Track my issues</Link>
                      <Link to="/resolve-question" className="dropdown-item">Resolve a question</Link>
                    </>
                  )}
                  <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }}></div>
                  <button 
                    onClick={logout}
                    className="dropdown-item dropdown-item--danger"
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
