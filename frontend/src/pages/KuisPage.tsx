import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BookOpen, Clock3, Lock, Sparkles, Trophy, Waves, CheckCircle, ArrowLeft } from 'lucide-react';
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

interface Soal {
  id: number;
  module_id: number;
  question: string;
  options: string[];
  answer: number;
}

const BATAS_SOAL_GUEST = 5;
const WAKTU_PER_SOAL = 15;
const AMBANG_LULUS = 0.7;

function KuisPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();
  const { theme, setTheme, colors } = useTheme();

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
  const [waktuSisa, setWaktuSisa] = useState(WAKTU_PER_SOAL);
  const [showTimeoutPopup, setShowTimeoutPopup] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [waktuMulaiKuis, setWaktuMulaiKuis] = useState<number | null>(null);

  const soalAktif = daftarSoal[indeksSoal] ?? null;
  const totalSoal = daftarSoal.length;

  const isGuest = !isAuthenticated;

  useEffect(() => {
    if (!isAuthenticated && theme !== 'light') {
      setTheme('light');
    }
  }, [isAuthenticated, theme, setTheme]);

  const activeTheme = isAuthenticated ? theme : 'light';
  const activeColors = isAuthenticated ? colors : themeStyles.light;

  useEffect(() => {
    if (!soalAktif || sudahJawab || selesai || loadingSoal) return;

    const timer = setInterval(() => {
      setWaktuSisa((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!sudahJawab) {
            setShowTimeoutPopup(true);
            setTimeout(() => {
              setShowTimeoutPopup(false);
              kembaliKeList();
            }, 2000);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [soalAktif, sudahJawab, selesai, loadingSoal]);

  useEffect(() => {
    setWaktuSisa(WAKTU_PER_SOAL);
  }, [indeksSoal]);

  useEffect(() => {
    const fetchMateri = async () => {
      setLoadingMateri(true);
      try {
        const response = await apiService.getMaterials(1, 100);
        const allMaterials = response.materials || [];
        setBankMateri(allMaterials);
      } catch (err) {
        console.error(err);
        setBankMateri([]);
      } finally {
        setLoadingMateri(false);
        setIsLoadingPage(false);
      }
    };
    fetchMateri();
  }, []);

  useEffect(() => {
    if (isLoadingPage || loadingMateri) return;
    
    if (!id) {
      navigate('/kuis', { replace: true });
      return;
    }
    
    const materi = bankMateri.find(m => m.id === Number(id));
    if (materi) {
      mulaKuis(materi);
    }
  }, [id, bankMateri, loadingMateri, isLoadingPage]);

  const ambilIdentitasArena = (materi: Materi) => {
    const parentIdKosong = materi.parent_id === null || materi.parent_id === undefined;
    if (parentIdKosong) {
      return { lessonId: String(materi.id), levelId: 1 };
    }
    const saudara = bankMateri.filter(m => m.parent_id === materi.parent_id);
    const idx = saudara.findIndex(m => m.id === materi.id);
    return { lessonId: String(materi.parent_id), levelId: idx + 2 };
  };

  const simpanProgresKuis = async (jumlahBenar: number, totalSoalDikerjakan: number) => {
    if (isGuest || !token || !materiAktif || totalSoalDikerjakan === 0) return;

    const skorPersen = Math.round((jumlahBenar / totalSoalDikerjakan) * 100);
    const waktuDipakai = waktuMulaiKuis
      ? Math.round((Date.now() - waktuMulaiKuis) / 1000)
      : 0;
    const lulus = jumlahBenar / totalSoalDikerjakan >= AMBANG_LULUS;
    const { lessonId, levelId } = ambilIdentitasArena(materiAktif);

    try {
      await apiService.submitQuiz(token, materiAktif.id, skorPersen, totalSoalDikerjakan, waktuDipakai);
      await apiService.updateArenaProgress(token, lessonId, levelId, lulus);
      if (typeof window !== 'undefined' && (window as any).refreshArenaProgress) {
        (window as any).refreshArenaProgress();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const mulaKuis = async (materi: Materi) => {
    if (isGuest && materi.status === 'Khusus Member') {
      navigate('/login');
      return;
    }

    setMateriAktif(materi);
    setSelesai(false);
    setIndeksSoal(0);
    setOpsiTerpilih(null);
    setSudahJawab(false);
    setSkorDapat(null);
    setTotalBenar(0);
    setWaktuSisa(WAKTU_PER_SOAL);
    setShowTimeoutPopup(false);
    setLoadingSoal(true);
    setWaktuMulaiKuis(Date.now()); 
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
      console.error(err);
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
      simpanProgresKuis(totalBenar, totalSoal);
      setSelesai(true);
      localStorage.setItem('arenaRefresh', Date.now().toString());
    } else {
      setIndeksSoal(p => p + 1);
      setOpsiTerpilih(null);
      setSudahJawab(false);
      setSkorDapat(null);
      setWaktuSisa(WAKTU_PER_SOAL);
    }
  };

  const kembaliKeList = () => {
    setMateriAktif(null);
    setDaftarSoal([]);
    setSelesai(false);
    setShowTimeoutPopup(false);
    navigate('/kuis', { replace: true });
  };

  const g = {
    wrapper: { width: '100%', minHeight: '100vh', backgroundColor: activeColors.background, paddingTop: '120px', paddingBottom: '80px', transition: 'background-color 0.2s' } as React.CSSProperties,
    container: { maxWidth: '1200px', margin: '0 auto', padding: '0 40px' } as React.CSSProperties,

    pageHeader: { marginBottom: '40px', display: 'flex', flexDirection: 'column' as const, gap: '10px' } as React.CSSProperties,
    labelKecil: { fontSize: '13px', fontWeight: 700, color: '#F4A623', letterSpacing: '2px' } as React.CSSProperties,
    pageJudul: { fontSize: '40px', fontWeight: 900, color: activeColors.text, margin: 0, lineHeight: 1.15 } as React.CSSProperties,
    pageSubjudul: { fontSize: '16px', color: activeColors.subtext, margin: 0 } as React.CSSProperties,

    grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' } as React.CSSProperties,

    card: {
      backgroundColor: activeColors.surface, border: `1px solid ${activeColors.border}`, borderRadius: '20px',
      overflow: 'hidden', display: 'flex', flexDirection: 'column' as const,
      cursor: 'pointer', transition: 'transform 0.3s cubic-bezier(0.25,1,0.5,1), box-shadow 0.3s ease, background-color 0.2s, border-color 0.2s',
      boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
    } as React.CSSProperties,

    cardTerkunci: {
      backgroundColor: activeTheme === 'dark' ? '#1e293b' : '#0f172a', border: `1px solid ${activeColors.border}`,
      boxShadow: '0 4px 24px rgba(99,102,241,0.08)', cursor: 'pointer',
    } as React.CSSProperties,

    cardImgWrap: { position: 'relative' as const, width: '100%', height: '180px', overflow: 'hidden', flexShrink: 0 } as React.CSSProperties,
    cardImg: { width: '100%', height: '100%', objectFit: 'cover' as const, display: 'block' } as React.CSSProperties,
    cardImgPlaceholder: { width: '100%', height: '100%', backgroundColor: activeColors.background, display: 'flex', alignItems: 'center', justifyContent: 'center' } as React.CSSProperties,

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

    badgeKategori: {
      position: 'absolute' as const, bottom: '12px', left: '12px',
      padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 700,
      backgroundColor: 'rgba(0,0,0,0.45)', color: '#ffffff', backdropFilter: 'blur(4px)',
      textTransform: 'uppercase' as const, letterSpacing: '0.5px', zIndex: 3,
    } as React.CSSProperties,

    cardBody: { padding: '20px 20px 12px 20px', display: 'flex', flexDirection: 'column' as const, gap: '6px', flex: 1 } as React.CSSProperties,
    cardKategori: { fontSize: '11px', fontWeight: 700, color: '#F4A623', textTransform: 'uppercase' as const, letterSpacing: '0.5px' } as React.CSSProperties,
    cardJudul: { fontSize: '16px', fontWeight: 700, margin: 0, lineHeight: 1.3 } as React.CSSProperties,

    cardFooter: { padding: '12px 20px 20px 20px' } as React.CSSProperties,
    btnMulai: {
      display: 'block', textAlign: 'center' as const, padding: '11px 0',
      borderRadius: '12px', fontSize: '14px', fontWeight: 700,
    } as React.CSSProperties,

    breadcrumb: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' } as React.CSSProperties,
    breadcrumbBtn: {
      background: 'none', border: 'none', padding: 0, fontSize: '14px',
      color: '#F4A623', fontWeight: 600, cursor: 'pointer',
    } as React.CSSProperties,
    sep: { fontSize: '14px', color: activeColors.border } as React.CSSProperties,
    breadcrumbAktif: { fontSize: '14px', color: activeColors.subtext, fontWeight: 500 } as React.CSSProperties,

    boxKuis: {
      backgroundColor: activeColors.surface, borderRadius: '24px',
      border: `1px solid ${activeColors.border}`, padding: '40px',
      boxShadow: activeTheme === 'dark' ? '0 12px 40px rgba(0, 0, 0, 0.3)' : '0 12px 40px rgba(244,166,35,0.05)',
      maxWidth: '700px', margin: '0 auto', transition: 'background-color 0.2s, border-color 0.2s',
    } as React.CSSProperties,

    headerKuis: { marginBottom: '32px' } as React.CSSProperties,
    badgeLive: { fontSize: '12px', fontWeight: 800, color: '#d97706', backgroundColor: '#fef3c7', padding: '6px 14px', borderRadius: '100px', display: 'inline-block', marginBottom: '12px' } as React.CSSProperties,
    badgeMember: { fontSize: '12px', fontWeight: 800, color: '#16a34a', backgroundColor: '#dcfce7', padding: '6px 14px', borderRadius: '100px', display: 'inline-block', marginBottom: '12px' } as React.CSSProperties,
    judulKuis: { fontSize: '24px', fontWeight: 800, color: activeColors.text, margin: 0, marginBottom: '20px' } as React.CSSProperties,
    barWaktu: { width: '100%', height: '6px', backgroundColor: activeColors.background, borderRadius: '100px', overflow: 'hidden' } as React.CSSProperties,
    isiWaktu: { width: '100%', height: '100%', backgroundColor: '#F4A623', borderRadius: '100px', transformOrigin: 'left' } as React.CSSProperties,

    areaPertanyaan: { marginBottom: '32px' } as React.CSSProperties,
    teksPertanyaan: { fontSize: '18px', fontWeight: 600, color: activeColors.text, lineHeight: 1.5, marginBottom: '24px' } as React.CSSProperties,
    opsiGrid: { display: 'flex', flexDirection: 'column' as const, gap: '12px' } as React.CSSProperties,

    tombolOpsi: {
      width: '100%', textAlign: 'left' as const, padding: '18px 24px',
      backgroundColor: activeColors.surface, border: `1px solid ${activeColors.border}`, borderRadius: '16px',
      fontSize: '15px', fontWeight: 500, color: activeColors.text, cursor: 'pointer',
      transition: 'all 0.2s ease', outline: 'none', WebkitAppearance: 'none' as any,
      appearance: 'none' as any, fontFamily: 'inherit', lineHeight: 1.5,
    } as React.CSSProperties,

    opsiBenar: { backgroundColor: activeTheme === 'dark' ? '#064e3b' : '#ecfdf5', border: '1px solid #10b981', color: activeTheme === 'dark' ? '#a7f3d0' : '#065f46', fontWeight: 700, boxShadow: '0 4px 12px rgba(16,185,129,0.1)', outline: 'none', cursor: 'default' } as React.CSSProperties,
    opsiSalah: { backgroundColor: activeTheme === 'dark' ? '#7f1d1d' : '#fef2f2', border: '1px solid #ef4444', color: activeTheme === 'dark' ? '#fca5a5' : '#991b1b', fontWeight: 700, boxShadow: '0 4px 12px rgba(239,68,68,0.1)', outline: 'none', cursor: 'default' } as React.CSSProperties,
    opsiRedup: { opacity: 0.35, backgroundColor: activeColors.background, border: `1px solid ${activeColors.border}`, outline: 'none', cursor: 'default' } as React.CSSProperties,

    kotakFeedback: { padding: '24px', borderRadius: '20px', border: `1px solid ${activeColors.border}`, marginBottom: '0', display: 'flex', flexDirection: 'column' as const, gap: '16px', transition: 'background-color 0.2s, border-color 0.2s' } as React.CSSProperties,
    feedbackTeks: { display: 'flex', alignItems: 'center', gap: '12px' } as React.CSSProperties,
    wrapperCta: { borderTop: `1px solid ${activeColors.border}`, paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: '12px' } as React.CSSProperties,
    teksGembok: { fontSize: '13px', fontWeight: 600, color: activeColors.text, margin: 0 } as React.CSSProperties,
    grupTombol: { display: 'flex', gap: '10px', flexWrap: 'wrap' as const } as React.CSSProperties,
    btnDaftarFeedback: { padding: '10px 20px', backgroundColor: '#F4A623', color: '#ffffff', textDecoration: 'none', fontSize: '13px', fontWeight: 700, borderRadius: '10px', boxShadow: '0 4px 12px rgba(244,166,35,0.2)' } as React.CSSProperties,
    btnKembali: { padding: '10px 20px', backgroundColor: activeColors.background, color: activeColors.text, border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' } as React.CSSProperties,
    btnKembaliSoal: { display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 20px', backgroundColor: 'transparent', color: activeColors.subtext, border: `1.5px solid ${activeColors.border}`, borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginTop: '8px', transition: 'all 0.2s ease' } as React.CSSProperties,

    skeletonGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' } as React.CSSProperties,
    skeletonCard: { backgroundColor: activeColors.surface, borderRadius: '20px', overflow: 'hidden', border: `1px solid ${activeColors.border}` } as React.CSSProperties,
    skeletonImg: {
      width: '100%', height: '180px',
      background: activeTheme === 'dark' 
        ? 'linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)'
        : 'linear-gradient(90deg, #f0f2f5 25%, #e8eaed 50%, #f0f2f5 75%)',
      backgroundSize: '800px 100%', animation: 'shimmer 1.5s infinite'
    } as React.CSSProperties,
    skeletonLine: {
      borderRadius: '6px',
      background: activeTheme === 'dark' 
        ? 'linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)'
        : 'linear-gradient(90deg, #f0f2f5 25%, #e8eaed 50%, #f0f2f5 75%)',
      backgroundSize: '800px 100%', animation: 'shimmer 1.5s infinite'
    } as React.CSSProperties,
    skeletonBody: {
      padding: '20px',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
    } as React.CSSProperties,

    overlayPopup: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: activeTheme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      animation: 'fadeIn 0.3s ease',
    } as React.CSSProperties,

    popup: {
      backgroundColor: activeColors.surface,
      borderRadius: '24px',
      padding: '40px',
      maxWidth: '420px',
      width: '90%',
      textAlign: 'center' as const,
      boxShadow: '0 30px 60px rgba(0,0,0,0.2)',
      border: `1px solid ${activeColors.border}`,
      animation: 'fadeIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
    } as React.CSSProperties,

    popupJudul: {
      fontSize: '24px',
      fontWeight: 800,
      color: activeColors.text,
      margin: '16px 0 8px 0',
    } as React.CSSProperties,

    popupDeskripsi: {
      fontSize: '15px',
      color: activeColors.subtext,
      lineHeight: 1.6,
      margin: '0 0 20px 0',
    } as React.CSSProperties,

    popupFooter: {
      borderTop: `1px solid ${activeColors.border}`,
      paddingTop: '16px',
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
      color: activeColors.subtext,
      fontWeight: 500,
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
  };

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
            {loadingSoal && <p style={{ color: activeColors.subtext, textAlign: 'center', padding: '40px 0' }}>Memuat soal...</p>}

            {!loadingSoal && totalSoal === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <span style={{ display: 'inline-flex' }}><Sparkles size={48} color="#F4A623" /></span>
                <p style={{ marginTop: '16px', color: activeColors.subtext, fontWeight: 500 }}>Belum ada soal untuk materi ini.</p>
                <button 
                  onClick={kembaliKeList} 
                  style={{ ...g.btnKembali, marginTop: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <ArrowLeft size={18} />
                  <span>Kembali ke Daftar</span>
                </button>
              </div>
            )}

            {!loadingSoal && selesai && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <span style={{ display: 'inline-flex' }}>
                  {totalBenar === totalSoal ? <Trophy size={48} color="#F4A623" /> : <Sparkles size={48} color="#6366f1" />}
                </span>
                <h2 style={{ ...g.judulKuis, textAlign: 'center', marginTop: '16px' }}>Kuis Selesai!</h2>
                <div style={{ ...g.kotakFeedback, backgroundColor: totalBenar >= totalSoal * 0.7 ? (activeTheme === 'dark' ? '#064e3b' : '#f0fdf4') : (activeTheme === 'dark' ? '#7f1d1d' : '#fffcf5') }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <p style={{ fontSize: '20px', fontWeight: 700, color: activeColors.text, margin: 0 }}>
                      Skor kamu: <strong style={{ color: '#F4A623' }}>{Math.round((totalBenar / totalSoal) * 100)}%</strong>
                    </p>
                    <p style={{ fontSize: '16px', color: activeColors.subtext, margin: 0 }}>
                      Kamu menjawab benar <strong style={{ color: '#F4A623' }}>{totalBenar} dari {totalSoal}</strong> soal.
                    </p>
                  </div>
                  {isGuest && (
                    <div style={g.wrapperCta}>
                      <p style={g.teksGembok}><Lock size={16} style={{ marginRight: '6px' }} /> Daftar untuk simpan skor & akses semua kuis!</p>
                      <div style={g.grupTombol}>
                        <button onClick={kembaliKeList} style={{ ...g.btnDaftarFeedback, backgroundColor: activeColors.background, color: activeColors.text, boxShadow: 'none', border: 'none', cursor: 'pointer' }}>
                          Materi Lain
                        </button>
                        <Link to="/daftar" style={g.btnDaftarFeedback}>Daftar Akun</Link>
                      </div>
                    </div>
                  )}
                  {!isGuest && (
                    <div style={g.wrapperCta}>
                      <button onClick={kembaliKeList} style={{ ...g.btnDaftarFeedback, backgroundColor: activeColors.background, color: activeColors.text, boxShadow: 'none', border: 'none', cursor: 'pointer' }}>
                        Materi Lain
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!loadingSoal && !selesai && soalAktif && (
              <>
                <div style={g.headerKuis}>
                  {isGuest ? (
                    <span style={g.badgeLive}>
                      <Waves size={14} style={{ marginRight: '6px' }} />
                      MODE TEASER GRATIS
                    </span>
                  ) : (
                    <span style={g.badgeMember}>
                      <CheckCircle size={14} style={{ marginRight: '6px' }} />
                      AKTIF
                    </span>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h2 style={{ ...g.judulKuis, marginBottom: 0 }}>{materiAktif.title}</h2>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: activeColors.subtext }}>{indeksSoal + 1} / {totalSoal}</span>
                  </div>
                  <div style={g.barWaktu}>
                    <div 
                      style={{ 
                        ...g.isiWaktu, 
                        width: `${(waktuSisa / WAKTU_PER_SOAL) * 100}%`,
                        animation: 'none',
                        transition: 'width 0.3s ease',
                        backgroundColor: waktuSisa <= 5 ? '#ef4444' : '#F4A623',
                      }} 
                    />
                  </div>
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
                  <div style={{ ...g.kotakFeedback, backgroundColor: skorDapat === 100 ? (activeTheme === 'dark' ? '#064e3b' : '#f0fdf4') : (activeTheme === 'dark' ? '#7f1d1d' : '#fef2f2'), borderColor: skorDapat === 100 ? '#bbf7d0' : '#fecaca' }}>
                    <div style={g.feedbackTeks}>
                      <span style={{ display: 'inline-flex' }}>{skorDapat === 100 ? <Trophy size={24} color="#16a34a" /> : <Clock3 size={24} color="#dc2626" />}</span>
                      <h4 style={{ margin: 0, color: skorDapat === 100 ? (activeTheme === 'dark' ? '#a7f3d0' : '#166534') : (activeTheme === 'dark' ? '#fca5a5' : '#991b1b'), fontWeight: 700 }}>
                        {skorDapat === 100 ? 'Jawaban Kamu Benar!' : 'Yah, Jawaban Kurang Tepat!'}
                      </h4>
                    </div>
                    <div style={g.wrapperCta}>
                      {isGuest && (
                        <p style={g.teksGembok}><Lock size={16} style={{ marginRight: '6px' }} /> Simpan skor & klaim hadiahmu!</p>
                      )}
                      <div style={g.grupTombol}>
                        <button onClick={soalBerikutnya} style={{ ...g.btnDaftarFeedback, border: 'none', cursor: 'pointer' }}>
                          {indeksSoal + 1 < totalSoal ? 'Soal Berikutnya' : 'Lihat Hasil'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {showTimeoutPopup && (
          <div style={g.overlayPopup}>
            <div style={g.popup}>
              <Clock3 size={48} color="#ef4444" />
              <h3 style={g.popupJudul}>Yah, Waktu Habis!</h3>
              <p style={g.popupDeskripsi}>Kamu belum menjawab soal ini tepat waktu. Ayo lebih cepat di lain waktu!</p>
              <div style={g.popupFooter}>
                <span style={{ fontSize: '14px', color: '#94a3b8' }}>Mengalihkan ke daftar kuis...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={g.wrapper}>
      <div style={g.container}>
        <div style={g.pageHeader}>
          <span style={g.labelKecil}>TANTANG DIRIMU</span>
          <h1 style={g.pageJudul}>Arena Kuis</h1>
          <p style={g.pageSubjudul}>Pilih materi di bawah lalu mulai kuis interaktif. Uji seberapa jauh pemahamanmu!</p>
        </div>

        {loadingMateri || isLoadingPage ? (
          <div style={g.skeletonGrid} className="grid-materi-mobile">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={g.skeletonCard}>
                <div style={g.skeletonImg} />
                <div style={g.skeletonBody}>
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
              const terkunci = isKhusus && isGuest;
              return (
                <article
                  key={m.id}
                  style={{ ...g.card, ...(terkunci ? g.cardTerkunci : {}) }}
                  onClick={() => {
                    if (terkunci) {
                      navigate('/login');
                      return;
                    }
                    mulaKuis(m);
                  }}
                >
                  <div style={g.cardImgWrap}>
                    {m.img
                      ? <img src={m.img} alt={m.title} style={{ ...g.cardImg, ...(terkunci ? { filter: 'blur(4px) brightness(0.5)' } : {}) }} />
                      : <div style={g.cardImgPlaceholder}><span style={{ display: 'inline-flex' }}><BookOpen size={40} color="#ffffff" /></span></div>
                    }
                    {terkunci && (
                      <div style={g.overlayKunci}>
                        <div style={g.ikonKunci}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                          </svg>
                        </div>
                        <span style={g.teksKunciOverlay}>Khusus Member</span>
                      </div>
                    )}
                    <span style={{
                      ...g.badgeStatus,
                      backgroundColor: isKhusus ? 'rgba(99,102,241,0.12)' : 'rgba(244,166,35,0.1)',
                      color: isKhusus ? '#6366f1' : '#F4A623',
                    }}>
                      {isKhusus ? <><Lock size={14} style={{ marginRight: '4px' }} /></> : null}{m.status}
                    </span>
                    <span style={g.badgeKategori}>{m.category}</span>
                  </div>

                  <div style={g.cardBody}>
                    <h3 style={g.cardJudul}>{m.title}</h3>
                  </div>

                  <div style={g.cardFooter}>
                    <span style={{
                      ...g.btnMulai,
                      backgroundColor: terkunci ? 'rgba(99,102,241,0.08)' : 'rgba(244,166,35,0.08)',
                      color: terkunci ? '#6366f1' : '#F4A623',
                    }}>
                      {terkunci ? <><Lock size={14} style={{ marginRight: '4px' }} /> Masuk untuk Akses</> : <><Waves size={14} style={{ marginRight: '4px' }} /> Mulai Kuis</>}
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
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
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

export default KuisPage;