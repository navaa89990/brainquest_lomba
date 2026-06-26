import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/warnalogo.png';
import Materi from '../components/dashboard/Materi';
import ArenaKuis from '../components/dashboard/ArenaKuis';
import Leaderboard from '../components/dashboard/LeaderBoard';
import Pengaturan from '../components/dashboard/Pengaturan';

function DashboardPage() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('ringkasan');
  const [sidebarBuka, setSidebarBuka] = useState(false);

  const user = {
    nama: 'Navdev',
    email: 'navdev@brainquest.com',
    level: 12,
    xp: 2450,
    xpMax: 4000,
    streak: 5,
    rank: 14,
    questSelesai: 3,
    questTotal: 5,
  };

  const menuItems = [
    { id: 'ringkasan', label: 'Ringkasan', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: 'materi', label: 'Materi Belajar', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { id: 'kuis', label: 'Arena Kuis', icon: 'M9.663 17h4.673M12 3v1m6.364 .364l-.707 .707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
    { id: 'leaderboard', label: 'Leaderboard', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'settings', label: 'Pengaturan', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  const recentQuizzes = [
    { title: 'Kuis Aljabar Dasar', category: 'Matematika', score: 90, date: '2 jam yang lalu' },
    { title: 'Gaya & Hukum Newton', category: 'Fisika', score: 100, date: 'Kemarin' },
    { title: 'Struktur Sel Hewan', category: 'Biologi', score: 80, date: '3 hari yang lalu' },
  ];

  const recommendedMaterials = [
    { title: 'Matriks & Transformasi', category: 'Matematika', duration: '12 Menit', xp: '+60 XP' },
    { title: 'Gelombang Elektromagnetik', category: 'Fisika', duration: '15 Menit', xp: '+80 XP' },
  ];

  return (
    <div style={styles.dashboardContainer}>
      
      {sidebarBuka && (
        <div 
          style={styles.mobileOverlay} 
          onClick={() => setSidebarBuka(false)}
          aria-hidden="true"
        />
      )}

      <aside style={styles.sidebar} className="sidebar-element" aria-label="Sidebar Navigasi">
        <header style={styles.sidebarHeader}>
          <div style={styles.sidebarLogoFrame} className="sidebar-logo-frame-brainquest">
            <img src={logo} alt="Logo Utama BrainQuest" style={styles.sidebarLogo} />
          </div>
          <h2 style={styles.sidebarTitle}>BrainQuest</h2>
        </header>

        <nav style={styles.sidebarNav} aria-label="Menu Utama">
          <ul style={styles.navList}>
            {menuItems.map((item) => {
              const isActive = activeMenu === item.id;
              return (
                <li key={item.id} style={styles.navListItem}>
                  <button 
                    onClick={() => {
                      setActiveMenu(item.id);
                      setSidebarBuka(false);
                    }}
                    style={{
                      ...styles.navItem,
                      ...(isActive ? styles.navItemActive : {}),
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

        <footer style={styles.sidebarFooter}>
          <button 
            onClick={() => navigate('/')}
            style={styles.btnLogout}
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
        </footer>
      </aside>

      <main style={styles.mainContent}>
        
        <header style={styles.headerBar} className="header-bar">
          <div style={styles.headerKiri}>
            <button 
              onClick={() => setSidebarBuka(true)} 
              style={styles.btnHamburger}
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
            <h1 style={styles.headerGreeting} className="header-greeting">Halo, {user.nama}! 👋</h1>
          </div>
          
          <div style={styles.headerKanan}>
            <div style={styles.statsIconGroup} className="stats-group" aria-label="Statistik Pengguna">
              <span style={styles.statBadge} title={`${user.streak} Hari Streak`}>
                <span aria-hidden="true">🔥</span> {user.streak}<span className="stat-teks"> Hari Streak</span>
              </span>
              <span style={styles.statBadgeAmber} title={`Peringkat ${user.rank}`}>
                <span aria-hidden="true">🏆</span> Peringkat <span className="stat-teks">#{user.rank}</span>
              </span>
            </div>
            
            <div style={styles.profilInfo}>
              <div style={styles.avatarMini} aria-label={`Profil ${user.nama}`}>
                {user.nama.substring(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div style={styles.contentBody} className="content-body">
            {activeMenu === 'materi' ? (
              <Materi />
            ) : activeMenu === 'kuis' ? (
              <ArenaKuis />
            ) : activeMenu === 'leaderboard' ? (
              <Leaderboard />
            ) : activeMenu === 'settings' ? (
              <Pengaturan />
            ) : (
      <>
      <section style={styles.bannerInfo} className="banner-info" aria-labelledby="banner-judul">
        <div style={styles.bannerTeks}>
          <h2 id="banner-judul" style={styles.bannerJudul}>Petualangan Belajarmu Baru Saja Dimulai!</h2>
          <p style={styles.bannerSubjudul}>Selesaikan quest harianmu untuk mengklaim bonus XP dan mempertahankan streak belajarmu.</p>
        </div>
        <button onClick={() => navigate('/kuis')} style={styles.btnBannerCta} className="btn-banner">
          Mulai Kuis Sekarang
        </button>
      </section>

      <section style={styles.cardsGrid} className="dashboard-cards-grid" aria-label="Informasi Progres Belajar">
        <article style={styles.kartuUtama} className="kartu">
          <h3 style={styles.kartuJudul}>Progres Level & XP</h3>
          <div style={styles.levelWrapper}>
            <span style={styles.levelBadge}>LEVEL {user.level}</span>
            <span style={styles.levelXp}>{user.xp} / {user.xpMax} XP</span>
          </div>
          <div style={styles.progressBarBg} aria-hidden="true">
            <div style={{ ...styles.progressBarFill, width: `${(user.xp / user.xpMax) * 100}%` }}></div>
          </div>
          <p style={styles.xpInfo}>Dapatkan {user.xpMax - user.xp} XP lagi untuk naik ke Level {user.level + 1}!</p>
        </article>

        <article style={styles.kartuUtama} className="kartu">
          <h3 style={styles.kartuJudul}>Quest Harian</h3>
          <div style={styles.questHeader}>
            <span style={styles.questProgressTeks}>{user.questSelesai} dari {user.questTotal} Quest Selesai</span>
            <span style={styles.questPersen}>{Math.round((user.questSelesai / user.questTotal) * 100)}%</span>
          </div>
          <div style={styles.progressBarBg} aria-hidden="true">
            <div style={{ ...styles.progressBarFill, width: `${(user.questSelesai / user.questTotal) * 100}%` }}></div>
          </div>
          <ul style={styles.questList}>
            <li style={styles.questItem}>
              <span style={styles.questCheckSelesai} aria-hidden="true">✓</span>
              <span style={styles.questItemTeksSelesai}>Kerjakan kuis harian Matematika (+50 XP)</span>
            </li>
            <li style={styles.questItem}>
              <span style={styles.questCheckSelesai} aria-hidden="true">✓</span>
              <span style={styles.questItemTeksSelesai}>Baca 1 artikel materi baru (+30 XP)</span>
            </li>
            <li style={styles.questItem}>
              <span style={styles.questCheckBelum} aria-hidden="true">○</span>
              <span style={styles.questItemTeksBelum}>Capai akurasi 100% pada satu kuis (+100 XP)</span>
            </li>
          </ul>
        </article>

        <article style={styles.kartuUtama} className="kartu">
          <h3 style={styles.kartuJudul}>Rekomendasi Materi</h3>
          <div style={styles.rekomendasiList}>
            {recommendedMaterials.map((mat, i) => (
              <div key={i} style={styles.rekomendasiItem}>
                <div>
                  <h4 style={styles.rekomendasiItemJudul}>{mat.title}</h4>
                  <p style={styles.rekomendasiItemSub}>{mat.category} • {mat.duration}</p>
                </div>
                <span style={styles.xpBadge} aria-label={`Menambahkan ${mat.xp}`}>{mat.xp}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section style={styles.sectionBawah} aria-labelledby="riwayat-judul">
        <article style={styles.kartuLebar} className="kartu">
          <h3 id="riwayat-judul" style={styles.kartuJudul}>Riwayat Kuis Terakhir</h3>
          <div style={styles.riwayatWrapper}>
            {recentQuizzes.map((quiz, i) => (
              <div key={i} style={styles.riwayatItem} className="riwayat-item">
                <div style={styles.riwayatInfoKiri}>
                  <div style={styles.ikonBukuKecil} aria-hidden="true">📖</div>
                  <div>
                    <h4 style={styles.riwayatJudulTeks}>{quiz.title}</h4>
                    <p style={styles.riwayatKategori}>{quiz.category} • {quiz.date}</p>
                  </div>
                </div>
                <div style={styles.riwayatInfoKanan}>
                  <span style={{
                    ...styles.skorBadge,
                    backgroundColor: quiz.score >= 90 ? '#ecfdf5' : '#fef3c7',
                    color: quiz.score >= 90 ? '#10b981' : '#d97706',
                  }}>
                    Skor: {quiz.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
    )}
        </div>
      </main>

      <style>{`
        .sidebar-element {
          transform: translateX(0) !important;
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
        }
      `}</style>

    </div>
  );
}

const styles = {
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
    gap: '16px',
  } as React.CSSProperties,

  rekomendasiItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
  } as React.CSSProperties,

  rekomendasiItemJudul: {
    fontSize: '14px',
    fontWeight: 750,
    color: '#2d3748',
    margin: '0 0 4px 0',
  } as React.CSSProperties,

  rekomendasiItemSub: {
    fontSize: '12px',
    color: '#718096',
    margin: 0,
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
    fontSize: '20px',
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
};

export default DashboardPage;
