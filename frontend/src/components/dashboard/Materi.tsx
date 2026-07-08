import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../lib/useAuth';
import { useTheme } from '../../lib/ThemeContext';
import { apiService } from '../../lib/apiService';

interface MateriItem {
  id: number;
  title: string;
  content: string;
  category: string;
  progress: number;
}

interface MateriData {
  id: number;
  title: string;
  content: string;
  category: string;
  parent_id?: number | null;
}

interface ArenaProgressItem {
  lessonId: string;
  levelId: number;
  completed: boolean;
}

export default function Materi() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { theme, colors } = useTheme();
  const [materiList, setMateriList] = useState<MateriItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.getMaterials(1, 100);
      const materials: MateriData[] = response?.materials || [];

      const parentMaterials = materials.filter(
        (m) => m.parent_id === null || m.parent_id === undefined
      );

      let progressItems: ArenaProgressItem[] = [];
      if (token) {
        try {
          const progressResponse = await apiService.getArenaProgress(token);
          progressItems = progressResponse?.progress || [];
        } catch {
          progressItems = [];
        }
      }

      const mapped = parentMaterials.map((m) => {
        const children = materials.filter((c) => c.parent_id === m.id);
        const totalLevels = children.length + 1;
        const lessonIdStr = String(m.id);
        const completedLevels = progressItems.filter(
          (p) =>
            p.lessonId === lessonIdStr &&
            p.completed &&
            p.levelId >= 1 &&
            p.levelId <= totalLevels
        ).length;
        const progress = totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0;

        return {
          id: m.id,
          title: m.title,
          content: m.content || 'Belum ada deskripsi',
          category: m.category || 'Umum',
          progress,
        };
      });

      setMateriList(mapped);
    } catch (err) {
      console.error(err);
      setMateriList([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  useEffect(() => {
    (window as any).refreshArenaProgress = fetchMaterials;

    const handleStorageSync = (e: StorageEvent) => {
      if (e.key === 'arenaRefresh') {
        fetchMaterials();
      }
    };
    window.addEventListener('storage', handleStorageSync);

    return () => {
      if ((window as any).refreshArenaProgress === fetchMaterials) {
        delete (window as any).refreshArenaProgress;
      }
      window.removeEventListener('storage', handleStorageSync);
    };
  }, [fetchMaterials]);

  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const getInitials = (title: string) => {
    return title
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getCategoryColor = (category: string) => {
    const categoryColors: { [key: string]: string } = {
      'Matematika': '#6366f1',
      'Pemrograman': '#f59e0b',
      'Bahasa Inggris': '#10b981',
      'Bahasa Indonesia': '#ef4444',
      'Pengetahuan Umum': '#8b5cf6',
      'Sains': '#06b6d4',
      'Fisika': '#3b82f6',
      'Kimia': '#8b5cf6',
      'Biologi': '#10b981',
    };
    return categoryColors[category] || '#94a3b8';
  };

  const dynamicStyles = {
    header: {
      marginBottom: '24px',
    } as React.CSSProperties,

    headerTitle: {
      fontSize: '24px',
      fontWeight: 800,
      color: colors.text,
      margin: '0 0 8px 0',
    } as React.CSSProperties,

    headerSub: {
      color: colors.subtext,
      margin: 0,
    } as React.CSSProperties,

    cardsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '20px',
    } as React.CSSProperties,

    cardWrapper: {
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      borderRadius: '20px',
      background: 'linear-gradient(145deg, #f59e0b, #d97706)',
      padding: '2px',
      position: 'relative' as const,
    } as React.CSSProperties,

    cardInner: {
      background: colors.surface,
      borderRadius: '18px',
      height: '100%',
      transition: 'all 0.3s ease',
      overflow: 'hidden',
    } as React.CSSProperties,

    cardContent: {
      padding: '20px',
      display: 'flex',
      flexDirection: 'column' as const,
      height: '100%',
      minHeight: '260px',
    } as React.CSSProperties,

    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '10px',
    } as React.CSSProperties,

    iconBox: {
      width: '40px',
      height: '40px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: 700,
      flexShrink: 0,
    } as React.CSSProperties,

    cardTitle: {
      fontSize: '15px',
      fontWeight: 700,
      color: colors.text,
      margin: '0 0 4px 0',
      lineHeight: 1.3,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical' as const,
      overflow: 'hidden',
    } as React.CSSProperties,

    cardDesc: {
      fontSize: '12px',
      color: colors.subtext,
      margin: '0 0 14px 0',
      lineHeight: 1.5,
      flex: 1,
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical' as const,
      overflow: 'hidden',
    } as React.CSSProperties,

    cardFooter: {
      marginTop: 'auto',
    } as React.CSSProperties,

    progressHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '11px',
      fontWeight: 600,
      color: colors.subtext,
      marginBottom: '4px',
    } as React.CSSProperties,

    progressLabel: {
      color: colors.text,
    } as React.CSSProperties,

    progressValue: {
      color: '#F4A623',
    } as React.CSSProperties,

    progressBar: {
      height: '5px',
      backgroundColor: colors.border,
      borderRadius: '100px',
      overflow: 'hidden',
      marginBottom: '12px',
    } as React.CSSProperties,

    progressFill: {
      height: '100%',
      borderRadius: '100px',
      transition: 'width 0.6s ease',
    } as React.CSSProperties,

    cardButton: {
      width: '100%',
      padding: '9px 0',
      backgroundColor: colors.background,
      color: colors.text,
      border: 'none',
      borderRadius: '10px',
      fontSize: '12px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontFamily: 'inherit',
    } as React.CSSProperties,

    completedBadge: {
      fontSize: '10px',
      fontWeight: 700,
      backgroundColor: theme === 'dark' ? '#064e3b' : '#ecfdf5',
      color: '#10b981',
      padding: '3px 10px',
      borderRadius: '100px',
    } as React.CSSProperties,

    emptyContainer: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 24px',
      backgroundColor: colors.surface,
      borderRadius: '24px',
      border: `1px solid ${colors.border}`,
      textAlign: 'center' as const,
    } as React.CSSProperties,

    emptyIcon: {
      fontSize: '56px',
      marginBottom: '16px',
    } as React.CSSProperties,

    emptyTitle: {
      fontSize: '20px',
      fontWeight: 700,
      color: colors.text,
      margin: '0 0 8px 0',
    } as React.CSSProperties,

    emptyDesc: {
      fontSize: '15px',
      color: colors.subtext,
      margin: '0 0 24px 0',
      maxWidth: '400px',
    } as React.CSSProperties,

    pilihButton: {
      cursor: 'pointer',
      position: 'relative' as const,
      padding: '12px 32px',
      fontSize: '16px',
      color: '#F4A623',
      border: '2px solid #F4A623',
      borderRadius: '34px',
      backgroundColor: 'transparent',
      fontWeight: 700,
      transition: 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)',
      overflow: 'hidden',
      fontFamily: 'inherit',
    } as React.CSSProperties,

    skeletonCard: {
      backgroundColor: colors.surface,
      borderRadius: '20px',
      overflow: 'hidden',
      border: `1px solid ${colors.border}`,
    } as React.CSSProperties,

    skeletonImage: {
      height: '120px',
      backgroundColor: colors.background,
    } as React.CSSProperties,

    skeletonBody: {
      padding: '16px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
    } as React.CSSProperties,

    skeletonLine: {
      height: '14px',
      backgroundColor: colors.background,
      borderRadius: '4px',
      width: '60%',
    } as React.CSSProperties,
  };

  if (loading) {
    return (
      <div>
        <header style={dynamicStyles.header}>
          <h2 style={dynamicStyles.headerTitle}>Materi Belajar</h2>
          <p style={dynamicStyles.headerSub}>Memuat materi...</p>
        </header>
        <div style={dynamicStyles.cardsGrid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={dynamicStyles.skeletonCard}>
              <div style={dynamicStyles.skeletonImage} />
              <div style={dynamicStyles.skeletonBody}>
                <div style={dynamicStyles.skeletonLine} />
                <div style={{ ...dynamicStyles.skeletonLine, width: '80%' }} />
                <div style={{ ...dynamicStyles.skeletonLine, width: '40%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (materiList.length === 0) {
    return (
      <div>
        <header style={dynamicStyles.header}>
          <h2 style={dynamicStyles.headerTitle}>Materi Belajar</h2>
          <p style={dynamicStyles.headerSub}>Belum ada materi yang tersedia untukmu.</p>
        </header>
        <div style={dynamicStyles.emptyContainer}>
          <span style={dynamicStyles.emptyIcon}><BookOpen size={48} color="#6366f1" /></span>
          <h3 style={dynamicStyles.emptyTitle}>Belum Ada Materi</h3>
          <p style={dynamicStyles.emptyDesc}>Kamu belum memulai materi apapun. Pilih materi dari daftar yang tersedia untuk memulai petualangan belajarmu!</p>
          <button 
            onClick={() => navigate('/materi')}
            style={dynamicStyles.pilihButton}
            className="tombol-pilih-materi"
          >
            Pilih Materi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header style={dynamicStyles.header}>
        <h2 style={dynamicStyles.headerTitle}>Materi Belajar</h2>
        <p style={dynamicStyles.headerSub}>Pilih materi untuk melanjutkan petualangan belajarmu hari ini.</p>
      </header>

      <section style={dynamicStyles.cardsGrid}>
        {materiList.slice(0, 6).map((materi) => (
          <div 
            key={materi.id} 
            style={dynamicStyles.cardWrapper}
            className="materi-card"
            onClick={() => navigate(`/materi/${materi.id}`)}
          >
            <div style={dynamicStyles.cardInner}>
              <div style={dynamicStyles.cardContent}>
                <div style={dynamicStyles.cardHeader}>
                  <div style={{ 
                    ...dynamicStyles.iconBox, 
                    backgroundColor: `${getCategoryColor(materi.category)}15`,
                    color: getCategoryColor(materi.category),
                  }}>
                    {getInitials(materi.title)}
                  </div>
                  {materi.progress === 100 && (
                    <span style={dynamicStyles.completedBadge}><CheckCircle2 size={14} style={{ marginRight: '4px' }} /> Selesai</span>
                  )}
                </div>
                
                <h3 style={dynamicStyles.cardTitle}>{materi.title}</h3>
                <p style={dynamicStyles.cardDesc}>{truncateText(materi.content, 55)}</p>
                
                <div style={dynamicStyles.cardFooter}>
                  <div style={dynamicStyles.progressHeader}>
                    <span style={dynamicStyles.progressLabel}>Progres</span>
                    <span style={dynamicStyles.progressValue}>{materi.progress}%</span>
                  </div>
                  <div style={dynamicStyles.progressBar}>
                    <div style={{ 
                      ...dynamicStyles.progressFill, 
                      width: `${materi.progress}%`,
                      backgroundColor: materi.progress === 100 ? '#10b981' : '#F4A623'
                    }} />
                  </div>
                </div>

                <button 
                  style={dynamicStyles.cardButton}
                  className="tombol-efek-ringan"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/materi/${materi.id}`);
                  }}
                >
                  {materi.progress === 0 ? 'Mulai Belajar' : materi.progress === 100 ? 'Ulas Ulang' : 'Lanjutkan'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>

      <style>{`
        .materi-card {
          cursor: pointer;
          transition: all 0.3s ease;
          border-radius: 20px;
          background: linear-gradient(145deg, #f59e0b, #d97706);
          padding: 2px;
          position: relative;
        }

        .materi-card:hover {
          transform: translateY(-6px);
          box-shadow: 0px 0px 30px 1px rgba(244, 166, 35, 0.25);
        }

        .materi-card .card-inner {
          background: ${colors.surface};
          border-radius: 18px;
          height: 100%;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .materi-card:hover .card-inner {
          background: ${theme === 'dark' ? colors.background : '#fafafa'};
        }

        .card-content {
          padding: 20px;
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 260px;
        }

        .card-header {
          display: flex;
          justifyContent: space-between;
          alignItems: flex-start;
          margin-bottom: 10px;
        }

        .icon-box {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          alignItems: center;
          justifyContent: center;
          font-size: 14px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .card-title {
          font-size: 15px;
          font-weight: 700;
          color: ${colors.text};
          margin: 0 0 4px 0;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-desc {
          font-size: 12px;
          color: ${colors.subtext};
          margin: 0 0 14px 0;
          line-height: 1.5;
          flex: 1;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-footer {
          margin-top: auto;
        }

        .progress-header {
          display: flex;
          justifyContent: space-between;
          font-size: 11px;
          font-weight: 600;
          color: ${colors.subtext};
          margin-bottom: 4px;
        }

        .progress-label {
          color: ${colors.text};
        }

        .progress-value {
          color: #F4A623;
        }

        .progress-bar {
          height: 5px;
          background-color: ${colors.border};
          border-radius: 100px;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .progress-fill {
          height: 100%;
          border-radius: 100px;
          transition: width 0.6s ease;
        }

        .card-button {
          width: 100%;
          padding: 9px 0;
          background-color: ${colors.background};
          color: ${colors.text};
          border: none;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .card-button:hover {
          background-color: #F4A623;
          color: #ffffff;
        }

        .completed-badge {
          font-size: 10px;
          font-weight: 700;
          background-color: ${theme === 'dark' ? '#064e3b' : '#ecfdf5'};
          color: #10b981;
          padding: 3px 10px;
          border-radius: 100px;
        }

        .tombol-pilih-materi {
          cursor: pointer;
          position: relative;
          padding: 12px 32px;
          font-size: 16px;
          color: #F4A623;
          border: 2px solid #F4A623;
          border-radius: 34px;
          background-color: transparent;
          font-weight: 700;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.320, 1);
          overflow: hidden;
          font-family: inherit;
        }

        .tombol-pilih-materi::before {
          content: '';
          position: absolute;
          inset: 0;
          margin: auto;
          width: 50px;
          height: 50px;
          border-radius: inherit;
          scale: 0;
          z-index: -1;
          background-color: #F4A623;
          transition: all 0.6s cubic-bezier(0.23, 1, 0.320, 1);
        }

        .tombol-pilih-materi:hover::before {
          scale: 3;
        }

        .tombol-pilih-materi:hover {
          color: #ffffff;
          scale: 1.05;
          box-shadow: 0 0px 20px rgba(244, 166, 35, 0.4);
        }

        .tombol-pilih-materi:active {
          scale: 1;
        }

        @media (max-width: 768px) {
          .card-content {
            min-height: 220px;
            padding: 16px;
          }
          .card-title {
            font-size: 14px;
          }
          .card-desc {
            font-size: 11px;
          }
          .empty-title {
            font-size: 18px;
          }
          .tombol-pilih-materi {
            padding: 10px 24px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}