import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/useAuth';
import { apiService } from '../lib/apiService';

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

function AdminPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        if (!token) {
          setError('Token not tersedia');
          return;
        }
        const response = await apiService.getAllUsers(token);
        if (response.error) {
          setError(response.error);
        } else {
          setUsers(response.users || []);
        }
      } catch (err) {
        setError('Gagal memuat data pengguna');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  return (
    <div style={styles.pageWrapper}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <p style={styles.subtitle}>Kelola pengguna dan lihat ringkasan akun dengan role admin.</p>
        </div>
      </header>

      <main style={styles.mainContent}>
        {loading ? (
          <div style={styles.statusMessage}>Memuat...</div>
        ) : error ? (
          <div style={styles.errorMessage}>{error}</div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Nama Lengkap</th>
                  <th>Role</th>
                  <th>Points</th>
                  <th>Level</th>
                  <th>Terdaftar</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.fullName}</td>
                    <td>{user.role}</td>
                    <td>{user.points}</td>
                    <td>{user.level}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  pageWrapper: {
    width: '100%',
    minHeight: '100vh',
    padding: '40px 24px',
    backgroundColor: '#f7f8fc',
    color: '#1f2937',
  } as React.CSSProperties,
  header: {
    marginBottom: '24px',
  } as React.CSSProperties,
  title: {
    fontSize: '32px',
    margin: 0,
    color: '#111827',
  } as React.CSSProperties,
  subtitle: {
    fontSize: '16px',
    color: '#6b7280',
    marginTop: '8px',
  } as React.CSSProperties,
  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  } as React.CSSProperties,
  statusMessage: {
    fontSize: '16px',
    color: '#111827',
  } as React.CSSProperties,
  errorMessage: {
    color: '#b91c1c',
    fontSize: '16px',
    backgroundColor: '#fee2e2',
    padding: '16px',
    borderRadius: '12px',
  } as React.CSSProperties,
  tableContainer: {
    overflowX: 'auto',
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
  } as React.CSSProperties,
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '800px',
  } as React.CSSProperties,
  th: {
    textAlign: 'left',
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb',
    color: '#374151',
    fontSize: '14px',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  } as React.CSSProperties,
  td: {
    padding: '18px 20px',
    borderBottom: '1px solid #e5e7eb',
    color: '#4b5563',
    fontSize: '14px',
  } as React.CSSProperties,
};

export default AdminPage;
