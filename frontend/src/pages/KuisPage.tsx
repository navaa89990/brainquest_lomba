import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';
import { apiService } from '../lib/apiService';

interface Materi {
  id: number;
  title: string;
  content: string;
  category: string;
  img?: string;
  status?: string;
}

interface Soal {
  id: number;
  module_id: number;
  question: string;
  options: string[];
  answer: number;
}

const BATAS_SOAL_GUEST = 5;

function KuisPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [bankMateri, setBankMateri] = useState<Materi[]>([]);
  const [loadingMateri, setLoadingMateri] = useState(true);

  const [daftarSoal, setDaftarSoal] = useState<Soal[]>([]);
  const [indeksSoal, setIndeksSoal] = useState(0);
  const [opsiTerpilih, setOpsiTerpilih] = useState<number | null>(null);
  const [sudahJawab, setSudahJawab] = useState(false);
  const [skorDapat, setSkorDapat] = useState<number | null>(null);
  const [loadingSoal, setLoadingSoal] = useState(false);
  const [selesai, setSelesai] = useState(false);
  const [totalBenar, setTotalBenar] = useState(0);
  const [materiAktif, setMateriAktif] = useState<Materi | null>(null);

  const soalAktif = daftarSoal[indeksSoal] ?? null;
  const totalSoal = daftarSoal.length;

  useEffect(() => {
    const fetchMateri = async () => {
      setLoadingMateri(true);
      try {
        const response = await apiService.getMaterials(1, 100);
        setBankMateri(response.materials || []);
      } catch (err) {
        console.error('Error loading quiz materials:', err);
        setBankMateri([]);
      } finally {
        setLoadingMateri(false);
      }
    };
    fetchMateri();
  }, []);

  useEffect(() => {
    if (!id) return;
    const materi = bankMateri.find(m => m.id === Number(id));
    if (materi) mulaKuis(materi);
  }, [id, bankMateri]);

  const mulaKuis = async (materi: Materi) => {
    const terkunci = materi.status === 'Khusus Member' && !isAuthenticated;
    if (terkunci) { navigate('/login'); return; }
    setMateriAktif(materi);
    setSelesai(false);
    setIndeksSoal(0);
    setOpsiTerpilih(null);
    setSudahJawab(false);
    setSkorDapat(null);
    setTotalBenar(0);
    setLoadingSoal(true);
    try {
      const response = await apiService.getMaterialDetail(materi.id);
      const questionData = response.questions || [];
      const valid = questionData
        .map((q: any) => {
          const options = [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean);
          const answer = options.findIndex((opt) => opt === q.correct_answer);
          return {
            id: q.id,
            module_id: materi.id,
            question: q.question_text,
            options,
            answer: answer >= 0 ? answer : 0,
          } as Soal;
        })
        .filter((s: any) => s.question && Array.isArray(s.options) && s.options.length > 0)
        .slice(0, BATAS_SOAL_GUEST);
      setDaftarSoal(valid);
    } catch (err) {
      console.error('Gagal memuat soal:', err);
      setDaftarSoal([]);
    } finally {
      setLoadingSoal(false);
    }
  };

  const cekJawaban = (indeksOpsi: number) => {
    if (sudahJawab || !soalAktif) return;
    setOpsiTerpilih(indeksOpsi);
    setSudahJawab(true);
    const benar = indeksOpsi === soalAktif.answer;
    setSkorDapat(benar ? 100 : 0);
    if (benar) setTotalBenar(p => p + 1);
  };

  const soalBerikutnya = () => {
    if (indeksSoal + 1 >= totalSoal) {
      setSelesai(true);
    } else {
      setIndeksSoal(p => p + 1);
      setOpsiTerpilih(null);
      setSudahJawab(false);
      setSkorDapat(null);
    }
  };

  const kembaliKeList = () => {
    setMateriAktif(null);
    setDaftarSoal([]);
    setSelesai(false);
    navigate('/kuis', { replace: true });
  };

  // ── TAMPILAN KUIS ──
  if (materiAktif) {
    return (
      <div style={g.wrapper}>
        <div style={g.container}>
          <nav style={g.breadcrumb}>
            <button onClick={kembaliKeList} style={g.breadcrumbBtn}>Arena Kuis</button>
            <span style={g.sep}>›</span>
            <span style={g.breadcrumbAktif}>{materiAktif.title}</span>
          </nav>

          <div style={g.boxKuis}>
            {loadingSoal && <p style={{ color: '#64748b', textAlign: 'center', padding: '40px 0' }}>Memuat soal...</p>}

            {!loadingSoal && totalSoal === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <span style={{ fontSize: '48px' }}>📭</span>
                <p style={{ marginTop: '16px', color: '#64748b', fontWeight: 500 }}>Belum ada soal untuk materi ini.</p>
                <button onClick={kembaliKeList} style={{ ...g.btnKembali, marginTop: '20px' }}>← Kembali ke Daftar</button>
              </div>
            )}

            {!loadingSoal && selesai && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <span style={{ fontSize: '48px' }}>{totalBenar === totalSoal ? '🏆' : '📊'}</span>
                <h2 style={{ ...g.judulKuis, textAlign: 'center', marginTop: '16px' }}>Kuis Selesai!</h2>
                <p style={{ fontSize: '16px', color: '#475569', marginBottom: '8px' }}>
                  Kamu menjawab benar <strong style={{ color: 'var(--primary-purple)' }}>{totalBenar} dari {totalSoal}</strong> soal.
                </p>
                <div style={{ ...g.kotakFeedback, backgroundColor: '#fffcf5', borderColor: 'rgba(244,166,35,0.2)', marginTop: '24px' }}>
                  <div style={g.wrapperCta}>
                    <p style={g.teksGembok}>🔒 Daftar untuk simpan skor & akses soal tanpa batas!</p>
                    <div style={g.grupTombol}>
                      <button onClick={kembaliKeList} style={{ ...g.btnDaftarFeedback, backgroundColor: '#f0f2f5', color: 'var(--text-dark)', boxShadow: 'none', border: 'none', cursor: 'pointer' }}>
                        Materi Lain
                      </button>
                      <Link to="/daftar" style={g.btnDaftarFeedback}>Daftar Akun</Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!loadingSoal && !selesai && soalAktif && (
              <>
                <div style={g.headerKuis}>
                  <span style={g.badgeLive}>⚡ MODE TEASER GRATIS</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h2 style={{ ...g.judulKuis, marginBottom: 0 }}>{materiAktif.title}</h2>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>{indeksSoal + 1} / {totalSoal}</span>
                  </div>
                  <div style={g.barWaktu}><div style={g.isiWaktu} key={indeksSoal} /></div>
                </div>

                <div style={g.areaPertanyaan}>
                  <p style={g.teksPertanyaan}>{soalAktif.question}</p>
                  <div style={g.opsiGrid}>
                    {soalAktif.options.map((opsi, indeks) => {
                      let kustom = {};
                      if (sudahJawab) {
                        if (indeks === soalAktif.answer) kustom = g.opsiBenar;
                        else if (opsiTerpilih === indeks) kustom = g.opsiSalah;
                        else kustom = g.opsiRedup;
                      }
                      return (
                        <button key={indeks} style={{ ...g.tombolOpsi, ...kustom }} onClick={() => cekJawaban(indeks)} disabled={sudahJawab}>
                          {opsi}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {!sudahJawab && (
                  <button onClick={kembaliKeList} style={g.btnKembaliSoal}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="19" y1="12" x2="5" y2="12"/>
                      <polyline points="12 19 5 12 12 5"/>
                    </svg>
                    Kembali ke Daftar
                  </button>
                )}

                {sudahJawab && (
                  <div style={{ ...g.kotakFeedback, backgroundColor: skorDapat === 100 ? '#f0fdf4' : '#fef2f2', borderColor: skorDapat === 100 ? '#bbf7d0' : '#fecaca' }}>
                    <div style={g.feedbackTeks}>
                      <span style={{ fontSize: '24px' }}>{skorDapat === 100 ? '🎉' : '😢'}</span>
                      <h4 style={{ margin: 0, color: skorDapat === 100 ? '#166534' : '#991b1b', fontWeight: 700 }}>
                        {skorDapat === 100 ? 'Jawaban Kamu Benar!' : 'Yah, Jawaban Kurang Tepat!'}
                      </h4>
                    </div>
                    <div style={g.wrapperCta}>
                      <p style={g.teksGembok}>🔒 Simpan skor & klaim hadiahmu!</p>
                      <div style={g.grupTombol}>
                        <button onClick={soalBerikutnya} style={{ ...g.btnDaftarFeedback, border: 'none', cursor: 'pointer' }}>
                          {indeksSoal + 1 < totalSoal ? 'Soal Berikutnya' : 'Lihat Hasil'}
                        </button>
                        <Link to="/daftar" style={{ ...g.btnDaftarFeedback, backgroundColor: '#ffffff', color: 'var(--primary-purple)', border: '1px solid rgba(244,166,35,0.3)' }}>
                          Daftar Akun
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── TAMPILAN LIST MATERI ──
  return (
    <div style={g.wrapper}>
      <div style={g.container}>
        <div style={g.pageHeader}>
          <span style={g.labelKecil}>TANTANG DIRIMU</span>
          <h1 style={g.pageJudul}>Arena Kuis</h1>
          <p style={g.pageSubjudul}>Pilih materi di bawah lalu mulai kuis interaktif. Uji seberapa jauh pemahamanmu!</p>
        </div>

        {loadingMateri ? (
          <div style={g.skeletonGrid} className="grid-materi-mobile">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={g.skeletonCard}>
                <div style={g.skeletonImg} />
                <div style={{ padding: '20px' }}>
                  <div style={{ ...g.skeletonLine, width: '40%', height: '16px' }} />
                  <div style={{ ...g.skeletonLine, width: '80%', height: '20px', marginTop: '10px' }} />
                  <div style={{ ...g.skeletonLine, width: '60%', height: '14px', marginTop: '8px' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={g.grid} className="grid-materi-mobile">
            {bankMateri.map(m => {
              const isKhusus = m.status === 'Khusus Member';
              const terkunci = isKhusus && !isAuthenticated;
              return (
                <article
                  key={m.id}
                  style={{ ...g.card, ...(terkunci ? g.cardTerkunci : {}) }}
                  onClick={() => mulaKuis(m)}
                >
                  <div style={g.cardImgWrap}>
                    {m.img
                      ? <img src={m.img} alt={m.title} style={{ ...g.cardImg, ...(terkunci ? { filter: 'blur(4px) brightness(0.5)' } : {}) }} />
                      : <div style={g.cardImgPlaceholder}><span style={{ fontSize: '40px' }}>📚</span></div>
                    }
                    {terkunci && (
                      <div style={g.overlayKunci}>
                        <div style={g.ikonKunci}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                          </svg>
                        </div>
                        <span style={g.teksKunciOverlay}>Khusus Member</span>
                      </div>
                    )}
                    <span style={{
                      ...g.badgeStatus,
                      backgroundColor: isKhusus ? 'rgba(99,102,241,0.12)' : 'rgba(244,166,35,0.1)',
                      color: isKhusus ? '#6366f1' : 'var(--primary-purple)',
                    }}>
                      {isKhusus ? '🔒 ' : ''}{m.status}
                    </span>
                  </div>
                  <div style={g.cardBody}>
                    <span style={g.cardKategori}>{m.category}</span>
                    <h3 style={{ ...g.cardJudul, color: terkunci ? '#94a3b8' : 'var(--text-dark)' }}>{m.title}</h3>
                  </div>
                  <div style={g.cardFooter}>
                    <span style={{
                      ...g.btnMulai,
                      backgroundColor: terkunci ? 'rgba(99,102,241,0.08)' : 'rgba(244,166,35,0.08)',
                      color: terkunci ? '#6366f1' : 'var(--primary-purple)',
                    }}>
                      {terkunci ? '🔒 Masuk untuk Akses' : '⚡ Mulai Kuis'}
                    </span>
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
        @keyframes jalanWaktu {
          0% { transform: scaleX(1); }
          100% { transform: scaleX(0); }
        }
        @media (max-width: 968px) {
          .grid-materi-mobile { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 560px) {
          .grid-materi-mobile { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const g = {
  wrapper: { width: '100%', minHeight: '100vh', backgroundColor: 'var(--bg-gray)', paddingTop: '120px', paddingBottom: '80px' } as React.CSSProperties,
  container: { maxWidth: '1200px', margin: '0 auto', padding: '0 40px' } as React.CSSProperties,

  pageHeader: { marginBottom: '40px', display: 'flex', flexDirection: 'column' as const, gap: '10px' } as React.CSSProperties,
  labelKecil: { fontSize: '13px', fontWeight: 700, color: 'var(--primary-purple)', letterSpacing: '2px' } as React.CSSProperties,
  pageJudul: { fontSize: '40px', fontWeight: 900, color: 'var(--text-dark)', margin: 0, lineHeight: 1.15 } as React.CSSProperties,
  pageSubjudul: { fontSize: '16px', color: 'var(--text-muted)', margin: 0 } as React.CSSProperties,

  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' } as React.CSSProperties,

  card: {
    backgroundColor: '#ffffff', border: '1px solid rgba(244,166,35,0.1)', borderRadius: '20px',
    overflow: 'hidden', display: 'flex', flexDirection: 'column' as const,
    cursor: 'pointer', transition: 'transform 0.3s cubic-bezier(0.25,1,0.5,1), box-shadow 0.3s ease',
    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
  } as React.CSSProperties,

  cardTerkunci: {
    backgroundColor: '#0f172a', border: '1px solid rgba(99,102,241,0.2)',
    boxShadow: '0 4px 24px rgba(99,102,241,0.08)', cursor: 'pointer',
  } as React.CSSProperties,

  cardImgWrap: { position: 'relative' as const, width: '100%', height: '180px', overflow: 'hidden', flexShrink: 0 } as React.CSSProperties,
  cardImg: { width: '100%', height: '100%', objectFit: 'cover' as const, display: 'block' } as React.CSSProperties,
  cardImgPlaceholder: { width: '100%', height: '100%', backgroundColor: 'var(--light-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties,

  overlayKunci: {
    position: 'absolute' as const, inset: 0, display: 'flex', flexDirection: 'column' as const,
    alignItems: 'center', justifyContent: 'center', gap: '8px', zIndex: 2,
  } as React.CSSProperties,

  ikonKunci: {
    width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(99,102,241,0.85)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 0 8px rgba(99,102,241,0.15)',
  } as React.CSSProperties,

  teksKunciOverlay: {
    fontSize: '12px', fontWeight: 700, color: '#ffffff',
    backgroundColor: 'rgba(0,0,0,0.5)', padding: '4px 12px', borderRadius: '100px',
  } as React.CSSProperties,

  badgeStatus: {
    position: 'absolute' as const, top: '12px', right: '12px',
    padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 700, zIndex: 3,
  } as React.CSSProperties,

  cardBody: { padding: '20px 20px 12px 20px', display: 'flex', flexDirection: 'column' as const, gap: '6px', flex: 1 } as React.CSSProperties,
  cardKategori: { fontSize: '11px', fontWeight: 700, color: 'var(--primary-purple)', textTransform: 'uppercase' as const, letterSpacing: '0.5px' } as React.CSSProperties,
  cardJudul: { fontSize: '16px', fontWeight: 700, margin: 0, lineHeight: 1.3 } as React.CSSProperties,

  cardFooter: { padding: '12px 20px 20px 20px' } as React.CSSProperties,
  btnMulai: {
    display: 'block', textAlign: 'center' as const, padding: '11px 0',
    borderRadius: '12px', fontSize: '14px', fontWeight: 700,
  } as React.CSSProperties,

  breadcrumb: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' } as React.CSSProperties,
  breadcrumbBtn: {
    background: 'none', border: 'none', padding: 0, fontSize: '14px',
    color: 'var(--primary-purple)', fontWeight: 600, cursor: 'pointer',
  } as React.CSSProperties,
  sep: { fontSize: '14px', color: '#cbd5e1' } as React.CSSProperties,
  breadcrumbAktif: { fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 } as React.CSSProperties,

  boxKuis: {
    backgroundColor: '#ffffff', borderRadius: '24px',
    border: '1px solid rgba(244,166,35,0.12)', padding: '40px',
    boxShadow: '0 12px 40px rgba(244,166,35,0.05)',
    maxWidth: '700px', margin: '0 auto',
  } as React.CSSProperties,

  headerKuis: { marginBottom: '32px' } as React.CSSProperties,
  badgeLive: { fontSize: '12px', fontWeight: 800, color: '#d97706', backgroundColor: '#fef3c7', padding: '6px 14px', borderRadius: '100px', display: 'inline-block', marginBottom: '12px' } as React.CSSProperties,
  judulKuis: { fontSize: '24px', fontWeight: 800, color: 'var(--text-dark)', margin: 0, marginBottom: '20px' } as React.CSSProperties,
  barWaktu: { width: '100%', height: '6px', backgroundColor: '#f0f2f5', borderRadius: '100px', overflow: 'hidden' } as React.CSSProperties,
  isiWaktu: { width: '100%', height: '100%', backgroundColor: 'var(--primary-purple)', borderRadius: '100px', animation: 'jalanWaktu 15s linear forwards', transformOrigin: 'left' } as React.CSSProperties,

  areaPertanyaan: { marginBottom: '32px' } as React.CSSProperties,
  teksPertanyaan: { fontSize: '18px', fontWeight: 600, color: 'var(--text-dark)', lineHeight: 1.5, marginBottom: '24px' } as React.CSSProperties,
  opsiGrid: { display: 'flex', flexDirection: 'column' as const, gap: '12px' } as React.CSSProperties,

  tombolOpsi: {
    width: '100%', textAlign: 'left' as const, padding: '18px 24px',
    backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px',
    fontSize: '15px', fontWeight: 500, color: 'var(--text-dark)', cursor: 'pointer',
    transition: 'all 0.2s ease', outline: 'none', WebkitAppearance: 'none' as any,
    appearance: 'none' as any, fontFamily: 'inherit', lineHeight: 1.5,
  } as React.CSSProperties,

  opsiBenar: { backgroundColor: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', fontWeight: 700, boxShadow: '0 4px 12px rgba(16,185,129,0.1)', outline: 'none', cursor: 'default' } as React.CSSProperties,
  opsiSalah: { backgroundColor: '#fef2f2', border: '1px solid #ef4444', color: '#991b1b', fontWeight: 700, boxShadow: '0 4px 12px rgba(239,68,68,0.1)', outline: 'none', cursor: 'default' } as React.CSSProperties,
  opsiRedup: { opacity: 0.5, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', outline: 'none', cursor: 'default' } as React.CSSProperties,

  kotakFeedback: { padding: '24px', borderRadius: '20px', border: '1px solid', marginBottom: '0', display: 'flex', flexDirection: 'column' as const, gap: '16px' } as React.CSSProperties,
  feedbackTeks: { display: 'flex', alignItems: 'center', gap: '12px' } as React.CSSProperties,
  wrapperCta: { borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: '12px' } as React.CSSProperties,
  teksGembok: { fontSize: '13px', fontWeight: 600, color: '#475569', margin: 0 } as React.CSSProperties,
  grupTombol: { display: 'flex', gap: '10px', flexWrap: 'wrap' as const } as React.CSSProperties,
  btnDaftarFeedback: { padding: '10px 20px', backgroundColor: 'var(--primary-purple)', color: '#ffffff', textDecoration: 'none', fontSize: '13px', fontWeight: 700, borderRadius: '10px', boxShadow: '0 4px 12px rgba(244,166,35,0.2)' } as React.CSSProperties,
  btnKembali: { padding: '10px 20px', backgroundColor: '#f0f2f5', color: 'var(--text-dark)', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' } as React.CSSProperties,
  btnKembaliSoal: { display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 20px', backgroundColor: 'transparent', color: 'var(--text-muted)', border: '1.5px solid rgba(244,166,35,0.2)', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginTop: '8px', transition: 'all 0.2s ease' } as React.CSSProperties,

  skeletonGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' } as React.CSSProperties,
  skeletonCard: { backgroundColor: '#ffffff', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(244,166,35,0.08)' } as React.CSSProperties,
  skeletonImg: { width: '100%', height: '180px', background: 'linear-gradient(90deg, #f0f2f5 25%, #e8eaed 50%, #f0f2f5 75%)', backgroundSize: '800px 100%', animation: 'shimmer 1.5s infinite' } as React.CSSProperties,
  skeletonLine: { borderRadius: '6px', background: 'linear-gradient(90deg, #f0f2f5 25%, #e8eaed 50%, #f0f2f5 75%)', backgroundSize: '800px 100%', animation: 'shimmer 1.5s infinite' } as React.CSSProperties,
};

export default KuisPage;
