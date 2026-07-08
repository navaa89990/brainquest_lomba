import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/useAuth';
import { useTheme } from '../lib/ThemeContext';
import { apiService } from '../lib/apiService';
import {
  MdPerson,
  MdWorkspacePremium,
  MdStar,
  MdCalendarToday,
  MdEmojiEvents,
  MdLogout,
} from 'react-icons/md';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  points: number;
  level: number;
  profilePicture?: string;
  createdAt: string;
}

interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  subtext: string;
  border: string;
  primary: string;
  secondary: string;
  accent: string;
}

function ProfilePage() {
  const { isAuthenticated, token, logout } = useAuth();
  const { colors } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const styles = getStyles(colors);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated || !token) {
        setError('Anda harus login untuk melihat profil');
        setLoading(false);
        return;
      }
      try {
        const response = await apiService.getProfile(token);
        if (response.error) setError(response.error);
        else setProfile(response.user || response);
      } catch (err) {
        setError('Gagal memuat data profil');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token, isAuthenticated]);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.stateCard}>
          <span style={styles.stateText}>Memuat profil...</span>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.stateCard}>
          <span style={styles.stateText}>{error || 'Profil tidak ditemukan'}</span>
        </div>
      </div>
    );
  }

  const isAdmin = profile.role === 'admin';
  const initial = profile.fullName ? profile.fullName.charAt(0).toUpperCase() : profile.username.charAt(0).toUpperCase();

  const statCards = [
    {
      label: 'Total Poin',
      value: profile.points.toLocaleString('id-ID'),
      icon: MdStar,
      color: colors.secondary,
    },
    {
      label: 'Level',
      value: profile.level,
      icon: MdWorkspacePremium,
      color: colors.primary,
    },
    {
      label: 'Role',
      value: isAdmin ? 'Admin' : 'User',
      icon: isAdmin ? MdEmojiEvents : MdPerson,
      color: colors.accent,
    },
    {
      label: 'Bergabung',
      value: new Date(profile.createdAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      icon: MdCalendarToday,
      color: colors.subtext,
    },
  ];

  return (
    <div style={styles.wrapper}>
      <main style={styles.container}>
        <section style={styles.profileCard}>
          <div style={styles.coverBanner}>
            <button onClick={handleLogout} style={styles.logoutButton}>
              <MdLogout size={16} />
              <span>Logout</span>
            </button>
          </div>

          <div style={styles.identitySection}>
            <div style={styles.avatar}>
              {profile.profilePicture ? (
                <img src={profile.profilePicture} alt={profile.fullName} style={styles.avatarImage} />
              ) : (
                <span style={styles.avatarInitial}>{initial}</span>
              )}
            </div>

            <div style={styles.identityText}>
              <h1 style={styles.title}>{profile.fullName}</h1>
              <p style={styles.username}>@{profile.username}</p>
              <p style={styles.email}>{profile.email}</p>
            </div>

            <span
              style={{
                ...styles.roleBadge,
                backgroundColor: isAdmin ? `${colors.secondary}26` : `${colors.primary}26`,
                color: isAdmin ? colors.secondary : colors.primary,
              }}
            >
              {isAdmin ? <MdEmojiEvents size={14} /> : <MdPerson size={14} />}
              {isAdmin ? 'Admin' : 'User'}
            </span>
          </div>

          <div style={styles.statsGrid}>
            {statCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div key={index} style={styles.statCard}>
                  <div style={{ ...styles.statIconWrapper, backgroundColor: `${card.color}1f` }}>
                    <Icon size={20} color={card.color} />
                  </div>
                  <div style={styles.statTextGroup}>
                    <span style={styles.statValue}>{card.value}</span>
                    <span style={styles.statLabel}>{card.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

const getStyles = (colors: ThemeColors) => ({
  wrapper: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: colors.background,
    padding: '120px 24px 60px',
    display: 'flex',
    justifyContent: 'center',
  } as React.CSSProperties,
  stateCard: {
    marginTop: '80px',
    padding: '32px 40px',
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: '20px',
    height: 'fit-content',
  } as React.CSSProperties,
  stateText: {
    fontSize: '15px',
    color: colors.subtext,
    fontWeight: 500,
  } as React.CSSProperties,
  container: {
    maxWidth: '900px',
    width: '100%',
  } as React.CSSProperties,
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: '28px',
    border: `1px solid ${colors.border}`,
    overflow: 'hidden',
  } as React.CSSProperties,
  coverBanner: {
    height: '140px',
    width: '100%',
    background: 'linear-gradient(135deg, #F4A623, #d97706)',
    position: 'relative',
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '20px',
    boxSizing: 'border-box',
  } as React.CSSProperties,
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 18px',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    borderRadius: '100px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
    height: 'fit-content',
  } as React.CSSProperties,
  identitySection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '0 32px 28px',
    marginTop: '-56px',
    position: 'relative',
    zIndex: 5,
  } as React.CSSProperties,
  avatar: {
    width: '112px',
    height: '112px',
    borderRadius: '50%',
    backgroundColor: colors.background,
    border: `4px solid ${colors.surface}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    boxShadow: `0 0 0 1px ${colors.border}`,
    position: 'relative',
    zIndex: 6,
  } as React.CSSProperties,
  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  } as React.CSSProperties,
  avatarInitial: {
    fontSize: '40px',
    fontWeight: 800,
    color: '#F4A623',
  } as React.CSSProperties,
  identityText: {
    marginTop: '14px',
  } as React.CSSProperties,
  title: {
    fontSize: '24px',
    fontWeight: 800,
    color: colors.text,
    margin: 0,
  } as React.CSSProperties,
  username: {
    fontSize: '14px',
    color: colors.subtext,
    margin: '4px 0 0',
    fontWeight: 500,
  } as React.CSSProperties,
  email: {
    fontSize: '13px',
    color: colors.subtext,
    margin: '2px 0 0',
  } as React.CSSProperties,
  roleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '14px',
    padding: '6px 16px',
    borderRadius: '100px',
    fontSize: '13px',
    fontWeight: 700,
  } as React.CSSProperties,
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '14px',
    padding: '0 32px 32px',
  } as React.CSSProperties,
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '18px',
    borderRadius: '18px',
    backgroundColor: colors.background,
    border: `1px solid ${colors.border}`,
  } as React.CSSProperties,
  statIconWrapper: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  } as React.CSSProperties,
  statTextGroup: {
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,
  statValue: {
    fontSize: '18px',
    fontWeight: 700,
    color: colors.text,
  } as React.CSSProperties,
  statLabel: {
    fontSize: '12px',
    color: colors.subtext,
    fontWeight: 500,
  } as React.CSSProperties,
});

export default ProfilePage;