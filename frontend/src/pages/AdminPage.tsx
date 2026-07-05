import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/useAuth';
import { apiService } from '../lib/apiService';
import { useNavigate } from 'react-router-dom';
import {
  MdPeople,
  MdShield,
  MdStar,
  MdTrendingUp,
  MdPerson,
  MdMail,
  MdCalendarToday,
  MdWorkspacePremium,
  MdEmojiEvents,
  MdLogout,
} from 'react-icons/md';import { AlertTriangle } from 'lucide-react';
interface AdminUser {
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

interface DashboardStats {
  totalUsers: number;
  totalAdmins: number;
  totalPoints: number;
  averageLevel: number;
}

function AdminPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalAdmins: 0,
    totalPoints: 0,
    averageLevel: 0,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        if (!isAuthenticated || !token) {
          setError('Anda harus login sebagai admin untuk mengakses halaman ini.');
          setLoading(false);
          return;
        }

        if (user?.role !== 'admin') {
          setError('Anda tidak memiliki akses ke halaman admin.');
          setLoading(false);
          return;
        }

        const response = await apiService.getAllUsers(token);

        if (response.error) {
          setError(response.error);
          setLoading(false);
          return;
        }

        const userList = response.users || [];
        
        // Urutkan berdasarkan ID dari terkecil ke terbesar
        const sortedUsers = userList.sort((a: AdminUser, b: AdminUser) => a.id - b.id);
        setUsers(sortedUsers);

        const totalUsers = userList.length;
        const admins = userList.filter((u: AdminUser) => u.role === 'admin');
        const totalPoints = userList.reduce((sum: number, u: AdminUser) => sum + (u.points || 0), 0);
        const averageLevel = totalUsers > 0
          ? Math.round(userList.reduce((sum: number, u: AdminUser) => sum + (u.level || 1), 0) / totalUsers)
          : 0;

