import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Sparkles, Trophy, BookOpen, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { apiService } from '../lib/apiService';
import logo from '../assets/warnalogo.png';
import Materi from '../components/dashboard/Materi';
import ArenaKuis from '../components/dashboard/ArenaKuis';
import Leaderboard from '../components/dashboard/LeaderBoard';
import Pengaturan from '../components/dashboard/Pengaturan';

interface QuizHistory {
  id: number;
  material_id: number;
  material_title?: string;
  category?: string;
  score: number;
  total_questions: number;
  time_spent: number;
  completed_at: string;
}

interface MateriData {
  id: number;
  title: string;
  category: string;
  parent_id?: number | null;
}

function DashboardPage() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('ringkasan');
  const [sidebarBuka, setSidebarBuka] = useState(false);
  const { user, token, logout } = useAuth();
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);
  const [allMaterials, setAllMaterials] = useState<MateriData[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [recommendedMaterials, setRecommendedMaterials] = useState<MateriData[]>([]);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setLoadingHistory(false);
        return;
      }

      try {
        const materialsResponse = await apiService.getMaterials(1, 100);
        const materials = materialsResponse?.materials || [];
        setAllMaterials(materials);

        const parentMaterials = materials.filter((m: MateriData) => m.parent_id === null || m.parent_id === undefined);
        setRecommendedMaterials(parentMaterials.slice(0, 2));

        const historyResponse = await apiService.getQuizHistory(token, 10, 0);
        let historyData: QuizHistory[] = [];

        if (historyResponse && historyResponse.records) {
          historyData = historyResponse.records;
        } else if (historyResponse && historyResponse.history) {
          historyData = historyResponse.history;
        } else if (Array.isArray(historyResponse)) {
          historyData = historyResponse;
        }

        const enrichedHistory = historyData.map((quiz) => {
          const material = materials.find((m: MateriData) => m.id === quiz.material_id);
          return {
            ...quiz,
            material_title: material?.title || `Materi #${quiz.material_id}`,
            category: material?.category || 'Umum',
          };
        });

        const filteredHistory = enrichedHistory.filter((quiz) => {
          return materials.some((m: MateriData) => m.id === quiz.material_id);
        });

        setQuizHistory(filteredHistory);
      } catch (err) {
        console.error('Error fetching data:', err);
        setQuizHistory([]);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchData();
  }, [token]);

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

  const displayUser = user
    ? {
        nama: user.fullName,
        email: user.email,
        level: user.level,
        xp: user.points,
        xpMax: Math.max(100, user.level * 400),
        streak: 5,
        rank: Math.max(1, 20 - user.level),
        questSelesai: Math.min(quizHistory.length, 5),
        questTotal: 5,
        role: user.role,
      }
    : {
        nama: 'Pengguna',
        email: '',
        level: 1,
        xp: 0,
        xpMax: 400,
        streak: 0,
        rank: 0,
        questSelesai: 0,
        questTotal: 5,
        role: 'user',
      };

  const menuItems = [
    { id: 'ringkasan', label: 'Ringkasan', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    ...(isAdmin ? [{ id: 'admin-panel', label: 'Panel Admin', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' }] : []),
    { id: 'materi', label: 'Materi Belajar', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { id: 'kuis', label: 'Arena Kuis', icon: 'M9.663 17h4.673M12 3v1m6.364 .364l-.707 .707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
    { id: 'leaderboard', label: 'Leaderboard', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'settings', label: 'Pengaturan', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diff < 60) return 'Baru saja';
      if (diff < 3600) return `${Math.floor(diff / 60)} menit yang lalu`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} jam yang lalu`;
      if (diff < 172800) return 'Kemarin';
      if (diff < 604800) return `${Math.floor(diff / 86400)} hari yang lalu`;
      
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getParentMaterials = () => {
    return allMaterials.filter((m) => m.parent_id === null || m.parent_id === undefined);
  };

  return (
    <div style={gaya.dashboardContainer}>
      
      {sidebarBuka && (
        <div 
          style={gaya.mobileOverlay} 
          onClick={() => setSidebarBuka(false)}
          aria-hidden="true"
        />
      )}

      <aside style={gaya.sidebar} className="sidebar-element" aria-label="Sidebar Navigasi">
        <header style={gaya.sidebarHeader}>
          <div style={gaya.sidebarLogoFrame} className="sidebar-logo-frame-brainquest">
            <img src={logo} alt="Logo Utama BrainQuest" style={gaya.sidebarLogo} />
          </div>
          <h2 style={gaya.sidebarTitle}>BrainQuest</h2>
        </header>

        <nav style={gaya.sidebarNav} aria-label="Menu Utama">
          <ul style={gaya.navList}>
            {menuItems.map((item) => {
              const isActive = activeMenu === item.id;
              return (
                <li key={item.id} style={gaya.navListItem}>
                  <button 
                    onClick={() => {
                      setActiveMenu(item.id);
                      setSidebarBuka(false);
                    }}
                    style={{
                      ...gaya.navItem,
                      ...(isActive ? gaya.navItemActive : {}),
                    }}
                    className="tombol-menu-sidebar"
                    aria-current={isActive ? "page" : undefined}
                  >
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      style={{ marginRight: '14px', flexShrink: 0 }}
                      aria-hidden="true"
                    >
                      <path d={item.icon} />
                    </svg>
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <footer style={gaya.sidebarFooter}>
          <button 
            onClick={() => navigate('/')}
            style={gaya.btnLogout}
            aria-label="Keluar menuju Beranda"
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{ marginRight: '14px' }}
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Keluar Beranda
          </button>
          <button 
            onClick={handleLogout}
            style={gaya.btnLogout}
            aria-label="Logout"
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{ marginRight: '14px' }}
              aria-hidden="true"
            >
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </footer>
      </aside>

      <main style={gaya.mainContent}>
        
        <header style={gaya.headerBar} className="header-bar">
          <div style={gaya.headerKiri}>
            <button 
              onClick={() => setSidebarBuka(true)} 
              style={gaya.btnHamburger}
              className="btn-hamburger-mobile"
              aria-label="Buka Menu Navigasi"
              aria-expanded={sidebarBuka}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <h1 style={gaya.headerGreeting} className="header-greeting">Halo, {displayUser.nama}! {isAdmin ? <Sparkles size={24} style={{ marginLeft: '6px', display: 'inline-block' }} /> : <Sparkles size={24} style={{ marginLeft: '6px', display: 'inline-block' }} />}</h1>
          </div>
          
          <div style={gaya.headerKanan}>
            <div style={gaya.statsIconGroup} className="stats-group" aria-label="Statistik Pengguna">
              <span style={gaya.statBadge} title={`${displayUser.streak} Hari Streak`}>
                <span aria-hidden="true"><Flame size={16} color="#f97316" /></span> {displayUser.streak}<span className="stat-teks"> Hari Streak</span>
              </span>
              <span style={gaya.statBadgeAmber} title={`Peringkat ${displayUser.rank}`}>
                <span aria-hidden="true"><Trophy size={16} color="#f59e0b" /></span> Peringkat <span className="stat-teks">#{displayUser.rank}</span>
              </span>
            </div>
            
            <div style={gaya.profilInfo}>
              <div style={gaya.avatarMini} aria-label={`Profil ${displayUser.nama}`}>
                {displayUser.nama.substring(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div style={gaya.contentBody} className="content-body">
            {activeMenu === 'admin-panel' ? (
              <div style={gaya.contentBody}>
                <section style={gaya.bannerInfo} className="banner-info" aria-labelledby="banner-judul-admin">
                  <div style={gaya.bannerTeks}>
                    <h2 id="banner-judul-admin" style={gaya.bannerJudul}>Mode Admin Aktif</h2>
                    <p style={gaya.bannerSubjudul}>Kelola pengguna, pantau progres, dan atur konten dari panel admin.</p>
                  </div>
                  <button onClick={() => navigate('/admin')} style={gaya.btnBannerCta} className="btn-banner">
                    Buka Panel Admin
                  </button>
                </section>
              </div>
            ) : activeMenu === 'materi' ? (
              <Materi />
            ) : activeMenu === 'kuis' ? (
              <ArenaKuis />
            ) : activeMenu === 'leaderboard' ? (
              <Leaderboard />
            ) : activeMenu === 'settings' ? (
              <Pengaturan />
            ) : (
              <>
                {isAdmin ? (
                  <section style={gaya.bannerInfo} className="banner-info" aria-labelledby="banner-judul">
                    <div style={gaya.bannerTeks}>
                      <h2 id="banner-judul" style={gaya.bannerJudul}>Dashboard Admin</h2>
                      <p style={gaya.bannerSubjudul}>Anda melihat mode khusus untuk mengelola pengguna, konten, dan perkembangan belajar.</p>
                    </div>
                    <button onClick={() => navigate('/admin')} style={gaya.btnBannerCta} className="btn-banner">
                      Buka Panel Admin
                    </button>
                  </section>
                ) : (
                  <section style={gaya.bannerInfo} className="banner-info" aria-labelledby="banner-judul">
                    <div style={gaya.bannerTeks}>
                      <h2 id="banner-judul" style={gaya.bannerJudul}>Petualangan Belajarmu Baru Saja Dimulai!</h2>
                      <p style={gaya.bannerSubjudul}>Selesaikan quest harianmu untuk mengklaim bonus XP dan mempertahankan streak belajarmu.</p>
                    </div>
                    <button onClick={() => navigate('/kuis')} style={gaya.btnBannerCta} className="btn-banner">
                      Mulai Kuis Sekarang
                    </button>
                  </section>
                )}

                <section style={gaya.cardsGrid} className="dashboard-cards-grid" aria-label="Informasi Progres Belajar">
                  <article style={gaya.kartuUtama} className="kartu">
                    <h3 style={gaya.kartuJudul}>Progres Level & XP</h3>
                    <div style={gaya.levelWrapper}>
                      <span style={gaya.levelBadge}>LEVEL {displayUser.level}</span>
                      <span style={gaya.levelXp}>{displayUser.xp} / {displayUser.xpMax} XP</span>
                    </div>
                    <div style={gaya.progressBarBg} aria-hidden="true">
                      <div style={{ ...gaya.progressBarFill, width: `${(displayUser.xp / displayUser.xpMax) * 100}%` }}></div>
                    </div>
                    <p style={gaya.xpInfo}>Dapatkan {displayUser.xpMax - displayUser.xp} XP lagi untuk naik ke Level {displayUser.level + 1}!</p>
                  </article>

                  <article style={gaya.kartuUtama} className="kartu">
                    <h3 style={gaya.kartuJudul}>Quest Harian</h3>
                    <div style={gaya.questHeader}>
                      <span style={gaya.questProgressTeks}>{displayUser.questSelesai} dari {displayUser.questTotal} Quest Selesai</span>
                      <span style={gaya.questPersen}>{Math.round((displayUser.questSelesai / displayUser.questTotal) * 100)}%</span>
                    </div>
                    <div style={gaya.progressBarBg} aria-hidden="true">
                      <div style={{ ...gaya.progressBarFill, width: `${(displayUser.questSelesai / displayUser.questTotal) * 100}%` }}></div>
                    </div>
                    <ul style={gaya.questList}>
                      <li style={gaya.questItem}>
                        <span style={gaya.questCheckSelesai} aria-hidden="true"><CheckCircle2 size={16} /></span>
                        <span style={gaya.questItemTeksSelesai}>Kerjakan kuis harian Matematika (+50 XP)</span>
                      </li>
                      <li style={gaya.questItem}>
                        <span style={gaya.questCheckSelesai} aria-hidden="true"><CheckCircle2 size={16} /></span>
                        <span style={gaya.questItemTeksSelesai}>Baca 1 artikel materi baru (+30 XP)</span>
                      </li>
                      <li style={gaya.questItem}>
                        <span style={gaya.questCheckBelum} aria-hidden="true"><Sparkles size={16} /></span>
                        <span style={gaya.questItemTeksBelum}>Capai akurasi 100% pada satu kuis (+100 XP)</span>
                      </li>
                    </ul>
                  </article>

                  <article style={gaya.kartuUtama} className="kartu">
                    <h3 style={gaya.kartuJudul}>Rekomendasi Materi</h3>
                    <div style={gaya.rekomendasiList}>
                      {recommendedMaterials.length > 0 ? (
                        recommendedMaterials.map((mat, i) => (
                          <div 
                            key={i} 
                            style={gaya.rekomendasiItem}
                            className="rekomendasi-item-clickable"
                            onClick={() => navigate(`/materi/${mat.id}`)}
                          >
                            <div style={gaya.rekomendasiInfo}>
                              <h4 style={gaya.rekomendasiItemJudul} className="rekomendasi-judul">{mat.title}</h4>
                              <p style={gaya.rekomendasiItemSub}>{mat.category}</p>
                            </div>
                            <div style={gaya.rekomendasiArrow} className="rekomendasi-arrow">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"/>
                                <polyline points="12 5 19 12 12 19"/>
                              </svg>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p style={{ fontSize: '14px', color: '#94a3b8', textAlign: 'center' }}>
                          Belum ada materi tersedia
                        </p>
                      )}
                    </div>
                  </article>
                </section>

                <section style={gaya.sectionBawah} aria-labelledby="riwayat-judul">
                  <article style={gaya.kartuLebar} className="kartu">
                    <h3 id="riwayat-judul" style={gaya.kartuJudul}>
                      {quizHistory.length > 0 ? 'Riwayat Kuis Terakhir' : 'Rekomendasi Materi'}
                    </h3>
                    
                    {loadingHistory ? (
                      <p style={gaya.kosongText}>Memuat data...</p>
                    ) : quizHistory.length > 0 ? (
                      <div style={gaya.riwayatWrapper}>
                        {quizHistory.slice(0, 5).map((quiz, i) => {
                          const score = quiz.score || 0;
                          const total = quiz.total_questions || 0;
                          const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
                          
                          return (
                            <div key={i} style={gaya.riwayatItem} className="riwayat-item">
                              <div style={gaya.riwayatInfoKiri}>
                                <div style={gaya.ikonBukuKecil} aria-hidden="true"><BookOpen size={18} color="#6366f1" /></div>
                                <div>
                                  <h4 style={gaya.riwayatJudulTeks}>
                                    {quiz.material_title || `Kuis #${quiz.material_id}`}
                                  </h4>
                                  <p style={gaya.riwayatKategori}>
                                    {quiz.category || 'Umum'} • {formatDate(quiz.completed_at)}
                                  </p>
                                </div>
                              </div>
                              <div style={gaya.riwayatInfoKanan}>
                                <span style={{
                                  ...gaya.skorBadge,
                                  backgroundColor: percentage >= 80 ? '#ecfdf5' : percentage >= 50 ? '#fef3c7' : '#fef2f2',
                                  color: percentage >= 80 ? '#10b981' : percentage >= 50 ? '#d97706' : '#dc2626',
                                }}>
                                  {percentage}% ({score}/{total})
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : getParentMaterials().length > 0 ? (
                      <div style={gaya.riwayatWrapper}>
                        {getParentMaterials().slice(0, 5).map((mat) => (
                          <div key={mat.id} style={gaya.riwayatItem} className="riwayat-item">
                            <div style={gaya.riwayatInfoKiri}>
                              <div style={gaya.ikonBukuKecil} aria-hidden="true"><BookOpen size={18} color="#6366f1" /></div>
                              <div>
                                <h4 style={gaya.riwayatJudulTeks}>{mat.title}</h4>
                                <p style={gaya.riwayatKategori}>{mat.category} • Belum Dikerjakan</p>
                              </div>
                            </div>
                            <div style={gaya.riwayatInfoKanan}>
                              <button 
                                onClick={() => navigate(`/kuis/${mat.id}`)}
                                className="tombol-mulai-kuis-underline"
                              >
                                <svg className="tombol-kuis-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polygon points="5 3 19 12 5 21 5 3"/>
                                </svg>
                                <span className="tombol-kuis-teks">Mulai Kuis</span>
                                <span className="tombol-kuis-garis"></span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={gaya.kosongContainer}>
                        <span style={gaya.kosongIcon}><Sparkles size={32} color="#a855f7" /></span>
                        <p style={gaya.kosongText}>Belum ada materi tersedia</p>
                      </div>
                    )}
                  </article>
                </section>
              </>
            )}
        </div>
      </main>

      <style>{`
        .sidebar-element {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-hamburger-mobile {
          display: none !important;
        }
        @media (max-width: 1024px) {
          .dashboard-cards-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 968px) {
          .sidebar-element {
            position: fixed !important;
            z-index: 1020 !important;
            top: 0 !important;
            bottom: 0 !important;
            height: 100% !important;
            transform: ${sidebarBuka ? 'translateX(0)' : 'translateX(-100%)'} !important;
          }
          .btn-hamburger-mobile {
            display: flex !important;
          }
          main {
            padding-left: 0 !important;
          }
        }
        @media (max-width: 768px) {
          .dashboard-cards-grid {
            grid-template-columns: 1fr !important;
          }
          .header-bar {
            padding: 0 16px !important;
          }
          .header-greeting {
            font-size: 18px !important;
          }
          .content-body {
            padding: 16px !important;
            gap: 16px !important;
          }
          .banner-info {
            padding: 24px 20px !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 20px !important;
          }
          .btn-banner {
            width: 100% !important;
            padding: 12px !important;
          }
          .kartu {
            padding: 20px !important;
          }
          .riwayat-item {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
        }
        @media (max-width: 480px) {
          .stat-teks {
            display: none !important;
          }
          .stats-group {
            gap: 8px !important;
          }
          .header-greeting {
            display: none !important;
          }
          .sidebar-logo-frame-brainquest {
            width: 76px !important;
            height: 76px !important;
          }
          .rekomendasi-item {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .rekomendasi-actions {
            justify-content: stretch !important;
          }
          .rekomendasi-actions button {
            flex: 1 !important;
            justify-content: center !important;
          }
        }

        .rekomendasi-item-clickable {
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .rekomendasi-item-clickable:hover {
          background-color: #ffffff !important;
          border-color: #F4A623 !important;
          box-shadow: 0 4px 16px rgba(244, 166, 35, 0.12) !important;
          transform: translateY(-2px);
        }
        .rekomendasi-item-clickable:hover .rekomendasi-arrow {
          color: #F4A623 !important;
          transform: translateX(4px);
        }
        .rekomendasi-item-clickable:hover .rekomendasi-judul {
          color: #F4A623 !important;
        }

        /* ===== TOMBOL MULAI KUIS UNDERLINE ===== */
        .tombol-mulai-kuis-underline {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 8px 0;
          font-family: inherit;
        }

        .tombol-mulai-kuis-underline .tombol-kuis-teks {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #475569;
          position: relative;
          transition: color 0.3s ease;
        }

        .tombol-mulai-kuis-underline .tombol-kuis-teks::before {
          position: absolute;
          content: "Mulai Kuis";
          width: 0%;
          inset: 0;
          color: #F4A623;
          overflow: hidden;
          transition: width 0.3s ease-out;
        }

        .tombol-mulai-kuis-underline .tombol-kuis-garis {
          position: absolute;
          width: 0;
          left: 0;
          bottom: -4px;
          background-color: #F4A623;
          height: 2px;
          transition: width 0.3s ease-out;
        }

        .tombol-mulai-kuis-underline .tombol-kuis-icon {
          color: #475569;
          transition: all 0.3s ease;
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }

        .tombol-mulai-kuis-underline:hover .tombol-kuis-garis {
          width: 100%;
        }

        .tombol-mulai-kuis-underline:hover .tombol-kuis-teks::before {
          width: 100%;
        }

        .tombol-mulai-kuis-underline:hover .tombol-kuis-icon {
          color: #F4A623;
          transform: translateX(4px);
        }

        .tombol-mulai-kuis-underline:hover .tombol-kuis-teks {
          color: #F4A623;
        }
      `}</style>

    </div>
  );
}

const gaya = {
  dashboardContainer: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f4f6f9',
    position: 'relative',
  } as React.CSSProperties,

  mobileOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1015,
  } as React.CSSProperties,

  sidebar: {
    width: '280px',
    backgroundColor: '#F4A623',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 1010,
    boxShadow: '4px 0 25px rgba(0, 0, 0, 0.05)',
    overflowY: 'auto',
  } as React.CSSProperties,

  sidebarHeader: {
    padding: '28px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
  } as React.CSSProperties,

  sidebarLogoFrame: {
    width: '72px',
    height: '72px',
    overflow: 'hidden',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,

  sidebarLogo: {
    width: '162px',
    height: '74px',
    objectFit: 'cover',
    objectPosition: '56% center',
    filter: 'brightness(0) invert(1)',
    flexShrink: 0,
  } as React.CSSProperties,

  sidebarTitle: {
    fontSize: '21px',
    fontWeight: 800,
    letterSpacing: '-0.5px',
    margin: 0,
    marginLeft: '-4px',
    transform: 'translateY(6px)',
  } as React.CSSProperties,

  sidebarNav: {
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  } as React.CSSProperties,

  navList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  } as React.CSSProperties,

  navListItem: {
    margin: 0,
    padding: 0,
  } as React.CSSProperties,

  navItem: {
    width: '100%',
    padding: '14px 20px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '12px',
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    textAlign: 'left',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  navItemActive: {
    backgroundColor: '#ffffff',
    color: '#F4A623',
    boxShadow: '0 8px 16px rgba(0,0,0,0.06)',
  } as React.CSSProperties,

  sidebarFooter: {
    padding: '24px 16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  } as React.CSSProperties,

  btnLogout: {
    width: '100%',
    padding: '14px 20px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  mainContent: {
    flexGrow: 1,
    paddingLeft: '280px',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  } as React.CSSProperties,

  headerBar: {
    height: '76px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '0 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  } as React.CSSProperties,

  headerKiri: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  } as React.CSSProperties,

  btnHamburger: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#2d3748',
    padding: '8px',
    borderRadius: '8px',
    backgroundColor: '#f1f5f9',
    WebkitAppearance: 'none',
  } as React.CSSProperties,

  headerGreeting: {
    fontSize: '22px',
    fontWeight: 800,
    color: '#2d3748',
    margin: 0,
  } as React.CSSProperties,

  headerKanan: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  } as React.CSSProperties,

  statsIconGroup: {
    display: 'flex',
    gap: '12px',
  } as React.CSSProperties,

  statBadge: {
    fontSize: '13px',
    fontWeight: 700,
    backgroundColor: '#fef3c7',
    color: '#d97706',
    padding: '8px 14px',
    borderRadius: '100px',
  } as React.CSSProperties,

  statBadgeAmber: {
    fontSize: '13px',
    fontWeight: 700,
    backgroundColor: '#eff6ff',
    color: '#3b82f6',
    padding: '8px 14px',
    borderRadius: '100px',
  } as React.CSSProperties,

  profilInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  } as React.CSSProperties,

  avatarMini: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#F4A623',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '14px',
    boxShadow: '0 4px 12px rgba(244, 166, 35, 0.2)',
  } as React.CSSProperties,

  contentBody: {
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
  } as React.CSSProperties,

  bannerInfo: {
    background: 'linear-gradient(135deg, #F4A623 0%, #d97706 100%)',
    borderRadius: '24px',
    padding: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px',
    flexWrap: 'wrap',
    boxShadow: '0 10px 30px rgba(244, 166, 35, 0.15)',
  } as React.CSSProperties,

  bannerTeks: {
    color: '#ffffff',
    flex: 1,
    minWidth: '280px',
  } as React.CSSProperties,

  bannerJudul: {
    fontSize: '24px',
    fontWeight: 850,
    margin: '0 0 10px 0',
    lineHeight: 1.2,
  } as React.CSSProperties,

  bannerSubjudul: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.85)',
    margin: 0,
    lineHeight: 1.5,
  } as React.CSSProperties,

  btnBannerCta: {
    backgroundColor: '#ffffff',
    color: '#d97706',
    border: 'none',
    borderRadius: '14px',
    padding: '14px 28px',
    fontWeight: 700,
    fontSize: '15px',
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
  } as React.CSSProperties,

  kartuUtama: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '28px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,

  kartuJudul: {
    fontSize: '16px',
    fontWeight: 800,
    color: '#2d3748',
    margin: '0 0 20px 0',
  } as React.CSSProperties,

  levelWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  } as React.CSSProperties,

  levelBadge: {
    fontSize: '12px',
    fontWeight: 800,
    backgroundColor: 'rgba(244, 166, 35, 0.1)',
    color: '#d97706',
    padding: '6px 12px',
    borderRadius: '8px',
  } as React.CSSProperties,

  levelXp: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#718096',
  } as React.CSSProperties,

  progressBarBg: {
    height: '10px',
    backgroundColor: '#e2e8f0',
    borderRadius: '100px',
    overflow: 'hidden',
    marginBottom: '16px',
  } as React.CSSProperties,

  progressBarFill: {
    height: '100%',
    backgroundColor: '#F4A623',
    borderRadius: '100px',
    transition: 'width 0.4s ease-out',
  } as React.CSSProperties,

  xpInfo: {
    fontSize: '13px',
    color: '#718096',
    margin: 0,
    lineHeight: 1.4,
  } as React.CSSProperties,

  questHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    fontWeight: 700,
    color: '#718096',
    marginBottom: '8px',
  } as React.CSSProperties,

  questProgressTeks: {
    color: '#2d3748',
  } as React.CSSProperties,

  questPersen: {
    color: '#F4A623',
  } as React.CSSProperties,

  questList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  } as React.CSSProperties,

  questItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  } as React.CSSProperties,

  questCheckSelesai: {
    color: '#10b981',
    fontWeight: 800,
    fontSize: '14px',
  } as React.CSSProperties,

  questCheckBelum: {
    color: '#a0aec0',
    fontWeight: 800,
    fontSize: '14px',
  } as React.CSSProperties,

  questItemTeksSelesai: {
    fontSize: '13px',
    color: '#a0aec0',
    textDecoration: 'line-through',
  } as React.CSSProperties,

  questItemTeksBelum: {
    fontSize: '13px',
    color: '#4a5568',
  } as React.CSSProperties,

  rekomendasiList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  } as React.CSSProperties,

  rekomendasiItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    backgroundColor: '#f8fafc',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  } as React.CSSProperties,

  rekomendasiInfo: {
    flex: 1,
  } as React.CSSProperties,

  rekomendasiItemJudul: {
    fontSize: '14px',
    fontWeight: 750,
    color: '#2d3748',
    margin: '0 0 4px 0',
    transition: 'color 0.2s ease',
  } as React.CSSProperties,

  rekomendasiItemSub: {
    fontSize: '12px',
    color: '#718096',
    margin: 0,
  } as React.CSSProperties,

  rekomendasiArrow: {
    color: '#94a3b8',
    transition: 'all 0.25s ease',
    flexShrink: 0,
    marginLeft: '12px',
  } as React.CSSProperties,

  xpBadge: {
    fontSize: '12px',
    fontWeight: 800,
    backgroundColor: '#ecfdf5',
    color: '#10b981',
    padding: '6px 12px',
    borderRadius: '8px',
  } as React.CSSProperties,

  sectionBawah: {
    width: '100%',
  } as React.CSSProperties,

  kartuLebar: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '28px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
    border: '1px solid #e2e8f0',
  } as React.CSSProperties,

  riwayatWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  } as React.CSSProperties,

  riwayatItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderBottom: '1px solid #f1f5f9',
  } as React.CSSProperties,

  riwayatInfoKiri: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  } as React.CSSProperties,

  ikonBukuKecil: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    color: '#6366f1',
    flexShrink: 0,
    opacity: 0.95,
  } as React.CSSProperties,

  riwayatJudulTeks: {
    fontSize: '14px',
    fontWeight: 750,
    color: '#2d3748',
    margin: '0 0 4px 0',
  } as React.CSSProperties,

  riwayatKategori: {
    fontSize: '12px',
    color: '#718096',
    margin: 0,
  } as React.CSSProperties,

  riwayatInfoKanan: {
    display: 'flex',
    alignItems: 'center',
  } as React.CSSProperties,

  skorBadge: {
    fontSize: '13px',
    fontWeight: 700,
    padding: '6px 14px',
    borderRadius: '100px',
  } as React.CSSProperties,

  kosongContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    gap: '8px',
  } as React.CSSProperties,

  kosongIcon: {
    fontSize: '48px',
    marginBottom: '8px',
  } as React.CSSProperties,

  kosongText: {
    fontSize: '16px',
    color: '#64748b',
    fontWeight: 500,
    margin: 0,
  } as React.CSSProperties,

  kosongSubText: {
    fontSize: '14px',
    color: '#94a3b8',
    margin: 0,
  } as React.CSSProperties,

  kosongButton: {
    marginTop: '12px',
    padding: '10px 24px',
    backgroundColor: '#F4A623',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,
};

export default DashboardPage;