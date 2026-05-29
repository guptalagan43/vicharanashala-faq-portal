import React, { useState } from 'react';
import { Shield, ArrowRight, Loader2 } from 'lucide-react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (email: string, name: string) => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount,
}) => {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const mockAccounts = [
    { name: 'Lagan Gupta', email: 'guptalagan43@gmail.com', avatar: 'LG' },
    { name: 'Vicharanashala Student', email: 'vins.student@iitrpr.ac.in', avatar: 'VS' },
  ];

  const handleAccountClick = (email: string, name: string) => {
    setSelectedEmail(email);
    setLoading(true);
    
    // Simulate Google OAuth validation delay
    setTimeout(() => {
      setLoading(false);
      onSelectAccount(email, name);
      onClose();
    }, 1500);
  };

  return (
    <div className="google-auth-overlay" onClick={!loading ? onClose : undefined}>
      <div className="google-auth-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Brand / Header */}
        <div className="google-modal-header">
          <svg className="google-icon" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '8px' }}>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
          </svg>
          <h2>Sign in with Google</h2>
          <p>to continue to <strong>Vicharanashala Portal</strong></p>
        </div>

        {loading ? (
          <div className="google-auth-loader">
            <Loader2 className="spinner-icon animate-spin" size={32} />
            <p>Verifying account authorization...</p>
            <span className="selected-email-tag">{selectedEmail}</span>
          </div>
        ) : (
          <>
            {/* Account List */}
            <div className="google-accounts-list">
              {mockAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  className="google-account-row"
                  onClick={() => handleAccountClick(acc.email, acc.name)}
                >
                  <div className="google-avatar">{acc.avatar}</div>
                  <div className="google-account-details">
                    <span className="google-name">{acc.name}</span>
                    <span className="google-email">{acc.email}</span>
                  </div>
                  <ArrowRight size={14} className="arrow-icon" />
                </button>
              ))}

              <button
                type="button"
                className="google-account-row other-account"
                onClick={() => handleAccountClick('new.user@gmail.com', 'Google User')}
              >
                <div className="google-avatar add-avatar">+</div>
                <div className="google-account-details">
                  <span className="google-name">Use another account</span>
                </div>
              </button>
            </div>

            {/* Footer Trust Info */}
            <div className="google-modal-footer">
              <Shield size={12} className="shield-icon" />
              <span>To continue, Google will share your name, email address, language preference and profile picture with Vicharanashala.</span>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default GoogleAuthModal;
