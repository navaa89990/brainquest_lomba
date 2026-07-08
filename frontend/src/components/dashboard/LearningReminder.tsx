import React, { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useTheme } from '../../lib/ThemeContext';

interface LearningReminderProps {
  onNavigateToSettings: () => void;
}

const LearningReminder: React.FC<LearningReminderProps> = ({ onNavigateToSettings }) => {
  const { colors } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isEnabled = localStorage.getItem('notifications') !== 'false';
    const isShownThisSession = sessionStorage.getItem('learningReminderShown') === 'true';

    if (isEnabled && !isShownThisSession) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        sessionStorage.setItem('learningReminderShown', 'true');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isVisible) return null;

  const toastStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    backgroundColor: colors.surface,
    border: `1.5px solid ${colors.border}`,
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    width: '340px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    animation: 'slideIn 0.3s ease-out',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const titleGroupStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: 750,
    color: colors.text,
    margin: 0,
  };

  const closeButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: colors.subtext,
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'background-color 0.2s',
  };

  const textStyle: React.CSSProperties = {
    fontSize: '13px',
    color: colors.text,
    lineHeight: 1.5,
    margin: 0,
  };

  const footerTextStyle: React.CSSProperties = {
    fontSize: '11px',
    color: colors.subtext,
    lineHeight: 1.4,
    margin: 0,
  };

  const actionButtonStyle: React.CSSProperties = {
    backgroundColor: '#F4A623',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    alignSelf: 'flex-start',
    transition: 'background-color 0.2s',
  };

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
      <div style={toastStyle}>
        <div style={headerStyle}>
          <div style={titleGroupStyle}>
            <Bell size={18} color="#F4A623" />
            <h4 style={titleStyle}>Pengingat Belajar</h4>
          </div>
          <button style={closeButtonStyle} onClick={() => setIsVisible(false)}>
            <X size={16} />
          </button>
        </div>
        <p style={textStyle}>
          Jangan lupa untuk melanjutkan petualangan belajarmu hari ini! Selesaikan kuis untuk mempertahankan streak belajarmu.
        </p>
        <p style={footerTextStyle}>
          Merasa terganggu? Anda bisa menonaktifkan pengingat ini di Halaman Pengaturan.
        </p>
        <button
          style={actionButtonStyle}
          onClick={() => {
            setIsVisible(false);
            onNavigateToSettings();
          }}
        >
          Pergi ke Pengaturan
        </button>
      </div>
    </>
  );
};

export default LearningReminder;