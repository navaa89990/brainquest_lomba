import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

interface Materi {
  id: number;
  title: string;
  content: string;
  category: string;
  img?: string;
  status?: string;
}

function MateriPage() {
  const [kategoriAktif, setKategoriAktif] = useState<string>('Semua');
  const [bankMateri, setBankMateri] = useState<Materi[]>([]);
  const [loading, setLoading] = useState(true);
  const [kartuHover, setKartuHover] = useState<number | null>(null);
  const [sudahLogin, setSudahLogin] = useState(false);
  const [cekAuth, setCekAuth] = useState(true);

  const daftarKategori = ['Semua', 'Pemrograman', 'Pengetahuan Umum', 'Bahasa Indonesia', 'Bahasa Inggris'];

  useEffect(() => {
    const cekSesi = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSudahLogin(!!session);
      setCekAuth(false);
    };
    cekSesi();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSudahLogin(!!session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (cekAuth) return;
    const loadMaterials = async () => {
      setLoading(true);
      let query = supabase.from('materials').select('id, title, content, category, status, img').is('parent_id', null);
      if (kategoriAktif !== 'Semua') query = query.eq('category', kategoriAktif);
      const { data, error } = await query;
      if (error) console.error('Supabase error:', error);
      else setBankMateri(data || []);
      setLoading(false);
    };
    loadMaterials();
  }, [kategoriAktif, cekAuth]);

  const isTerkunci = (m: Materi) => m.status === 'Khusus Member' && !sudahLogin;

  return (
    <div style={s.wrapper}>
      <div style={s.container}>

        <div style={s.header}>
          <span style={s.labelKecil}>PERPUSTAKAAN BELAJAR</span>
          <h1 style={s.judul}>Materi Pembelajaran</h1>
          <p style={s.subjudul}>Pilih kategori dan mulai kuasai materi favoritmu sekarang.</p>
        </div>

        <div style={s.filterBar} className="filter-bar-materi">
          {daftarKategori.map(kat => {
            const aktif = kategoriAktif === kat;
            return (
              <button
                key={kat}
                onClick={() => setKategoriAktif(kat)}
                style={{
                  ...s.btnKat,
                  backgroundColor: aktif ? 'var(--primary-purple)' : '#ffffff',
                  color: aktif ? '#ffffff' : 'var(--text-dark)',
                  border: aktif ? '1.5px solid var(--primary-purple)' : '1.5px solid rgba(244,166,35,0.2)',
                  boxShadow: aktif ? '0 4px 14px rgba(244,166,35,0.25)' : 'none',
                }}
              >
                {kat}
              </button>
            );
          })}
        </div>

        {loading || cekAuth ? (
          <div style={s.loadingWrap}>
            <div style={s.skeletonGrid} className="grid-materi-mobile">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={s.skeletonCard}>
                  <div style={s.skeletonImg} />
                  <div style={s.skeletonBody}>
                    <div style={{ ...s.skeletonLine, width: '40%', height: '18px' }} />
                    <div style={{ ...s.skeletonLine, width: '80%', height: '22px', marginTop: '10px' }} />
                    <div style={{ ...s.skeletonLine, width: '100%', height: '14px', marginTop: '8px' }} />
                    <div style={{ ...s.skeletonLine, width: '70%', height: '14px', marginTop: '6px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : bankMateri.length === 0 ? (
          <div style={s.kosong}>
            <span style={{ fontSize: '48px' }}>📭</span>
            <p style={s.teksKosong}>Belum ada materi untuk kategori ini.</p>
          </div>
        ) : (
          <div style={s.grid} className="grid-materi-mobile">
            {bankMateri.map((m) => {
              const hover = kartuHover === m.id;
              const terkunci = isTerkunci(m);

              if (terkunci) {
                return (
                  <article
                    key={m.id}
                    style={s.cardTerkunci}
                    onMouseEnter={() => setKartuHover(m.id)}
                    onMouseLeave={() => setKartuHover(null)}
                  >
                    <div style={s.cardImgWrap}>
                      {m.img ? (
                        <img src={m.img} alt={m.title} style={{ ...s.cardImg, filter: 'blur(6px) brightness(0.4)' }} />
                      ) : (
                        <div style={{ ...s.cardImgPlaceholder, backgroundColor: '#1e1b4b' }}>
                          <span style={{ fontSize: '40px', filter: 'blur(2px)' }}>📚</span>
                        </div>
                      )}
                      <div style={s.overlayKunci}>
                        <div style={s.ikonKunciWrap}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                          </svg>
                        </div>
                        <span style={s.teksKunciOverlay}>Khusus Member</span>
                      </div>
                      {m.status && (
                        <span style={{ ...s.badge, backgroundColor: 'rgba(99,102,241,0.15)', color: '#818cf8', opacity: 0.8 }}>
                          🔒 {m.status}
                        </span>
                      )}
                    </div>

                    <div style={s.cardBody}>
                      <h3 style={{ ...s.cardJudul, color: '#94a3b8' }}>{m.title}</h3>
                      <p style={{ ...s.cardDeskripsi, filter: 'blur(4px)', userSelect: 'none' }}>
                        {m.content}
                      </p>
                    </div>

                    <div style={s.cardFooterKunci}>
                      <div style={s.pesanKunci}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <span style={s.teksPesanKunci}>Masuk atau daftar untuk akses</span>
                      </div>
                      <div style={s.grupTombolKunci}>
                        <Link to="/login" style={s.btnMasukKunci}>Masuk</Link>
                        <Link to="/daftar" style={s.btnDaftarKunci}>Daftar Gratis</Link>
                      </div>
                    </div>
                  </article>
                );
              }

              return (
                <article
                  key={m.id}
                  style={{
                    ...s.card,
                    transform: hover ? 'translateY(-8px)' : 'translateY(0)',
                    boxShadow: hover ? '0 20px 40px rgba(244,166,35,0.12)' : '0 4px 20px rgba(0,0,0,0.04)',
                    borderColor: hover ? 'rgba(244,166,35,0.3)' : 'rgba(244,166,35,0.1)',
                  }}
                  onMouseEnter={() => setKartuHover(m.id)}
                  onMouseLeave={() => setKartuHover(null)}
                >
                  <div style={s.cardImgWrap}>
                    {m.img ? (
                      <img src={m.img} alt={m.title} style={s.cardImg} />
                    ) : (
                      <div style={s.cardImgPlaceholder}>
                        <span style={{ fontSize: '40px' }}>📚</span>
                      </div>
                    )}
                    {m.status && (
                      <span style={{
                        ...s.badge,
                        backgroundColor: m.status === 'Khusus Member' ? 'rgba(99,102,241,0.12)' : 'rgba(244,166,35,0.1)',
                        color: m.status === 'Khusus Member' ? '#6366f1' : 'var(--primary-purple)',
                      }}>
                        {m.status === 'Khusus Member' ? '🔒 ' : ''}{m.status}
                      </span>
                    )}
                    <span style={s.badgeKategori}>{m.category}</span>
                  </div>

                  <div style={s.cardBody}>
                    <h3 style={s.cardJudul}>{m.title}</h3>
                    <p style={s.cardDeskripsi}>{m.content}</p>
                  </div>

                  <div style={s.cardFooter} className="cardFooter">
                    <Link
                      to={`/materi/${m.id}`}
                      style={{
                        ...s.btnPelajari,
                        backgroundColor: hover ? 'var(--primary-purple)' : 'rgba(244,166,35,0.08)',
                        color: hover ? '#ffffff' : 'var(--primary-purple)',
                      }}
                    >
                      <span>Pelajari</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @media (max-width: 968px) {
          .grid-materi-mobile {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .filter-bar-materi {
            gap: 8px !important;
          }
        }
        @media (max-width: 560px) {
          .grid-materi-mobile {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

const s = {
  wrapper: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-gray)',
    paddingTop: '120px',
    paddingBottom: '80px',
  } as React.CSSProperties,

  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 40px',
  } as React.CSSProperties,

  header: {
    marginBottom: '40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  } as React.CSSProperties,

  labelKecil: {
    fontSize: '13px',
    fontWeight: 700,
    color: 'var(--primary-purple)',
    letterSpacing: '2px',
  } as React.CSSProperties,

  judul: {
    fontSize: '40px',
    fontWeight: 900,
    color: 'var(--text-dark)',
    margin: 0,
    lineHeight: 1.15,
  } as React.CSSProperties,

  subjudul: {
    fontSize: '16px',
    color: 'var(--text-muted)',
    margin: 0,
  } as React.CSSProperties,

  filterBar: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '10px',
    marginBottom: '40px',
  } as React.CSSProperties,

  btnKat: {
    padding: '10px 22px',
    borderRadius: '100px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
  } as React.CSSProperties,

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
  } as React.CSSProperties,

  card: {
    backgroundColor: '#ffffff',
    border: '1px solid rgba(244,166,35,0.1)',
    borderRadius: '20px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s cubic-bezier(0.25,1,0.5,1), box-shadow 0.3s ease, border-color 0.3s ease',
    cursor: 'pointer',
  } as React.CSSProperties,

  cardTerkunci: {
    backgroundColor: '#0f172a',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: '20px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'default',
    boxShadow: '0 4px 24px rgba(99,102,241,0.08)',
  } as React.CSSProperties,

  cardImgWrap: {
    position: 'relative',
    width: '100%',
    height: '180px',
    overflow: 'hidden',
    flexShrink: 0,
  } as React.CSSProperties,

  cardImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    display: 'block',
    transition: 'transform 0.4s ease',
  } as React.CSSProperties,

  cardImgPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'var(--light-purple)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,

  overlayKunci: {
    position: 'absolute' as const,
    inset: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    zIndex: 2,
  } as React.CSSProperties,

  ikonKunciWrap: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: 'rgba(99,102,241,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
    boxShadow: '0 0 0 8px rgba(99,102,241,0.15)',
  } as React.CSSProperties,

  teksKunciOverlay: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#ffffff',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: '4px 12px',
    borderRadius: '100px',
    backdropFilter: 'blur(4px)',
    letterSpacing: '0.5px',
  } as React.CSSProperties,

  badge: {
    position: 'absolute' as const,
    top: '12px',
    right: '12px',
    padding: '4px 12px',
    borderRadius: '100px',
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'capitalize' as const,
    zIndex: 3,
  } as React.CSSProperties,

  badgeKategori: {
    position: 'absolute' as const,
    bottom: '12px',
    left: '12px',
    padding: '4px 12px',
    borderRadius: '100px',
    fontSize: '11px',
    fontWeight: 700,
    backgroundColor: 'rgba(0,0,0,0.45)',
    color: '#ffffff',
    backdropFilter: 'blur(4px)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  } as React.CSSProperties,

  cardBody: {
    padding: '20px 20px 12px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
  } as React.CSSProperties,

  cardJudul: {
    fontSize: '17px',
    fontWeight: 700,
    color: 'var(--text-dark)',
    margin: 0,
    lineHeight: 1.3,
  } as React.CSSProperties,

  cardDeskripsi: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    margin: 0,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
  } as React.CSSProperties,

  cardFooter: {
    padding: '12px 20px 20px 20px',
  } as React.CSSProperties,

  cardFooterKunci: {
    padding: '16px 20px 20px 20px',
    borderTop: '1px solid rgba(99,102,241,0.12)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  } as React.CSSProperties,

  pesanKunci: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as React.CSSProperties,

  teksPesanKunci: {
    fontSize: '13px',
    color: '#94a3b8',
    fontWeight: 500,
  } as React.CSSProperties,

  grupTombolKunci: {
    display: 'flex',
    gap: '8px',
  } as React.CSSProperties,

  btnMasukKunci: {
    flex: 1,
    textAlign: 'center' as const,
    padding: '10px 0',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 700,
    textDecoration: 'none',
    backgroundColor: 'rgba(99,102,241,0.12)',
    color: '#818cf8',
    border: '1px solid rgba(99,102,241,0.2)',
  } as React.CSSProperties,

  btnDaftarKunci: {
    flex: 2,
    textAlign: 'center' as const,
    padding: '10px 0',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 700,
    textDecoration: 'none',
    backgroundColor: '#6366f1',
    color: '#ffffff',
    boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
  } as React.CSSProperties,

  btnPelajari: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    textAlign: 'center' as const,
    padding: '11px 0',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 700,
    textDecoration: 'none',
    transition: 'all 0.25s ease',
  } as React.CSSProperties,

  loadingWrap: {
    width: '100%',
  } as React.CSSProperties,

  skeletonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
  } as React.CSSProperties,

  skeletonCard: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    overflow: 'hidden',
    border: '1px solid rgba(244,166,35,0.08)',
  } as React.CSSProperties,

  skeletonImg: {
    width: '100%',
    height: '180px',
    background: 'linear-gradient(90deg, #f0f2f5 25%, #e8eaed 50%, #f0f2f5 75%)',
    backgroundSize: '800px 100%',
    animation: 'shimmer 1.5s infinite',
  } as React.CSSProperties,

  skeletonBody: {
    padding: '20px',
  } as React.CSSProperties,

  skeletonLine: {
    borderRadius: '6px',
    background: 'linear-gradient(90deg, #f0f2f5 25%, #e8eaed 50%, #f0f2f5 75%)',
    backgroundSize: '800px 100%',
    animation: 'shimmer 1.5s infinite',
  } as React.CSSProperties,

  kosong: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '80px 0',
  } as React.CSSProperties,

  teksKosong: {
    fontSize: '16px',
    color: 'var(--text-muted)',
    fontWeight: 500,
  } as React.CSSProperties,
};

export default MateriPage;
