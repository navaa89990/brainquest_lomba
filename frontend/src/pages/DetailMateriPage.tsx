import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

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

  const [materi, setMateri] = useState<Materi | null>(null);
  const [semuaMateri, setSemuaMateri] = useState<Materi[]>([]);
  const [kontenAktif, setKontenAktif] = useState<Materi | null>(null);
  const [loading, setLoading] = useState(true);
  const [sudahLogin, setSudahLogin] = useState(false);

  useEffect(() => {
    const cekSesi = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSudahLogin(!!session);
    };
    cekSesi();
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => setSudahLogin(!!session));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: materiData, error } = await supabase
        .from('materials')
        .select('id, title, content, category, status, img, parent_id')
        .eq('id', id)
        .single();

      if (error || !materiData) { navigate('/materi'); return; }

      // Tentukan parent: jika materi ini adalah child, ambil parent-nya
      const parentId = materiData.parent_id ?? materiData.id;

      // Ambil parent itu sendiri + semua child-nya
      const { data: parentData } = await supabase
        .from('materials')
        .select('id, title, content, category, status, img, parent_id')
        .eq('id', parentId)
        .single();

      const { data: childData } = await supabase
        .from('materials')
        .select('id, title, content, category, status, img, parent_id')
        .eq('parent_id', parentId)
        .order('id');

      const listTahapan = [
        ...(parentData ? [parentData] : []),
        ...(childData || []),
      ];

      setMateri(materiData);
      setKontenAktif(materiData);
      setSemuaMateri(listTahapan);
      setLoading(false);
    };
    if (id) fetchData();
  }, [id]);

  const pilihMateri = (m: Materi) => {
    const terkunci = m.status === 'Khusus Member' && !sudahLogin;
    if (terkunci) return;
    setKontenAktif(m);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
  const terkunciAktif = isKhususAktif && !sudahLogin;
  const kataKonten = kontenAktif.content.split(' ');
  const kontenPreview = kataKonten.slice(0, Math.ceil(kataKonten.length * 0.4)).join(' ') + '...';

  // format paragraf
  const renderKonten = (teks: string) =>
    teks.split('\n').filter(p => p.trim()).map((p, i) => (
      <p key={i} style={s.paragraf}>{p}</p>
    ));

  return (
    <div style={s.wrapper}>
      <div style={s.container}>

        <nav style={s.breadcrumb} aria-label="Breadcrumb">
          <Link to="/materi" style={s.breadcrumbLink}>Materi</Link>
          <span style={s.sep}>›</span>
          <span style={s.breadcrumbAktif}>{materi.title}</span>
        </nav>

        <div style={s.pageHeader}>
          <div style={s.badgeRow}>
            <span style={s.badgeKat}>{materi.category}</span>
            {materi.status && (
              <span style={{
                ...s.badgeStatus,
                backgroundColor: materi.status === 'Khusus Member' ? 'rgba(99,102,241,0.1)' : 'rgba(244,166,35,0.1)',
                color: materi.status === 'Khusus Member' ? '#6366f1' : 'var(--primary-purple)',
              }}>
                {materi.status === 'Khusus Member' ? '🔒 ' : ''}{materi.status}
              </span>
            )}
          </div>
          <h1 style={s.judul}>{materi.title}</h1>
        </div>

        <div style={s.layoutGrid} className="detail-layout-grid">

          {/* GRID 1 — Thumbnail */}
          <div style={s.gridGambar}>
            {kontenAktif.img ? (
              <img src={kontenAktif.img} alt={kontenAktif.title} style={s.gambar} />
            ) : (
              <div style={s.gambarPlaceholder}><span style={{ fontSize: '56px' }}>📚</span></div>
            )}
            {kontenAktif.id !== materi.id && (
              <div style={s.labelMateriAktif}>
                <span style={s.dotAktif} />
                {kontenAktif.title}
              </div>
            )}
          </div>

          {/* GRID 2 — Konten Materi */}
          <div style={s.gridKonten}>
            {!sudahLogin && (
              <div style={s.bannerGuest}>
                <span style={{ fontSize: '18px' }}>⚡</span>
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
                  color: isKhususAktif ? '#6366f1' : 'var(--primary-purple)',
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
                  <span style={s.badgeSiap}>✅ Siap Diuji</span>
                  <p style={s.teksKuis}>Sudah paham materinya? Coba uji dengan kuis interaktif!</p>
                </div>
                <button
                  style={s.btnKuis}
                  className="tombol-efek-ringan"
                  onClick={() => navigate('/kuis', { state: { dariTeaser: true, levelId: kontenAktif.id, namaLevel: kontenAktif.title } })}
                >
                  <span>Mulai Kuis</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* GRID 3 — Sidebar list materi */}
          <aside style={s.sidebar} className="detail-sidebar">
            <div style={s.kartuSidebar}>
              <h3 style={s.judulSidebar}>Tahapan Materi</h3>
              {semuaMateri.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                  Belum ada sub-materi untuk topik ini.
                </p>
              ) : (
                <div style={s.listMateri}>
                  {semuaMateri.map(m => {
                    const aktif = kontenAktif.id === m.id;
                    const terkunci = m.status === 'Khusus Member' && !sudahLogin;
                    return (
                      <button
                        key={m.id}
                        style={{
                          ...s.itemMateri,
                          backgroundColor: aktif ? 'rgba(244,166,35,0.08)' : 'transparent',
                          borderLeft: aktif ? '3px solid var(--primary-purple)' : '3px solid transparent',
                          cursor: terkunci ? 'default' : 'pointer',
                          opacity: terkunci ? 0.6 : 1,
                        }}
                        onClick={() => pilihMateri(m)}
                      >
                        <div style={s.itemMateriKiri}>
                          {terkunci ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                          ) : (
                            <div style={{ ...s.dotItem, backgroundColor: aktif ? 'var(--primary-purple)' : '#cbd5e1' }} />
                          )}
                          <div>
                            <p style={{ ...s.itemJudul, color: aktif ? 'var(--primary-purple)' : 'var(--text-dark)', fontWeight: aktif ? 700 : 500 }}>
                              {m.title}
                            </p>
                            <p style={s.itemKat}>{m.category}</p>
                          </div>
                        </div>
                        {aktif && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary-purple)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {!sudahLogin && (
              <div style={s.miniCta}>
                <p style={s.teksCtaMini}>🚀 Bergabung dengan <strong>15.000+</strong> siswa aktif</p>
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

const shimmerBg = {
  background: 'linear-gradient(90deg, #f0f2f5 25%, #e8eaed 50%, #f0f2f5 75%)',
  backgroundSize: '1200px 100%',
  animation: 'shimmer 1.5s infinite',
} as React.CSSProperties;

const s = {
  wrapper: { width: '100%', minHeight: '100vh', backgroundColor: 'var(--bg-gray)', paddingTop: '120px', paddingBottom: '80px', animation: 'fadeUp 0.4s ease forwards' } as React.CSSProperties,
  container: { maxWidth: '1200px', margin: '0 auto', padding: '0 40px' } as React.CSSProperties,

  breadcrumb: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' } as React.CSSProperties,
  breadcrumbLink: { fontSize: '14px', color: 'var(--primary-purple)', fontWeight: 600, textDecoration: 'none' } as React.CSSProperties,
  sep: { fontSize: '14px', color: '#cbd5e1' } as React.CSSProperties,
  breadcrumbAktif: { fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 } as React.CSSProperties,

  pageHeader: { marginBottom: '28px', display: 'flex', flexDirection: 'column' as const, gap: '10px' } as React.CSSProperties,
  badgeRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' as const } as React.CSSProperties,
  badgeKat: { padding: '4px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: 700, backgroundColor: 'rgba(244,166,35,0.1)', color: 'var(--primary-purple)', textTransform: 'uppercase' as const, letterSpacing: '0.5px' } as React.CSSProperties,
  badgeStatus: { padding: '4px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: 700 } as React.CSSProperties,
  judul: { fontSize: '32px', fontWeight: 900, color: 'var(--text-dark)', lineHeight: 1.2, margin: 0 } as React.CSSProperties,

  layoutGrid: { display: 'grid' } as React.CSSProperties,

  // Grid 1
  gridGambar: { borderRadius: '20px', overflow: 'hidden', position: 'relative' as const, height: '280px' } as React.CSSProperties,
  gambar: { width: '100%', height: '100%', objectFit: 'cover' as const, display: 'block' } as React.CSSProperties,
  gambarPlaceholder: { width: '100%', height: '100%', backgroundColor: 'var(--light-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties,
  labelMateriAktif: { position: 'absolute' as const, bottom: '16px', left: '16px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', padding: '6px 14px', borderRadius: '100px', fontSize: '13px', fontWeight: 600, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: '8px' } as React.CSSProperties,
  dotAktif: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-purple)', flexShrink: 0 } as React.CSSProperties,

  // Grid 2
  gridKonten: { display: 'flex', flexDirection: 'column' as const, gap: '20px', minWidth: 0 } as React.CSSProperties,

  bannerGuest: { display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#fef9ec', border: '1px solid rgba(244,166,35,0.2)', borderRadius: '14px', padding: '12px 18px' } as React.CSSProperties,
  teksBanner: { fontSize: '14px', color: '#92400e', margin: 0, lineHeight: 1.5 } as React.CSSProperties,

  kartuKonten: { backgroundColor: '#ffffff', borderRadius: '20px', padding: '28px 32px', border: '1px solid rgba(244,166,35,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', position: 'relative' as const, overflow: 'hidden' } as React.CSSProperties,
  kartuKontenHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' as const } as React.CSSProperties,
  judulKonten: { fontSize: '20px', fontWeight: 800, color: 'var(--text-dark)', margin: 0, lineHeight: 1.3, flex: 1 } as React.CSSProperties,
  badgeKonten: { padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, flexShrink: 0 } as React.CSSProperties,

  teksKontenWrap: { display: 'flex', flexDirection: 'column' as const, gap: '0px' } as React.CSSProperties,
  paragraf: { fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.85, margin: '0 0 12px 0' } as React.CSSProperties,

  kontenTerkunciWrap: { position: 'relative' as const } as React.CSSProperties,
  gradienBlur: { position: 'absolute' as const, bottom: '80px', left: 0, right: 0, height: '80px', background: 'linear-gradient(to bottom, transparent, #ffffff)', pointerEvents: 'none' as const } as React.CSSProperties,

  kotakKunci: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', textAlign: 'center' as const, gap: '12px', padding: '24px', backgroundColor: '#f8f9ff', borderRadius: '16px', border: '1px solid rgba(99,102,241,0.12)', marginTop: '8px' } as React.CSSProperties,
  ikonKunciWrap: { width: '52px', height: '52px', borderRadius: '16px', backgroundColor: 'rgba(99,102,241,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties,
  judulKunci: { fontSize: '18px', fontWeight: 800, color: 'var(--text-dark)', margin: 0 } as React.CSSProperties,
  deskKunci: { fontSize: '14px', color: 'var(--text-muted)', margin: '4px 0 0 0', lineHeight: 1.5 } as React.CSSProperties,
  grupTombolKunci: { display: 'flex', gap: '10px', flexWrap: 'wrap' as const, justifyContent: 'center' } as React.CSSProperties,
  btnDaftar: { padding: '12px 28px', backgroundColor: 'var(--primary-purple)', color: '#ffffff', borderRadius: '12px', fontSize: '14px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 6px 16px rgba(244,166,35,0.25)' } as React.CSSProperties,
  btnMasuk: { padding: '12px 20px', backgroundColor: '#f0f2f5', color: 'var(--text-dark)', borderRadius: '12px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' } as React.CSSProperties,

  kotakKuis: { backgroundColor: '#ffffff', border: '1px solid rgba(244,166,35,0.12)', borderRadius: '20px', padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' as const, boxShadow: '0 4px 20px rgba(244,166,35,0.04)' } as React.CSSProperties,
  badgeSiap: { fontSize: '13px', fontWeight: 700, color: '#16a34a' } as React.CSSProperties,
  teksKuis: { fontSize: '14px', color: 'var(--text-muted)', margin: '4px 0 0 0' } as React.CSSProperties,
  btnKuis: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px', backgroundColor: 'var(--primary-purple)', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 16px rgba(244,166,35,0.25)', whiteSpace: 'nowrap' as const } as React.CSSProperties,

  // Grid 3
  sidebar: { position: 'sticky' as const, top: '110px', display: 'flex', flexDirection: 'column' as const, gap: '16px' } as React.CSSProperties,
  kartuSidebar: { backgroundColor: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid rgba(244,166,35,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' } as React.CSSProperties,
  judulSidebar: { fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)', margin: '0 0 16px 0' } as React.CSSProperties,
  listMateri: { display: 'flex', flexDirection: 'column' as const, gap: '4px' } as React.CSSProperties,
  itemMateri: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '12px 12px 12px 14px', borderRadius: '12px', border: 'none', background: 'none', textAlign: 'left' as const, transition: 'all 0.2s ease', width: '100%' } as React.CSSProperties,
  itemMateriKiri: { display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1, minWidth: 0 } as React.CSSProperties,
  dotItem: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, marginTop: '5px' } as React.CSSProperties,
  itemJudul: { fontSize: '13px', margin: 0, lineHeight: 1.35, whiteSpace: 'pre-wrap' as const, wordBreak: 'break-word' as const } as React.CSSProperties,
  itemKat: { fontSize: '11px', color: 'var(--text-muted)', margin: '3px 0 0 0', fontWeight: 500 } as React.CSSProperties,

  miniCta: { backgroundColor: 'var(--primary-purple)', borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column' as const, gap: '12px' } as React.CSSProperties,
  teksCtaMini: { fontSize: '13px', color: '#ffffff', margin: 0, lineHeight: 1.5 } as React.CSSProperties,
  btnCtaMini: { display: 'block', textAlign: 'center' as const, padding: '10px 0', backgroundColor: '#ffffff', color: 'var(--primary-purple)', borderRadius: '10px', fontSize: '13px', fontWeight: 800, textDecoration: 'none' } as React.CSSProperties,

  // Skeleton
  skeletonLine: { borderRadius: '8px', ...shimmerBg } as React.CSSProperties,
  skeletonImg: { width: '100%', height: '280px', borderRadius: '20px', ...shimmerBg } as React.CSSProperties,
  skeletonKonten: { backgroundColor: '#ffffff', borderRadius: '20px', padding: '28px 32px' } as React.CSSProperties,
  skeletonSidebar: { backgroundColor: '#ffffff', borderRadius: '20px', padding: '24px' } as React.CSSProperties,
};

export default DetailMateriPage;