        setStats({
          totalUsers,
          totalAdmins: admins.length,
          totalPoints,
          averageLevel,
        });
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Gagal memuat data pengguna. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, isAuthenticated, user]);

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
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

  const handleRoleChange = async (userId: number, currentRole: string) => {
    if (!token) return;

    const nextRole = currentRole === 'admin' ? 'user' : 'admin';

    try {
      const response = await apiService.updateUserRole(token, userId, nextRole as 'user' | 'admin');
      if (response.error) throw new Error(response.error);

      setUsers((prev) => {
        const updated = prev.map((item) => item.id === userId ? { ...item, role: nextRole } : item);
        setStats({
          totalUsers: updated.length,
          totalAdmins: updated.filter((item) => item.role === 'admin').length,
          totalPoints: updated.reduce((sum, item) => sum + (item.points || 0), 0),
          averageLevel: updated.length > 0
            ? Math.round(updated.reduce((sum, item) => sum + (item.level || 1), 0) / updated.length)
            : 0,
        });
        return updated;
      });
    } catch (err) {
      console.error('Error updating role:', err);
      setError('Gagal mengubah role pengguna.');
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

  if (loading) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.container}>
          <div style={styles.header}>
            <h1 style={styles.title}>Dashboard Admin</h1>
            <p style={styles.subtitle}>Memuat data pengguna...</p>
          </div>
          <div style={styles.statsGrid}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={styles.skeletonCard}>
                <div style={styles.skeletonLine} />
                <div style={{ ...styles.skeletonLine, width: '60%', marginTop: '8px' }} />
              </div>
            ))}
          </div>
          <div style={styles.tableSkeleton}>
            <div style={styles.skeletonLine} />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ ...styles.skeletonLine, height: '40px', marginTop: '8px' }} />
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
          <div style={styles.header}>
            <h1 style={styles.title}>Dashboard Admin</h1>
            <p style={styles.subtitle}>Terjadi kesalahan</p>
          </div>
          <div style={styles.errorBox}>
            <span style={styles.errorIcon}><AlertTriangle size={20} color="#dc2626" /></span>
            <div>
              <p style={styles.errorText}>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                style={styles.retryButton}
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Pengguna', value: stats.totalUsers, icon: MdPeople, color: '#6366f1', bgColor: '#eef2ff' },
    { label: 'Admin Aktif', value: stats.totalAdmins, icon: MdShield, color: '#f59e0b', bgColor: '#fef3c7' },
    { label: 'Total Poin', value: stats.totalPoints.toLocaleString(), icon: MdStar, color: '#10b981', bgColor: '#d1fae5' },
    { label: 'Rata-rata Level', value: stats.averageLevel, icon: MdTrendingUp, color: '#ef4444', bgColor: '#fee2e2' },
  ];

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>Dashboard Admin</h1>
            <p style={styles.subtitle}>
              Kelola pengguna dan pantau aktivitas belajar di BrainQuest
            </p>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.headerBadge}>
              <MdEmojiEvents size={16} style={{ marginRight: '6px' }} />
              <span style={styles.badgeText}>Admin</span>
            </div>
            <button 
              onClick={handleLogout}
              style={styles.logoutButton}
            >
              <MdLogout size={18} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <section style={styles.statsGrid} aria-label="Statistik Dashboard">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                style={{ ...styles.statCard, borderTop: `4px solid ${card.color}` }}
              >
                <div style={styles.statHeader}>
                  <div style={{ ...styles.statIconWrapper, backgroundColor: card.bgColor }}>
                    <Icon size={22} color={card.color} strokeWidth={2} />
                  </div>
                  <span style={styles.statValue}>{card.value}</span>
                </div>
                <p style={styles.statLabel}>{card.label}</p>
              </div>
            );
          })}
        </section>

        <section style={styles.tableSection} aria-label="Daftar Pengguna">
          <div style={styles.tableHeader}>
            <div style={styles.tableHeaderLeft}>
              <MdPeople size={20} color="#6366f1" />
              <h2 style={styles.tableTitle}>Daftar Pengguna</h2>
            </div>
            <span style={styles.tableCount}>{users.length} pengguna</span>
          </div>

          <div style={styles.tableContainer}>
            {users.length === 0 ? (
              <div style={styles.emptyState}>
                <MdPeople size={48} color="#cbd5e1" />
                <p style={styles.emptyText}>Belum ada pengguna terdaftar</p>
              </div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Pengguna</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Nama Lengkap</th>
                    <th style={styles.th}>Role</th>
                    <th style={styles.th}>Poin</th>
                    <th style={styles.th}>Level</th>
                    <th style={styles.th}>Terdaftar</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} style={styles.tr}>
                      <td style={styles.td}>#{user.id}</td>
                      <td style={styles.td}>
                        <div style={styles.userCell}>
                          {user.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              alt={user.username}
                              style={styles.avatar}
                            />
                          ) : (
                            <div style={styles.avatarPlaceholder}>
                              {getInitials(user.fullName || user.username)}
                            </div>
                          )}
                          <span style={styles.username}>{user.username}</span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.emailCell}>
                          <MdMail size={14} color="#94a3b8" />
                          <span>{user.email}</span>
                        </div>
                      </td>
                      <td style={styles.td}>{user.fullName || '-'}</td>
                      <td style={styles.td}>
                        <div style={styles.roleCell}>
                          <span
                            style={{
                              ...styles.roleBadge,
                              backgroundColor:
                                user.role === 'admin'
                                  ? 'rgba(251, 191, 36, 0.15)'
                                  : 'rgba(99, 102, 241, 0.08)',
                              color:
                                user.role === 'admin' ? '#b45309' : '#6366f1',
                            }}
                          >
                            {user.role === 'admin' ? (
                              <>
                                <MdEmojiEvents size={12} style={{ marginRight: '4px' }} />
                                Admin
                              </>
                            ) : (
                              <>
                                <MdPerson size={12} style={{ marginRight: '4px' }} />
                                User
                              </>
                            )}
                          </span>
                          <button
                            onClick={() => handleRoleChange(user.id, user.role)}
                            style={styles.roleToggleButton}
                          >
                            {user.role === 'admin' ? 'Turunkan' : 'Naikkan'}
                          </button>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.pointsBadge}>
                          <MdStar size={14} color="#f59e0b" style={{ marginRight: '4px' }} />
                          {user.points}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.levelBadge}>
                          <MdWorkspacePremium size={14} color="#6366f1" style={{ marginRight: '4px' }} />
                          Lv.{user.level}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.dateCell}>
                          <MdCalendarToday size={14} color="#94a3b8" />
                          <span style={styles.dateText}>{formatDate(user.createdAt)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
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
    maxWidth: '1280px',
    margin: '0 auto',
  } as React.CSSProperties,

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
    flexWrap: 'wrap' as const,
    gap: '16px',
  } as React.CSSProperties,

  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
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

  headerBadge: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    padding: '8px 20px',
    borderRadius: '100px',
    border: '1px solid rgba(251, 191, 36, 0.2)',
  } as React.CSSProperties,

  badgeText: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#b45309',
  } as React.CSSProperties,

  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 20px',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '100px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  } as React.CSSProperties,

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    marginBottom: '40px',
  } as React.CSSProperties,

  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  } as React.CSSProperties,

  statHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as React.CSSProperties,

  statIconWrapper: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,

  statValue: {
    fontSize: '32px',
    fontWeight: 800,
    color: '#0f172a',
  } as React.CSSProperties,

  statLabel: {
    fontSize: '14px',
    color: '#64748b',
    margin: '8px 0 0 0',
    fontWeight: 500,
  } as React.CSSProperties,

  tableSection: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
    overflow: 'hidden',
  } as React.CSSProperties,

  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #f1f5f9',
  } as React.CSSProperties,

  tableHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  } as React.CSSProperties,

  tableTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
  } as React.CSSProperties,

  tableCount: {
    fontSize: '14px',
    color: '#94a3b8',
    fontWeight: 500,
    backgroundColor: '#f1f5f9',
    padding: '4px 12px',
    borderRadius: '100px',
  } as React.CSSProperties,

  tableContainer: {
    overflowX: 'auto',
  } as React.CSSProperties,

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '900px',
  } as React.CSSProperties,

  th: {
    textAlign: 'left',
    padding: '14px 20px',
    backgroundColor: '#f8fafc',
    color: '#475569',
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    borderBottom: '1px solid #e2e8f0',
  } as React.CSSProperties,

  tr: {
    transition: 'background 0.15s ease',
  } as React.CSSProperties,

  td: {
    padding: '14px 20px',
    borderBottom: '1px solid #f1f5f9',
    color: '#334155',
    fontSize: '14px',
    verticalAlign: 'middle',
  } as React.CSSProperties,

  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  } as React.CSSProperties,

  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    objectFit: 'cover' as const,
  } as React.CSSProperties,

  avatarPlaceholder: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#eef2ff',
    color: '#6366f1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 700,
    flexShrink: 0,
  } as React.CSSProperties,

  username: {
    fontWeight: 600,
    color: '#0f172a',
  } as React.CSSProperties,

  emailCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#64748b',
  } as React.CSSProperties,

  dateCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  } as React.CSSProperties,

  dateText: {
    color: '#94a3b8',
    fontSize: '13px',
  } as React.CSSProperties,

  roleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    borderRadius: '100px',
    fontSize: '12px',
    fontWeight: 700,
  } as React.CSSProperties,

  roleCell: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
    alignItems: 'flex-start',
  } as React.CSSProperties,

  roleToggleButton: {
    border: '1px solid #cbd5e1',
    borderRadius: '999px',
    backgroundColor: '#fff',
    padding: '4px 8px',
    fontSize: '11px',
    fontWeight: 700,
    color: '#475569',
    cursor: 'pointer',
  } as React.CSSProperties,

  pointsBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    fontWeight: 700,
    color: '#0f172a',
  } as React.CSSProperties,

  levelBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    fontWeight: 600,
    color: '#6366f1',
  } as React.CSSProperties,

  errorBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  } as React.CSSProperties,

  errorIcon: {
    fontSize: '24px',
  } as React.CSSProperties,

  errorText: {
    color: '#991b1b',
    fontSize: '15px',
    margin: 0,
    fontWeight: 500,
  } as React.CSSProperties,

  retryButton: {
    marginTop: '8px',
    padding: '6px 16px',
    backgroundColor: '#991b1b',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  } as React.CSSProperties,

  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 24px',
    gap: '12px',
  } as React.CSSProperties,

  emptyText: {
    color: '#94a3b8',
    fontSize: '16px',
    fontWeight: 500,
    margin: 0,
  } as React.CSSProperties,

  skeletonCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
  } as React.CSSProperties,

  skeletonLine: {
    height: '20px',
    borderRadius: '6px',
    background: 'linear-gradient(90deg, #f0f2f5 25%, #e8eaed 50%, #f0f2f5 75%)',
    backgroundSize: '800px 100%',
    animation: 'shimmer 1.5s infinite',
  } as React.CSSProperties,

  tableSkeleton: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
  } as React.CSSProperties,
};

const shimmerStyle = document.createElement('style');
shimmerStyle.textContent = `
  @keyframes shimmer {
    0% { background-position: -800px 0; }
    100% { background-position: 800px 0; }
  }
  @media (max-width: 768px) {
    .admin-stats-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }
  @media (max-width: 480px) {
    .admin-stats-grid {
      grid-template-columns: 1fr !important;
    }
  }
`;
document.head.appendChild(shimmerStyle);

export default AdminPage;