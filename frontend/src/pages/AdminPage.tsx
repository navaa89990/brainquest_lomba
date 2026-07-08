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
} from 'react-icons/md';
import { AlertTriangle, Edit3, Trash2, Plus, BookOpen, Sun, Moon } from 'lucide-react';
import { useTheme } from '../lib/ThemeContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

interface Question {
  id: number;
  question_text: string;
  options: string[];
  correct_answer: string;
}

interface Material {
  id: number;
  title: string;
  category: string;
  content: string;
  status: string;
  parent_id?: number | null;
}

function AdminPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme, colors } = useTheme();
  const token = localStorage.getItem('token');
  
  const [activeTab, setActiveTab] = useState<'users' | 'quiz' | 'materi'>('users');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalAdmins: 0,
    totalPoints: 0,
    averageLevel: 0,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [message, setMessage] = useState('');

  const [newMaterial, setNewMaterial] = useState({
    title: '',
    content: '',
    category: 'Pemrograman',
    status: 'Gratis',
    parent_id: null as number | null,
  });

  const [currentOptions, setCurrentOptions] = useState<string[]>(['', '', '']);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number>(0);
  const [quizLimit, setQuizLimit] = useState<number>(5);
  const [newQuestionText, setNewQuestionText] = useState('');

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

        const materialsResponse = await apiService.getMaterials(1, 100);
        setMaterials(materialsResponse.materials || []);

      } catch (err) {
        console.error(err);
        setError('Gagal memuat data pengguna. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, isAuthenticated, user]);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!selectedMaterialId) return;
      try {
        const response = await apiService.getMaterialDetail(selectedMaterialId);
        const questionData = response.questions || [];
        const valid = questionData.map((q: any) => {
          const opts = [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean);
          return {
            id: q.id,
            question_text: q.question_text,
            options: opts,
            correct_answer: q.correct_answer,
          } as Question;
        });
        setQuestions(valid);
      } catch (err) {
        console.error(err);
      }
    };
    fetchQuestions();
  }, [selectedMaterialId]);

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    } catch (err) {
      console.error(err);
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
      console.error(err);
      setError('Gagal mengubah role pengguna.');
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedMaterialId) return;

    const finalCorrectAnswer = currentOptions[correctAnswerIndex];

    const payload = {
      question_text: newQuestionText,
      option_a: currentOptions[0] || '',
      option_b: currentOptions[1] || '',
      option_c: currentOptions[2] || '',
      option_d: currentOptions[3] || '',
      correct_answer: finalCorrectAnswer,
    };

    try {
      if (editingQuestion) {
        const res = await fetch(`${API_BASE_URL}/api/materials/questions/${editingQuestion.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const response = await res.json();
        if (response.error) throw new Error(response.error);

        setMessage('Soal kuis berhasil diperbarui!');
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === editingQuestion.id
              ? { ...q, question_text: newQuestionText, options: currentOptions.filter(Boolean), correct_answer: finalCorrectAnswer }
              : q
          )
        );
      } else {
        const res = await fetch(`${API_BASE_URL}/api/materials/${selectedMaterialId}/questions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const response = await res.json();
        if (response.error) throw new Error(response.error);

        setMessage('Soal kuis baru berhasil ditambahkan!');
        setQuestions((prev) => [...prev, { id: response.id, question_text: newQuestionText, options: currentOptions.filter(Boolean), correct_answer: finalCorrectAnswer }]);
      }
      setEditingQuestion(null);
      setIsAddingQuestion(false);
      setNewQuestionText('');
      setCurrentOptions(['', '', '']);
      setCorrectAnswerIndex(0);
    } catch (err) {
      console.error(err);
      setMessage('Gagal memproses perubahan soal kuis.');
    }
  };

  const startEditQuestion = (q: Question) => {
    setEditingQuestion(q);
    setNewQuestionText(q.question_text);
    setCurrentOptions(q.options.length >= 3 ? q.options : [...q.options, '', '', ''].slice(0, 3));
    const idx = q.options.indexOf(q.correct_answer);
    setCorrectAnswerIndex(idx >= 0 ? idx : 0);
    setIsAddingQuestion(true);
  };

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const response = await apiService.createMaterial(token, newMaterial);
      if (response.error) {
        setMessage(response.error);
      } else {
        setMessage('Materi baru berhasil ditambahkan!');
        setMaterials((prev) => [...prev, response.material || response]);
        setIsAddingMaterial(false);
        setNewMaterial({ title: '', content: '', category: 'Pemrograman', status: 'Gratis', parent_id: null });
      }
    } catch (err) {
      console.error(err);
      setMessage('Gagal menambahkan materi.');
    }
  };

  const handleUpdateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingMaterial) return;

    try {
      const response = await apiService.updateMaterial(token, editingMaterial.id, editingMaterial);
      if (response.error) {
        setMessage(response.error);
      } else {
        setMessage('Materi berhasil diperbarui!');
        setMaterials((prev) =>
          prev.map((m) => (m.id === editingMaterial.id ? editingMaterial : m))
        );
        setEditingMaterial(null);
      }
    } catch (err) {
      console.error(err);
      setMessage('Gagal memperbarui materi.');
    }
  };

  const handleDeleteMaterial = async (materialId: number) => {
    if (!token) return;
    if (!window.confirm('Apakah Anda yakin ingin menghapus materi ini beserta soalnya?')) return;

    try {
      const response = await apiService.deleteMaterial(token, materialId);
      if (response.error) {
        setMessage(response.error);
      } else {
        setMessage('Materi berhasil dihapus!');
        setMaterials((prev) => prev.filter((m) => m.id !== materialId));
      }
    } catch (err) {
      console.error(err);
      setMessage('Gagal menghapus materi.');
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

  const styles = {
    wrapper: {
      width: '100%',
      minHeight: '100vh',
      backgroundColor: colors.background,
      padding: '120px 24px 60px',
      transition: 'background-color 0.2s',
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
      color: colors.text,
      margin: 0,
      letterSpacing: '-0.02em',
    } as React.CSSProperties,

    subtitle: {
      fontSize: '16px',
      color: colors.subtext,
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

    themeToggleBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: colors.surface,
      border: `1.5px solid ${colors.border}`,
      color: colors.text,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    } as React.CSSProperties,

    logoutButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 20px',
      backgroundColor: theme === 'dark' ? '#7f1d1d' : '#fef2f2',
      color: theme === 'dark' ? '#fca5a5' : '#dc2626',
      border: `1px solid ${theme === 'dark' ? '#7f1d1d' : '#fecaca'}`,
      borderRadius: '100px',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontFamily: 'inherit',
    } as React.CSSProperties,

    tabContainer: {
      display: 'flex',
      gap: '12px',
      marginBottom: '32px',
      borderBottom: `2px solid ${colors.border}`,
      paddingBottom: '8px',
      overflowX: 'auto' as const,
      whiteSpace: 'nowrap' as const,
    } as React.CSSProperties,

    tabBtn: {
      padding: '10px 24px',
      borderRadius: '100px',
      fontSize: '14px',
      fontWeight: 700,
      cursor: 'pointer',
      border: '1.5px solid transparent',
      backgroundColor: 'transparent',
      color: colors.subtext,
      transition: 'all 0.2s ease',
    } as React.CSSProperties,

    tabBtnActive: {
      backgroundColor: '#F4A623',
      color: '#ffffff',
      borderColor: '#F4A623',
    } as React.CSSProperties,

    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '20px',
      marginBottom: '40px',
    } as React.CSSProperties,

    statCard: {
      backgroundColor: colors.surface,
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
      border: `1px solid ${colors.border}`,
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
      color: colors.text,
    } as React.CSSProperties,

    statLabel: {
      fontSize: '14px',
      color: colors.subtext,
      margin: '8px 0 0 0',
      fontWeight: 500,
    } as React.CSSProperties,

    tableSection: {
      backgroundColor: colors.surface,
      borderRadius: '20px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
      border: `1px solid ${colors.border}`,
      overflow: 'hidden',
    } as React.CSSProperties,

    tableHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 24px',
      borderBottom: 'none',
    } as React.CSSProperties,

    tableHeaderLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    } as React.CSSProperties,

    tableTitle: {
      fontSize: '18px',
      fontWeight: 700,
      color: colors.text,
      margin: 0,
    } as React.CSSProperties,

    tableCount: {
      fontSize: '14px',
      color: colors.subtext,
      fontWeight: 500,
      backgroundColor: colors.background,
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
      backgroundColor: colors.background,
      color: colors.subtext,
      fontSize: '12px',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      borderBottom: `1px solid ${colors.border}`,
    } as React.CSSProperties,

    tr: {
      transition: 'background 0.15s ease',
    } as React.CSSProperties,

    td: {
      padding: '14px 20px',
      borderBottom: `1px solid ${colors.border}`,
      color: colors.text,
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
      backgroundColor: 'rgba(244, 166, 35, 0.1)',
      color: '#F4A623',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: 700,
      flexShrink: 0,
    } as React.CSSProperties,

    username: {
      fontWeight: 600,
      color: colors.text,
    } as React.CSSProperties,

    emailCell: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      color: colors.subtext,
    } as React.CSSProperties,

    dateCell: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    } as React.CSSProperties,

    dateText: {
      color: colors.subtext,
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
      border: `1.5px solid ${colors.border}`,
      borderRadius: '999px',
      backgroundColor: colors.background,
      padding: '4px 10px',
      fontSize: '11px',
      fontWeight: 700,
      color: colors.text,
      cursor: 'pointer',
    } as React.CSSProperties,

    pointsBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      fontWeight: 700,
      color: colors.text,
    } as React.CSSProperties,

    levelBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      fontWeight: 600,
      color: colors.text,
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
      color: colors.subtext,
      fontSize: '16px',
      fontWeight: 500,
      margin: 0,
    } as React.CSSProperties,

    skeletonCard: {
      backgroundColor: colors.surface,
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
      border: `1px solid ${colors.border}`,
    } as React.CSSProperties,

    skeletonLine: {
      height: '20px',
      borderRadius: '6px',
      background: theme === 'dark'
        ? 'linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)'
        : 'linear-gradient(90deg, #f0f2f5 25%, #e8eaed 50%, #f0f2f5 75%)',
      backgroundSize: '800px 100%',
      animation: 'shimmer 1.5s infinite',
    } as React.CSSProperties,

    tableSkeleton: {
      backgroundColor: colors.surface,
      borderRadius: '20px',
      padding: '24px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
      border: `1px solid ${colors.border}`,
    } as React.CSSProperties,

    select: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '12px',
      border: `1.5px solid ${colors.border}`,
      backgroundColor: colors.background,
      color: colors.text,
      fontSize: '15px',
      outline: 'none',
      marginBottom: '24px',
    } as React.CSSProperties,

    questionList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px',
    } as React.CSSProperties,

    questionItem: {
      padding: '20px',
      borderRadius: '16px',
      backgroundColor: colors.background,
      border: `1px solid ${colors.border}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    } as React.CSSProperties,

    input: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '12px',
      border: `1.5px solid ${colors.border}`,
      backgroundColor: colors.background,
      color: colors.text,
      fontSize: '14px',
      outline: 'none',
      marginBottom: '12px',
    } as React.CSSProperties,

    formBtn: {
      padding: '12px 24px',
      backgroundColor: '#F4A623',
      color: '#ffffff',
      border: 'none',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: 700,
      cursor: 'pointer',
    } as React.CSSProperties,

    cancelBtn: {
      padding: '12px 24px',
      backgroundColor: colors.background,
      color: colors.text,
      border: `1.5px solid ${colors.border}`,
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: 700,
      cursor: 'pointer',
      marginRight: '12px',
    } as React.CSSProperties,

    iconBtn: {
      background: 'none',
      border: 'none',
      color: colors.subtext,
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '8px',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    } as React.CSSProperties,

    mobileUserCard: {
      padding: '20px',
      borderRadius: '16px',
      backgroundColor: colors.surface,
      border: `1px solid ${colors.border}`,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
    } as React.CSSProperties,

    mobileMetaRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '13px',
      borderBottom: `1px dashed ${colors.border}`,
      paddingBottom: '8px',
    } as React.CSSProperties,
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
    { label: 'Total Pengguna', value: stats.totalUsers, icon: MdPeople, color: '#6366f1', bgColor: theme === 'dark' ? 'rgba(99,102,241,0.15)' : '#eef2ff' },
    { label: 'Admin Logged-in', value: stats.totalAdmins, icon: MdShield, color: '#F4A623', bgColor: theme === 'dark' ? 'rgba(244,166,35,0.15)' : '#fef3c7' },
    { label: 'Total XP Akumulatif', value: stats.totalPoints.toLocaleString(), icon: MdStar, color: '#10b981', bgColor: theme === 'dark' ? 'rgba(16,185,129,0.15)' : '#d1fae5' },
    { label: 'Rata-rata Level Akun', value: stats.averageLevel, icon: MdTrendingUp, color: '#ef4444', bgColor: theme === 'dark' ? 'rgba(239,68,68,0.15)' : '#fee2e2' },
  ];

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>Dashboard Admin</h1>
            <p style={styles.subtitle}>
              Kelola pengguna, kuis, dan materi pembelajaran di BrainQuest
            </p>
          </div>
          <div style={styles.headerRight}>
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              style={styles.themeToggleBtn}
              title="Ganti Tema"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div style={styles.headerBadge}>
              <MdEmojiEvents size={16} style={{ marginRight: '6px' }} color="#F4A623" />
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

        <div style={styles.tabContainer}>
          <button 
            onClick={() => { setActiveTab('users'); setMessage(''); }} 
            style={{ ...styles.tabBtn, ...(activeTab === 'users' ? styles.tabBtnActive : {}) }}
          >
            Manajemen Pengguna
          </button>
          <button 
            onClick={() => { setActiveTab('quiz'); setMessage(''); }} 
            style={{ ...styles.tabBtn, ...(activeTab === 'quiz' ? styles.tabBtnActive : {}) }}
          >
            Manajemen Kuis
          </button>
          <button 
            onClick={() => { setActiveTab('materi'); setMessage(''); }} 
            style={{ ...styles.tabBtn, ...(activeTab === 'materi' ? styles.tabBtnActive : {}) }}
          >
            Manajemen Materi
          </button>
        </div>

        {message && (
          <p style={{ color: '#10b981', fontWeight: 700, marginBottom: '24px' }}>{message}</p>
        )}

        {activeTab === 'users' && (
          <>
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
                  <MdPeople size={20} color="#F4A623" />
                  <h2 style={styles.tableTitle}>Daftar Pengguna</h2>
                </div>
                <span style={styles.tableCount}>{users.length} pengguna</span>
              </div>

              <div style={styles.tableContainer} className="admin-table-desktop">
                {users.length === 0 ? (
                  <div style={styles.emptyState}>
                    <MdPeople size={48} color={colors.subtext} />
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
                      {users.map((item) => (
                        <tr key={item.id} style={styles.tr}>
                          <td style={styles.td}>#{item.id}</td>
                          <td style={styles.td}>
                            <div style={styles.userCell}>
                              {item.profilePicture ? (
                                <img
                                  src={item.profilePicture}
                                  alt={item.username}
                                  style={styles.avatar}
                                />
                              ) : (
                                <div style={styles.avatarPlaceholder}>
                                  {getInitials(item.fullName || item.username)}
                                </div>
                              )}
                              <span style={styles.username}>{item.username}</span>
                            </div>
                          </td>
                          <td style={styles.td}>
                            <div style={styles.emailCell}>
                              <MdMail size={14} color={colors.subtext} />
                              <span>{item.email}</span>
                            </div>
                          </td>
                          <td style={styles.td}>{item.fullName || '-'}</td>
                          <td style={styles.td}>
                            <div style={styles.roleCell}>
                              <span
                                style={{
                                  ...styles.roleBadge,
                                  backgroundColor:
                                    item.role === 'admin'
                                      ? 'rgba(251, 191, 36, 0.15)'
                                      : 'rgba(99, 102, 241, 0.08)',
                                  color:
                                    item.role === 'admin' ? '#b45309' : '#F4A623',
                                }}
                              >
                                {item.role === 'admin' ? (
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
                                onClick={() => handleRoleChange(item.id, item.role)}
                                style={styles.roleToggleButton}
                              >
                                {item.role === 'admin' ? 'Turunkan' : 'Naikkan'}
                              </button>
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.pointsBadge}>
                              <MdStar size={14} color="#f59e0b" style={{ marginRight: '4px' }} />
                              {item.points}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <span style={styles.levelBadge}>
                              <MdWorkspacePremium size={14} color="#F4A623" style={{ marginRight: '4px' }} />
                              Lv.{item.level}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <div style={styles.dateCell}>
                              <MdCalendarToday size={14} color={colors.subtext} />
                              <span style={styles.dateText}>{formatDate(item.createdAt)}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="admin-table-mobile" style={{ display: 'none', padding: '16px' }}>
                {users.map((item) => (
                  <div key={item.id} style={styles.mobileUserCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {item.profilePicture ? (
                        <img src={item.profilePicture} alt={item.username} style={styles.avatar} />
                      ) : (
                        <div style={styles.avatarPlaceholder}>
                          {getInitials(item.fullName || item.username)}
                        </div>
                      )}
                      <div>
                        <h4 style={{ color: colors.text, margin: 0, fontWeight: 700 }}>{item.fullName || item.username}</h4>
                        <span style={{ fontSize: '12px', color: colors.subtext }}>@{item.username}</span>
                      </div>
                    </div>
                    <div style={styles.mobileMetaRow}>
                      <span style={{ color: colors.subtext }}>Email</span>
                      <span style={{ color: colors.text, fontSize: '13px' }}>{item.email}</span>
                    </div>
                    <div style={styles.mobileMetaRow}>
                      <span style={{ color: colors.subtext }}>Poin / Level</span>
                      <span style={{ color: colors.text, fontWeight: 700 }}>{item.points} XP • Lv.{item.level}</span>
                    </div>
                    <div style={styles.mobileMetaRow}>
                      <span style={{ color: colors.subtext }}>Terdaftar</span>
                      <span style={{ color: colors.subtext }}>{formatDate(item.createdAt)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                      <span
                        style={{
                          ...styles.roleBadge,
                          backgroundColor: item.role === 'admin' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(99, 102, 241, 0.08)',
                          color: item.role === 'admin' ? '#b45309' : '#F4A623',
                        }}
                      >
                        {item.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                      <button
                        onClick={() => handleRoleChange(item.id, item.role)}
                        style={styles.roleToggleButton}
                      >
                        {item.role === 'admin' ? 'Turunkan' : 'Naikkan'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {activeTab === 'quiz' && (
          <div style={styles.tableSection}>
            <div style={styles.tableHeader}>
              <div style={styles.tableHeaderLeft}>
                <MdWorkspacePremium size={20} color="#F4A623" />
                <h2 style={styles.tableTitle}>Manajemen Kuis</h2>
              </div>
              {!isAddingQuestion && !editingQuestion && selectedMaterialId && (
                <button 
                  onClick={() => {
                    setIsAddingQuestion(true);
                    setNewQuestionText('');
                    setCurrentOptions(['', '', '']);
                    setCorrectAnswerIndex(0);
                  }} 
                  style={styles.formBtn}
                >
                  <Plus size={16} style={{ marginRight: '6px' }} />
                  Tambah Soal
                </button>
              )}
            </div>

            <div style={{ padding: '24px' }}>
              <label style={{ display: 'block', color: colors.subtext, fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                Pilih Topik Pembelajaran
              </label>
              <select
                value={selectedMaterialId || ''}
                onChange={(e) => { setSelectedMaterialId(Number(e.target.value)); setEditingQuestion(null); setIsAddingQuestion(false); }}
                style={styles.select}
              >
                <option value="" disabled>-- Pilih Topik --</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>{m.category} • {m.title}</option>
                ))}
              </select>

              {selectedMaterialId && !isAddingQuestion && !editingQuestion && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <label style={{ display: 'block', color: colors.subtext, fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                        Batas Jumlah Soal Uji (Batas Quest)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={quizLimit}
                        onChange={(e) => setQuizLimit(Number(e.target.value))}
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <div style={styles.questionList}>
                    <h3 style={{ color: colors.text, fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Daftar Pertanyaan</h3>
                    {questions.length === 0 ? (
                      <p style={{ color: colors.subtext }}>Belum ada soal pada materi ini.</p>
                    ) : (
                      questions.map((q) => (
                        <div key={q.id} style={styles.questionItem}>
                          <div style={{ flex: 1, marginRight: '16px' }}>
                            <p style={{ color: colors.text, fontWeight: 600, margin: '0 0 10px 0' }}>{q.question_text}</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                              {q.options.map((opt, optIdx) => (
                                <span 
                                  key={optIdx} 
                                  style={{ 
                                    fontSize: '13px', 
                                    color: q.correct_answer === opt ? '#10b981' : colors.subtext, 
                                    fontWeight: q.correct_answer === opt ? 700 : 500 
                                  }}
                                >
                                  {String.fromCharCode(65 + optIdx)}. {opt}
                                </span>
                              ))}
                            </div>
                          </div>
                          <button onClick={() => startEditQuestion(q)} style={styles.iconBtn} title="Edit Pertanyaan">
                            <Edit3 size={18} />
                            <span style={{ fontSize: '12px', fontWeight: 600 }}>Edit</span>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {isAddingQuestion && (
                <form onSubmit={handleSaveQuestion}>
                  <h3 style={{ color: colors.text, fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
                    {editingQuestion ? 'Edit Soal Kuis' : 'Tambah Soal Kuis Baru'}
                  </h3>
                  
                  <label style={{ display: 'block', color: colors.subtext, fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Pertanyaan</label>
                  <textarea
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    style={{ ...styles.input, height: '80px', fontFamily: 'inherit', resize: 'vertical' }}
                    required
                  />

                  <label style={{ display: 'block', color: colors.subtext, fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Pilihan Jawaban (Minimal 3)</label>
                  {currentOptions.map((opt, optIdx) => (
                    <div key={optIdx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...currentOptions];
                          updated[optIdx] = e.target.value;
                          setCurrentOptions(updated);
                        }}
                        style={styles.input}
                        placeholder={`Pilihan ${String.fromCharCode(65 + optIdx)}`}
                        required
                      />
                      {currentOptions.length > 3 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = currentOptions.filter((_, i) => i !== optIdx);
                            setCurrentOptions(updated);
                            if (correctAnswerIndex >= updated.length) {
                              setCorrectAnswerIndex(0);
                            }
                          }}
                          style={{ ...styles.cancelBtn, padding: '12px', marginBottom: '12px' }}
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  ))}

                  {currentOptions.length < 4 && (
                    <button
                      type="button"
                      onClick={() => setCurrentOptions([...currentOptions, ''])}
                      style={{ ...styles.cancelBtn, marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Plus size={14} />
                      Tambah Pilihan Jawaban Baru
                    </button>
                  )}

                  <label style={{ display: 'block', color: colors.subtext, fontSize: '12px', fontWeight: 700, marginBottom: '6px', marginTop: '12px' }}>Kunci Jawaban yang Benar</label>
                  <select
                    value={correctAnswerIndex}
                    onChange={(e) => setCorrectAnswerIndex(Number(e.target.value))}
                    style={styles.select}
                    required
                  >
                    {currentOptions.map((opt, optIdx) => (
                      <option key={optIdx} value={optIdx}>
                        Pilihan {String.fromCharCode(65 + optIdx)} ({opt || 'Belum diisi'})
                      </option>
                    ))}
                  </select>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <button 
                      type="button" 
                      onClick={() => { setIsAddingQuestion(false); setEditingQuestion(null); }} 
                      style={styles.cancelBtn}
                    >
                      Batal
                    </button>
                    <button type="submit" style={styles.formBtn}>
                      Simpan Soal
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {activeTab === 'materi' && (
          <div style={styles.tableSection}>
            <div style={styles.tableHeader}>
              <div style={styles.tableHeaderLeft}>
                <BookOpen size={20} color="#F4A623" />
                <h2 style={styles.tableTitle}>Manajemen Materi</h2>
              </div>
              {!isAddingMaterial && !editingMaterial && (
                <button onClick={() => setIsAddingMaterial(true)} style={styles.formBtn}>
                  <Plus size={16} style={{ marginRight: '6px' }} />
                  Tambah Materi
                </button>
              )}
            </div>

            <div style={{ padding: '24px' }}>
              {isAddingMaterial && (
                <form onSubmit={handleCreateMaterial}>
                  <h3 style={{ color: colors.text, fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Tambah Materi Baru</h3>
                  
                  <label style={{ display: 'block', color: colors.subtext, fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Judul Materi</label>
                  <input
                    type="text"
                    value={newMaterial.title}
                    onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                    style={styles.input}
                    required
                  />

                  <label style={{ display: 'block', color: colors.subtext, fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Deskripsi / Konten</label>
                  <textarea
                    value={newMaterial.content}
                    onChange={(e) => setNewMaterial({ ...newMaterial, content: e.target.value })}
                    style={{ ...styles.input, height: '120px', resize: 'vertical', fontFamily: 'inherit' }}
                    required
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', color: colors.subtext, fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Kategori / Topik</label>
                      <select
                        value={newMaterial.category}
                        onChange={(e) => setNewMaterial({ ...newMaterial, category: e.target.value })}
                        style={styles.select}
                      >
                        <option value="Pemrograman">Pemrograman</option>
                        <option value="Matematika">Matematika</option>
                        <option value="Bahasa Inggris">Bahasa Inggris</option>
                        <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                        <option value="Pengetahuan Umum">Pengetahuan Umum</option>
                        <option value="Tools AI">Tools AI</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: colors.subtext, fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Status Akses</label>
                      <select
                        value={newMaterial.status}
                        onChange={(e) => setNewMaterial({ ...newMaterial, status: e.target.value })}
                        style={styles.select}
                      >
                        <option value="Gratis">Gratis</option>
                        <option value="Khusus Member">Khusus Member</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <button type="button" onClick={() => setIsAddingMaterial(false)} style={styles.cancelBtn}>
                      Batal
                    </button>
                    <button type="submit" style={styles.formBtn}>
                      Simpan Materi
                    </button>
                  </div>
                </form>
              )}

              {editingMaterial && (
                <form onSubmit={handleUpdateMaterial}>
                  <h3 style={{ color: colors.text, fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Edit Materi</h3>
                  
                  <label style={{ display: 'block', color: colors.subtext, fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Judul Materi</label>
                  <input
                    type="text"
                    value={editingMaterial.title}
                    onChange={(e) => setEditingMaterial({ ...editingMaterial, title: e.target.value })}
                    style={styles.input}
                    required
                  />

                  <label style={{ display: 'block', color: colors.subtext, fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Deskripsi / Konten</label>
                  <textarea
                    value={editingMaterial.content}
                    onChange={(e) => setEditingMaterial({ ...editingMaterial, content: e.target.value })}
                    style={{ ...styles.input, height: '120px', resize: 'vertical', fontFamily: 'inherit' }}
                    required
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', color: colors.subtext, fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Kategori / Topik</label>
                      <select
                        value={editingMaterial.category}
                        onChange={(e) => setEditingMaterial({ ...editingMaterial, category: e.target.value })}
                        style={styles.select}
                      >
                        <option value="Pemrograman">Pemrograman</option>
                        <option value="Matematika">Matematika</option>
                        <option value="Bahasa Inggris">Bahasa Inggris</option>
                        <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                        <option value="Pengetahuan Umum">Pengetahuan Umum</option>
                        <option value="Tools AI">Tools AI</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: colors.subtext, fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Status Akses</label>
                      <select
                        value={editingMaterial.status}
                        onChange={(e) => setEditingMaterial({ ...editingMaterial, status: e.target.value })}
                        style={styles.select}
                      >
                        <option value="Gratis">Gratis</option>
                        <option value="Khusus Member">Khusus Member</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <button type="button" onClick={() => setEditingMaterial(null)} style={styles.cancelBtn}>
                      Batal
                    </button>
                    <button type="submit" style={styles.formBtn}>
                      Simpan Perubahan
                    </button>
                  </div>
                </form>
              )}

              {!isAddingMaterial && !editingMaterial && (
                <div style={styles.questionList}>
                  {materials.length === 0 ? (
                    <p style={{ color: colors.subtext }}>Belum ada materi pembelajaran terdaftar.</p>
                  ) : (
                    materials.map((m) => (
                      <div key={m.id} style={styles.questionItem}>
                        <div style={{ flex: 1, marginRight: '16px' }}>
                          <p style={{ color: colors.text, fontWeight: 700, margin: '0 0 4px 0', fontSize: '16px' }}>{m.title}</p>
                          <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '100px', backgroundColor: 'rgba(244, 166, 35, 0.1)', color: '#F4A623', fontWeight: 700 }}>
                            {m.category}
                          </span>
                          <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '100px', backgroundColor: colors.background, color: colors.subtext, fontWeight: 600, marginLeft: '8px' }}>
                            {m.status}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => setEditingMaterial(m)} style={styles.iconBtn} title="Edit Materi">
                            <Edit3 size={18} />
                            <span style={{ fontSize: '12px', fontWeight: 600 }}>Edit</span>
                          </button>
                          <button onClick={() => handleDeleteMaterial(m.id)} style={{ ...styles.iconBtn, color: '#ef4444' }} title="Hapus Materi">
                            <Trash2 size={18} />
                            <span style={{ fontSize: '12px', fontWeight: 600 }}>Hapus</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -800px 0; }
          100% { background-position: 800px 0; }
        }
        @media (max-width: 968px) {
          .admin-table-desktop {
            display: none !important;
          }
          .admin-table-mobile {
            display: flex !important;
            flex-direction: column;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
}

export default AdminPage;