import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BookOpen, FolderOpen, Sparkles, Waves, ArrowLeft } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { useTheme, themeStyles } from '../lib/ThemeContext';
import { apiService } from '../lib/apiService';

interface Materi {
  id: number;
  title: string;
  content: string;
  category: string;
  img?: string;
  status?: string;
  parent_id?: number | null;
}

function DetailMateriPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { theme, setTheme, colors } = useTheme();

  const [materi, setMateri] = useState<Materi | null>(null);
  const [semuaMateri, setSemuaMateri] = useState<Materi[]>([]);
  const [kontenAktif, setKontenAktif] = useState<Materi | null>(null);
  const [loading, setLoading] = useState(true);
  const [parentMateri, setParentMateri] = useState<Materi | null>(null);

  useEffect(() => {
    if (!isAuthenticated && theme !== 'light') {
      setTheme('light');
    }
  }, [isAuthenticated, theme, setTheme]);

  const activeTheme = isAuthenticated ? theme : 'light';
  const activeColors = isAuthenticated ? colors : themeStyles.light;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const allMaterialsResponse = await apiService.getMaterials(1, 100);
        const allMaterials = allMaterialsResponse?.materials || [];
        setSemuaMateri(allMaterials);

        const response = await apiService.getMaterialDetail(Number(id));

        if (!response || !response.id) {
          navigate('/materi');
          return;
        }

        setMateri(response);
        setKontenAktif(response);

        if (response.parent_id !== null && response.parent_id !== undefined) {
          const parent = allMaterials.find((m: Materi) => m.id === response.parent_id);
          if (parent) {
            setParentMateri(parent);
          } else {
            setParentMateri(response);
          }
        } else {
          setParentMateri(response);
        }

      } catch (err) {
        console.error(err);
        navigate('/materi');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id, navigate]);

  const getRelatedMaterials = (): Materi[] => {
    if (!parentMateri) return [materi].filter(Boolean) as Materi[];
    const children = semuaMateri.filter(m => m.parent_id === parentMateri.id);
    return [parentMateri, ...children];
  };

  const pilihMateri = (m: Materi) => {
    const terkunci = m.status === 'Khusus Member' && !isAuthenticated;
    if (terkunci) return;
    setKontenAktif(m);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    const prev = sessionStorage.getItem('prevPath');
    if (prev && prev !== '/' && prev !== '/login' && prev !== '/daftar') {
      navigate(prev);
    } else {
      navigate('/materi');
    }
  };

  const shimmerBg = {
    background: activeTheme === 'dark'
      ? 'linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)'
      : 'linear-gradient(90deg, #f0f2f5 25%, #e8eaed 50%, #f0f2f5 75%)',
    backgroundSize: '1200px 100%',
    animation: 'shimmer 1.5s infinite',
  } as React.CSSProperties;

  const s = {
    wrapper: { 
      width: '100%', 
      minHeight: '100vh', 
      backgroundColor: activeColors.background, 
      paddingTop: '120px', 
      paddingBottom: '80px', 
      animation: 'fadeUp 0.4s ease forwards',
      transition: 'background-color 0.2s',
    } as React.CSSProperties,
    container: { maxWidth: '1200px', margin: '0 auto', padding: '0 40px' } as React.CSSProperties,

    breadcrumb: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' } as React.CSSProperties,
    breadcrumbLink: { fontSize: '14px', color: '#F4A623', fontWeight: 600, textDecoration: 'none' } as React.CSSProperties,
    sep: { fontSize: '14px', color: activeColors.border } as React.CSSProperties,
    breadcrumbAktif: { fontSize: '14px', color: activeColors.subtext, fontWeight: 500 } as React.CSSProperties,

    pageHeader: { marginBottom: '28px', display: 'flex', flexDirection: 'column' as const, gap: '10px' } as React.CSSProperties,
    badgeRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' as const } as React.CSSProperties,
    badgeKat: { padding: '4px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: 700, backgroundColor: 'rgba(244,166,35,0.1)', color: '#F4A623', textTransform: 'uppercase' as const, letterSpacing: '0.5px' } as React.CSSProperties,
    badgeStatus: { padding: '4px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: 700 } as React.CSSProperties,
    judul: { fontSize: '32px', fontWeight: 900, color: activeColors.text, lineHeight: 1.2, margin: 0 } as React.CSSProperties,

    layoutGrid: { display: 'grid' } as React.CSSProperties,

    gridGambar: { borderRadius: '20px', overflow: 'hidden', position: 'relative' as const, height: '280px' } as React.CSSProperties,
    gambar: { width: '100%', height: '100%', objectFit: 'cover' as const, display: 'block' } as React.CSSProperties,
    gambarPlaceholder: { width: '100%', height: '100%', backgroundColor: activeColors.background, display: 'flex', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties,
    labelMateriAktif: { position: 'absolute' as const, bottom: '16px', left: '16px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', padding: '6px 14px', borderRadius: '100px', fontSize: '13px', fontWeight: 600, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: '8px' } as React.CSSProperties,
    dotAktif: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F4A623', flexShrink: 0 } as React.CSSProperties,

    gridKonten: { display: 'flex', flexDirection: 'column' as const, gap: '20px', minWidth: 0 } as React.CSSProperties,

    bannerGuest: { display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#fef9ec', border: '1px solid rgba(244,166,35,0.2)', borderRadius: '14px', padding: '12px 18px' } as React.CSSProperties,
    teksBanner: { fontSize: '14px', color: '#92400e', margin: 0, lineHeight: 1.5 } as React.CSSProperties,

    kartuKonten: { backgroundColor: activeColors.surface, borderRadius: '20px', padding: '28px 32px', border: `1px solid ${activeColors.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', position: 'relative' as const, overflow: 'hidden', transition: 'background-color 0.2s, border-color 0.2s' } as React.CSSProperties,
    kartuKontenHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' as const } as React.CSSProperties,
    judulKonten: { fontSize: '20px', fontWeight: 800, color: activeColors.text, margin: 0, lineHeight: 1.3, flex: 1 } as React.CSSProperties,
    badgeKonten: { padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, flexShrink: 0 } as React.CSSProperties,

    teksKontenWrap: { display: 'flex', flexDirection: 'column' as const, gap: '0px' } as React.CSSProperties,
    paragraf: { fontSize: '15px', color: activeColors.subtext, lineHeight: 1.85, margin: '0 0 12px 0' } as React.CSSProperties,

    kontenTerkunciWrap: { position: 'relative' as const } as React.CSSProperties,
    gradienBlur: { position: 'absolute' as const, bottom: '80px', left: 0, right: 0, height: '80px', background: `linear-gradient(to bottom, transparent, ${activeColors.surface})`, pointerEvents: 'none' as const } as React.CSSProperties,

    kotakKunci: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', textAlign: 'center' as const, gap: '12px', padding: '24px', backgroundColor: activeTheme === 'dark' ? activeColors.background : '#f8f9ff', border: `1px solid ${activeColors.border}`, marginTop: '8px', transition: 'background-color 0.2s, border-color 0.2s' } as React.CSSProperties,
    ikonKunciWrap: { width: '52px', height: '52px', borderRadius: '16px', backgroundColor: 'rgba(99,102,241,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties,
    judulKunci: { fontSize: '18px', fontWeight: 800, color: activeColors.text, margin: 0 } as React.CSSProperties,
    deskKunci: { fontSize: '14px', color: activeColors.subtext, margin: '4px 0 0 0', lineHeight: 1.5 } as React.CSSProperties,
    grupTombolKunci: { display: 'flex', gap: '10px', flexWrap: 'wrap' as const, justifyContent: 'center' } as React.CSSProperties,
    btnDaftar: { padding: '12px 28px', backgroundColor: '#F4A623', color: '#ffffff', borderRadius: '12px', fontSize: '14px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 6px 16px rgba(244,166,35,0.25)' } as React.CSSProperties,
    btnMasuk: { padding: '12px 20px', backgroundColor: activeColors.background, color: activeColors.text, borderRadius: '12px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' } as React.CSSProperties,

    kotakKuis: { backgroundColor: activeColors.surface, border: `1px solid ${activeColors.border}`, borderRadius: '20px', padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' as const, boxShadow: '0 4px 20px rgba(244,166,35,0.04)', transition: 'background-color 0.2s, border-color 0.2s' } as React.CSSProperties,
    badgeSiap: { fontSize: '13px', fontWeight: 700, color: '#16a34a' } as React.CSSProperties,
    teksKuis: { fontSize: '14px', color: activeColors.subtext, margin: '4px 0 0 0' } as React.CSSProperties,
    btnKuis: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px', backgroundColor: '#F4A623', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 16px rgba(244,166,35,0.25)', whiteSpace: 'nowrap' as const } as React.CSSProperties,

    sidebar: { position: 'sticky' as const, top: '110px', display: 'flex', flexDirection: 'column' as const, gap: '16px' } as React.CSSProperties,
    kartuSidebar: { backgroundColor: activeColors.surface, borderRadius: '20px', padding: '24px', border: `1px solid ${activeColors.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', transition: 'background-color 0.2s, border-color 0.2s' } as React.CSSProperties,
    judulSidebar: { fontSize: '15px', fontWeight: 700, color: activeColors.text, margin: '0 0 16px 0' } as React.CSSProperties,
    listMateri: { display: 'flex', flexDirection: 'column' as const, gap: '4px' } as React.CSSProperties,
    itemMateri: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '12px 12px 12px 14px', borderRadius: '12px', border: 'none', background: 'none', textAlign: 'left' as const, transition: 'all 0.2s ease', width: '100%' } as React.CSSProperties,
    itemMateriKiri: { display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1, minWidth: 0 } as React.CSSProperties,
    dotItem: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, marginTop: '5px' } as React.CSSProperties,
    itemJudul: { fontSize: '13px', margin: 0, lineHeight: 1.35, whiteSpace: 'pre-wrap' as const, wordBreak: 'break-word' as const } as React.CSSProperties,
    itemKat: { fontSize: '11px', color: activeColors.subtext, margin: '3px 0 0 0', fontWeight: 500 } as React.CSSProperties,

    miniCta: { backgroundColor: '#F4A623', borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column' as const, gap: '12px' } as React.CSSProperties,
    teksCtaMini: { fontSize: '13px', color: '#ffffff', margin: 0, lineHeight: 1.5 } as React.CSSProperties,
    btnCtaMini: { display: 'block', textAlign: 'center' as const, padding: '10px 0', backgroundColor: '#ffffff', color: '#F4A623', borderRadius: '10px', fontSize: '13px', fontWeight: 800, textDecoration: 'none' } as React.CSSProperties,

    skeletonLine: { borderRadius: '8px', ...shimmerBg } as React.CSSProperties,
    skeletonImg: { width: '100%', height: '280px', borderRadius: '20px', ...shimmerBg } as React.CSSProperties,
    skeletonKonten: { backgroundColor: activeColors.surface, borderRadius: '20px', padding: '28px 32px' } as React.CSSProperties,
    skeletonSidebar: { backgroundColor: activeColors.surface, borderRadius: '20px', padding: '24px' } as React.CSSProperties,
  };

  if (loading || !materi || !kontenAktif) {
    return (
      <div style={s.wrapper}>
        <div style={s.container}>
          <div style={{ ...s.skeletonLine, width: '50%', height: '36px', marginBottom: '32px' }} />
          <div style={s.layoutGrid} className="detail-layout-grid">
            <div style={s.skeletonImg} />
            <div style={s.skeletonKonten}>
              {[100, 90, 95, 75, 85].map((w, i) => (
                <div key={i} style={{ ...s.skeletonLine, width: `${w}%`, height: '15px', marginBottom: '10px' }} />
              ))}
            </div>
            <div style={s.skeletonSidebar}>
              {[1, 2, 3].map(i => <div key={i} style={{ ...s.skeletonLine, width: '100%', height: '64px', marginBottom: '10px', borderRadius: '12px' }} />)}
            </div>
          </div>
        </div>
        <style>{shimmerCSS}</style>
      </div>
    );
  }

  const isKhususAktif = kontenAktif.status === 'Khusus Member';
  const terkunciAktif = isKhususAktif && !isAuthenticated;
  const kataKonten = (kontenAktif.content || '').split(' ');
  const kontenPreview = kataKonten.slice(0, Math.ceil(kataKonten.length * 0.4)).join(' ') + '...';

  const renderKonten = (teks: string) =>
    teks.split('\n').filter(p => p.trim()).map((p, i) => (
      <p key={i} style={s.paragraf}>{p}</p>
    ));

  const relatedMaterials = getRelatedMaterials();

  return (
    <div style={s.wrapper}>
      <div style={s.container}>

        <nav style={s.breadcrumb} aria-label="Breadcrumb">
          <button
            onClick={handleBack}
            style={{
              ...s.breadcrumbLink,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <ArrowLeft size={16} />
            <span>Kembali</span>
          </button>
          <span style={s.sep}>›</span>
          {parentMateri && parentMateri.id !== materi.id && (
            <>
              <Link to={`/materi/${parentMateri.id}`} style={s.breadcrumbLink}>
                {parentMateri.title}
              </Link>
              <span style={s.sep}>›</span>
            </>
          )}
          <span style={s.breadcrumbAktif}>{materi.title}</span>
        </nav>

        <div style={s.pageHeader}>
          <div style={s.badgeRow}>
            <span style={s.badgeKat}>{materi.category}</span>
            {materi.status && (
              <span style={{
                ...s.badgeStatus,
                backgroundColor: materi.status === 'Khusus Member' ? 'rgba(99,102,241,0.1)' : 'rgba(244,166,35,0.1)',
                color: materi.status === 'Khusus Member' ? '#6366f1' : '#F4A623',
              }}>
                {materi.status === 'Khusus Member' ? <></> : null}{materi.status}
              </span>
            )}
          </div>
          <h1 style={s.judul}>{materi.title}</h1>
        </div>

        <div style={s.layoutGrid} className="detail-layout-grid">

          <div style={s.gridGambar}>
            {kontenAktif.img ? (
              <img src={kontenAktif.img} alt={kontenAktif.title} style={s.gambar} />
            ) : (
              <div style={s.gambarPlaceholder}><span style={{ display: 'inline-flex' }}><BookOpen size={56} color="#ffffff" /></span></div>
            )}
            {kontenAktif.id !== materi.id && (
              <div style={s.labelMateriAktif}>
                <span style={s.dotAktif} />
                {kontenAktif.title}
              </div>
            )}
          </div>

          <div style={s.gridKonten}>
            {!isAuthenticated && (
              <div style={s.bannerGuest}>
                <span style={{ display: 'inline-flex' }}><Waves size={18} color="#f59e0b" /></span>
                <p style={s.teksBanner}>
                  Kamu dalam <strong>Mode Tamu</strong>. Hanya sebagian konten yang dapat dilihat.
                </p>
              </div>
            )}

            <div style={s.kartuKonten}>
              <div style={s.kartuKontenHeader}>
                <h2 style={s.judulKonten}>{kontenAktif.title}</h2>
                <span style={{
                  ...s.badgeKonten,
                  backgroundColor: isKhususAktif ? 'rgba(99,102,241,0.1)' : 'rgba(244,166,35,0.1)',
                  color: isKhususAktif ? '#6366f1' : '#F4A623',
                }}>
                  {kontenAktif.status}
                </span>
              </div>

              {terkunciAktif ? (
                <div style={s.kontenTerkunciWrap}>
                  <div style={s.teksKontenWrap}>{renderKonten(kontenPreview)}</div>
                  <div style={s.gradienBlur} />
                  <div style={s.kotakKunci}>
                    <div style={s.ikonKunciWrap}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <div>
                      <h3 style={s.judulKunci}>Konten Khusus Member</h3>
                      <p style={s.deskKunci}>Daftar gratis untuk membuka akses penuh semua materi eksklusif.</p>
                    </div>
                    <div style={s.grupTombolKunci} className="grup-kunci-detail">
                      <Link to="/daftar" style={s.btnDaftar} className="tombol-efek-ringan">Daftar Gratis</Link>
                      <Link to="/login" style={s.btnMasuk}>Masuk</Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={s.teksKontenWrap}>{renderKonten(kontenAktif.content)}</div>
              )}
            </div>

            {!terkunciAktif && (
              <div style={s.kotakKuis}>
                <div>
                  <span style={s.badgeSiap}><Sparkles size={14} style={{ marginRight: '6px' }} /> Siap Diuji</span>
                  <p style={s.teksKuis}>Sudah paham materinya? Coba uji dengan kuis interaktif!</p>
                </div>
                <button
                  style={s.btnKuis}
                  className="tombol-efek-ringan"
                  onClick={() => navigate(`/kuis/${kontenAktif.id}`, { state: { dariTeaser: true, levelId: kontenAktif.id, namaLevel: kontenAktif.title } })}
                >
                  <span>Mulai Kuis</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
              </div>
            )}
          </div>

          <aside style={s.sidebar} className="detail-sidebar">
            <div style={s.kartuSidebar}>
              <h3 style={s.judulSidebar}>
                {parentMateri ? parentMateri.title : 'Tahapan Materi'}
              </h3>
              {relatedMaterials.length === 0 ? (
                <p style={{ fontSize: '13px', color: activeColors.subtext, margin: 0, lineHeight: 1.6 }}>
                  Belum ada sub-materi untuk topik ini.
                </p>
              ) : (
                <div style={s.listMateri}>
                  {relatedMaterials.map(m => {
                    const aktif = kontenAktif.id === m.id;
                    const terkunci = m.status === 'Khusus Member' && !isAuthenticated;
                    const isParent = m.id === parentMateri?.id;
                    
                    return (
                      <button
                        key={m.id}
                        style={{
                          ...s.itemMateri,
                          backgroundColor: aktif ? 'rgba(244,166,35,0.08)' : 'transparent',
                          borderLeft: aktif ? '3px solid #F4A623' : '3px solid transparent',
                          cursor: terkunci ? 'default' : 'pointer',
                          opacity: terkunci ? 0.6 : 1,
                          paddingLeft: isParent ? '14px' : '24px',
                        }}
                        onClick={() => pilihMateri(m)}
                      >
                        <div style={s.itemMateriKiri}>
                          {isParent ? (
                            <div style={{ ...s.dotItem, backgroundColor: aktif ? '#F4A623' : '#94a3b8', width: '10px', height: '10px' }} />
                          ) : (
                            <div style={{ ...s.dotItem, backgroundColor: aktif ? '#F4A623' : '#cbd5e1', width: '6px', height: '6px', marginLeft: '4px' }} />
                          )}
                          <div>
                            <p style={{ 
                              ...s.itemJudul, 
                              color: aktif ? '#F4A623' : activeColors.text, 
                              fontWeight: aktif ? 700 : isParent ? 600 : 500,
                              fontSize: isParent ? '14px' : '13px'
                            }}>
                              {isParent ? <><FolderOpen size={14} style={{ marginRight: '6px' }} /></> : null}{m.title}
                            </p>
                            <p style={s.itemKat}>
                              {isParent ? 'Materi Utama' : 'Sub-materi'} • {m.category}
                            </p>
                          </div>
                        </div>
                        {aktif && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F4A623" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                        )}
                        {terkunci && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {!isAuthenticated && (
              <div style={s.miniCta}>
                <p style={s.teksCtaMini}><Sparkles size={16} style={{ marginRight: '6px' }} /> Bergabung dengan <strong>15.000+</strong> siswa aktif</p>
                <Link to="/daftar" style={s.btnCtaMini}>Daftar Gratis</Link>
              </div>
            )}
          </aside>

        </div>
      </div>

      <style>{`
        ${shimmerCSS}
        .detail-layout-grid {
          display: grid !important;
          grid-template-columns: 1fr 300px !important;
          grid-template-rows: auto 1fr !important;
          gap: 24px !important;
        }
        .detail-layout-grid > :nth-child(1) { grid-column: 1; grid-row: 1; }
        .detail-layout-grid > :nth-child(2) { grid-column: 1; grid-row: 2; }
        .detail-layout-grid > :nth-child(3) { grid-column: 2; grid-row: 1 / span 2; }

        @media (max-width: 968px) {
          .detail-layout-grid {
            grid-template-columns: 1fr !important;
            grid-template-rows: auto !important;
          }
          .detail-layout-grid > :nth-child(1),
          .detail-layout-grid > :nth-child(2),
          .detail-layout-grid > :nth-child(3) {
            grid-column: 1 !important;
            grid-row: auto !important;
          }
          .detail-sidebar { position: static !important; }
          .grup-kunci-detail { flex-direction: column !important; }
        }
      `}</style>
    </div>
  );
}

const shimmerCSS = `
  @keyframes shimmer {
    0% { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export default DetailMateriPage;