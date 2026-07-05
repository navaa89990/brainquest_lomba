import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/useAuth';
import { apiService } from '../lib/apiService';
import {
  MdPerson,
  MdMail,
  MdWorkspacePremium,
  MdStar,
  MdCalendarToday,
  MdEmojiEvents,
  MdLocalFireDepartment,
  MdMenuBook,
  MdTrendingUp,
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

function ProfilePage() {
  const { isAuthenticated, token, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated || !token) {
        setError('Anda harus login untuk melihat profil');
        setLoading(false);
        return;
      }

      try {
        const response = await apiService.getProfile(token);
        if (response.error) {
          setError(response.error);
        } else {
          setProfile(response.user || response);
        }
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.container}>
          <div style={styles.skeletonHeader}>
            <div style={styles.skeletonAvatar} />
            <div style={styles.skeletonInfo}>
              <div style={{ ...styles.skeletonLine, width: '200px', height: '28px' }} />
              <div style={{ ...styles.skeletonLine, width: '120px', height: '16px', marginTop: '8px' }} />
            </div>
          </div>
          <div style={styles.skeletonGrid}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={styles.skeletonCard}>
                <div style={{ ...styles.skeletonLine, width: '40px', height: '40px', borderRadius: '12px' }} />
                <div style={{ ...styles.skeletonLine, width: '80%', height: '14px', marginTop: '8px' }} />
                <div style={{ ...styles.skeletonLine, width: '60%', height: '20px', marginTop: '4px' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.container}>
          <h1 style={styles.title}>Profil Saya</h1>
          <div style={styles.errorBox}>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.container}>
          <h1 style={styles.title}>Profil Saya</h1>
          <p>Data profil tidak ditemukan</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Poin', value: profile.points.toLocaleString(), icon: MdStar, color: '#f59e0b', bgColor: '#fef3c7' },
    { label: 'Level', value: profile.level, icon: MdWorkspacePremium, color: '#6366f1', bgColor: '#eef2ff' },
    { label: 'Role', value: profile.role === 'admin' ? 'Admin' : 'User', icon: profile.role === 'admin' ? MdEmojiEvents : MdPerson, color: profile.role === 'admin' ? '#f59e0b' : '#6366f1', bgColor: profile.role === 'admin' ? '#fef3c7' : '#eef2ff' },
    { label: 'Bergabung', value: formatDate(profile.createdAt), icon: MdCalendarToday, color: '#94a3b8', bgColor: '#f1f5f9' },
  ];

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Profil Saya</h1>
            <p style={styles.subtitle}>Kelola informasi akun dan pantau progres belajarmu</p>
          </div>
          <button onClick={handleLogout} style={styles.logoutButton}>
            <MdLogout size={18} />
            <span>Logout</span>
          </button>
        </div>

        <div style={styles.profileCard}>
          <div style={styles.profileHeader}>
            <div style={styles.avatarLarge}>
              {profile.profilePicture ? (
                <img src={profile.profilePicture} alt={profile.fullName} style={styles.avatarImage} />
              ) : (
                <span style={styles.avatarText}>{getInitials(profile.fullName || profile.username)}</span>
              )}
            </div>
            <div style={styles.profileInfo}>
              <h2 style={styles.profileName}>{profile.fullName || profile.username}</h2>
              <p style={styles.profileRole}>
                {profile.role === 'admin' ? (
                  <>
                    <MdEmojiEvents size={16} color="#f59e0b" />
                    <span>Administrator</span>
                  </>
                ) : (
                  <>
                    <MdPerson size={16} color="#6366f1" />
                    <span>Member</span>
                  </>
                )}
              </p>
              <div style={styles.profileBadge}>
                <MdMenuBook size={14} />
                <span>{profile.role === 'admin' ? 'Akses Penuh' : 'Akses Member'}</span>
              </div>
            </div>
            <div style={styles.profileLevel}>
              <div style={styles.levelCircle}>
                <MdWorkspacePremium size={24} color="#f59e0b" />
                <span style={styles.levelNumber}>{profile.level}</span>
              </div>
              <span style={styles.levelLabel}>Level</span>
            </div>
          </div>

          <div style={styles.statsGrid}>
            {statCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div key={index} style={{ ...styles.statCard, backgroundColor: card.bgColor }}>
                  <div style={styles.statIconWrapper}>
                    <Icon size={20} color={card.color} />
                  </div>
                  <div>
                    <span style={styles.statValue}>{card.value}</span>
                    <span style={styles.statLabel}>{card.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={styles.profileDetails}>
            <div style={styles.detailItem}>
              <div style={styles.detailIcon}>
                <MdPerson size={18} color="#6366f1" />
              </div>
              <div>
                <span style={styles.detailLabel}>Username</span>
                <span style={styles.detailValue}>@{profile.username}</span>
              </div>
            </div>
            <div style={styles.detailItem}>
              <div style={styles.detailIcon}>
                <MdMail size={18} color="#6366f1" />
              </div>
              <div>
                <span style={styles.detailLabel}>Email</span>
                <span style={styles.detailValue}>{profile.email}</span>
              </div>
            </div>
            <div style={styles.detailItem}>
              <div style={styles.detailIcon}>
                <MdStar size={18} color="#f59e0b" />
              </div>
              <div>
                <span style={styles.detailLabel}>Total Poin</span>
                <span style={styles.detailValue}>{profile.points.toLocaleString()} poin</span>
              </div>
            </div>
            <div style={styles.detailItem}>
              <div style={styles.detailIcon}>
                <MdLocalFireDepartment size={18} color="#ef4444" />
              </div>
              <div>
                <span style={styles.detailLabel}>Level</span>
                <span style={styles.detailValue}>Level {profile.level}</span>
              </div>
            </div>
            <div style={styles.detailItem}>
              <div style={styles.detailIcon}>
                <MdCalendarToday size={18} color="#94a3b8" />
              </div>
              <div>
                <span style={styles.detailLabel}>Bergabung</span>
                <span style={styles.detailValue}>{formatDate(profile.createdAt)}</span>
              </div>
            </div>
            <div style={styles.detailItem}>
              <div style={styles.detailIcon}>
                <MdTrendingUp size={18} color="#10b981" />
              </div>
              <div>
                <span style={styles.detailLabel}>Status</span>
                <span style={styles.detailValue}>
                  {profile.role === 'admin' ? 'Administrator' : 'Member Aktif'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -800px 0; }
          100% { background-position: 800px 0; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  wrapper: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: '120px 24px 60px',
  } as React.CSSProperties,

  container: {
    maxWidth: '900px',
    margin: '0 auto',
  } as React.CSSProperties,

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px',
  } as React.CSSProperties,

  title: {
    fontSize: '32px',
    fontWeight: 800,
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.02em',
  } as React.CSSProperties,

  subtitle: {
    fontSize: '16px',
    color: '#64748b',
    margin: '6px 0 0 0',
  } as React.CSSProperties,

  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '100px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
  } as React.CSSProperties,

  errorBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    padding: '16px',
    color: '#991b1b',
  } as React.CSSProperties,

  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
    overflow: 'hidden',
  } as React.CSSProperties,

  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    padding: '32px 32px 24px 32px',
    borderBottom: '1px solid #f1f5f9',
    flexWrap: 'wrap',
  } as React.CSSProperties,

  avatarLarge: {
    width: '88px',
    height: '88px',
    borderRadius: '50%',
    backgroundColor: '#eef2ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
    border: '3px solid #f59e0b',
  } as React.CSSProperties,

  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  } as React.CSSProperties,

  avatarText: {
    fontSize: '36px',
    fontWeight: 700,
    color: '#6366f1',
  } as React.CSSProperties,

  profileInfo: {
    flex: 1,
    minWidth: '200px',
  } as React.CSSProperties,

  profileName: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
  } as React.CSSProperties,

  profileRole: {
    fontSize: '14px',
    color: '#64748b',
    margin: '4px 0 0 0',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  } as React.CSSProperties,

  profileBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '8px',
    padding: '4px 12px',
    backgroundColor: '#f1f5f9',
    borderRadius: '100px',
    fontSize: '12px',
    color: '#475569',
    fontWeight: 600,
  } as React.CSSProperties,

  profileLevel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    padding: '8px 16px',
    backgroundColor: '#fef3c7',
    borderRadius: '16px',
    minWidth: '70px',
  } as React.CSSProperties,

  levelCircle: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  } as React.CSSProperties,

  levelNumber: {
    fontSize: '24px',
    fontWeight: 800,
    color: '#d97706',
  } as React.CSSProperties,

  levelLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#b45309',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  } as React.CSSProperties,

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
    padding: '20px 32px',
    borderBottom: '1px solid #f1f5f9',
  } as React.CSSProperties,

  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    borderRadius: '14px',
    transition: 'transform 0.2s ease',
  } as React.CSSProperties,

  statIconWrapper: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  } as React.CSSProperties,

  statValue: {
    display: 'block',
    fontSize: '18px',
    fontWeight: 700,
    color: '#0f172a',
    lineHeight: 1.2,
  } as React.CSSProperties,

  statLabel: {
    display: 'block',
    fontSize: '12px',
    color: '#64748b',
    fontWeight: 500,
  } as React.CSSProperties,

  profileDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    padding: '24px 32px 32px 32px',
  } as React.CSSProperties,

  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px 18px',
    backgroundColor: '#f8fafc',
    borderRadius: '14px',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  detailIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  } as React.CSSProperties,

  detailLabel: {
    display: 'block',
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  } as React.CSSProperties,

  detailValue: {
    display: 'block',
    fontSize: '15px',
    color: '#0f172a',
    fontWeight: 600,
  } as React.CSSProperties,

  // Skeleton styles
  skeletonHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    padding: '32px',
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    marginBottom: '24px',
  } as React.CSSProperties,

  skeletonAvatar: {
    width: '88px',
    height: '88px',
    borderRadius: '50%',
    background: 'linear-gradient(90deg, #f0f2f5 25%, #e8eaed 50%, #f0f2f5 75%)',
    backgroundSize: '800px 100%',
    animation: 'shimmer 1.5s infinite',
    flexShrink: 0,
  } as React.CSSProperties,

  skeletonInfo: {
    flex: 1,
  } as React.CSSProperties,

  skeletonLine: {
    borderRadius: '6px',
    background: 'linear-gradient(90deg, #f0f2f5 25%, #e8eaed 50%, #f0f2f5 75%)',
    backgroundSize: '800px 100%',
    animation: 'shimmer 1.5s infinite',
  } as React.CSSProperties,

  skeletonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
  } as React.CSSProperties,

  skeletonCard: {
    padding: '16px',
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #f1f5f9',
  } as React.CSSProperties,
};

export default ProfilePage;