import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/useAuth';
import { apiService } from '../../lib/apiService';
import { useTheme } from '../../lib/ThemeContext';
import { styles } from './dashboardStyles';
import { CheckCircle2, Play, BookOpen, Trophy, Clock } from 'lucide-react';

type StatusLevel = 'selesai' | 'aktif' | 'terkunci';

type TitikPeta = {
  x: number;
  y: number;
};

type LevelKuis = {
  id: number;
  judul: string;
  materi: string;
  xp: number;
  estimasi: string;
  deskripsi: string;
  titik: TitikPeta;
  levelNumber: number;
  materialId: number;
  isCompleted?: boolean;
  hasQuestions?: boolean;
};

type PelajaranKuis = {
  id: string;
  nama: string;
  warna: string;
  warnaGelap: string;
  ringkas: string;
  level: LevelKuis[];
};

const ukuranPeta = {
  lebar: 640,
  tinggi: 720,
  radiusNode: 46,
};

const getCategoryColors = (category: string) => {
  const colors: { [key: string]: { warna: string; warnaGelap: string } } = {
    'Pemrograman': { warna: '#f59e0b', warnaGelap: '#d97706' },
    'Matematika': { warna: '#6366f1', warnaGelap: '#4f46e5' },
    'Bahasa Inggris': { warna: '#10b981', warnaGelap: '#047857' },
    'Bahasa Indonesia': { warna: '#ef4444', warnaGelap: '#b91c1c' },
    'Pengetahuan Umum': { warna: '#8b5cf6', warnaGelap: '#7c3aed' },
    'Sains': { warna: '#06b6d4', warnaGelap: '#0891b2' },
    'Fisika': { warna: '#3b82f6', warnaGelap: '#1d4ed8' },
    'Kimia': { warna: '#8b5cf6', warnaGelap: '#7c3aed' },
    'Biologi': { warna: '#10b981', warnaGelap: '#047857' },
  };
  return colors[category] || { warna: '#94a3b8', warnaGelap: '#64748b' };
};

const getEstimasi = (levelNumber: number) => {
  if (levelNumber <= 2) return '5 menit';
  if (levelNumber <= 4) return '8 menit';
  return '10 menit';
};

const getXp = (levelNumber: number) => {
  return 100 + (levelNumber * 50);
};

const buatPathLengkung = (awal: TitikPeta, akhir: TitikPeta, index: number) => {
  const dx = akhir.x - awal.x;
  const dy = akhir.y - awal.y;
  const panjang = Math.hypot(dx, dy) || 1;
  const unitX = dx / panjang;
  const unitY = dy / panjang;
  const mulai = {
    x: awal.x + unitX * ukuranPeta.radiusNode,
    y: awal.y + unitY * ukuranPeta.radiusNode,
  };
  const selesai = {
    x: akhir.x - unitX * ukuranPeta.radiusNode,
    y: akhir.y - unitY * ukuranPeta.radiusNode,
  };
  const arahLengkung = index % 2 === 0 ? 1 : -1;
  const kuatLengkung = Math.min(120, Math.max(62, panjang * 0.28));
  const kontrol = {
    x: (mulai.x + selesai.x) / 2 - unitY * kuatLengkung * arahLengkung,
    y: (mulai.y + selesai.y) / 2 + unitX * kuatLengkung * arahLengkung,
  };

  return `M ${mulai.x} ${mulai.y} Q ${kontrol.x} ${kontrol.y} ${selesai.x} ${selesai.y}`;
};

const ArenaKuis: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { theme, colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [pelajaranAktifId, setPelajaranAktifId] = useState<string>('');
  const [pelajaranList, setPelajaranList] = useState<PelajaranKuis[]>([]);
  const [levelTerbuka, setLevelTerbuka] = useState<Record<string, number>>({});
  const [levelDipilih, setLevelDipilih] = useState<Record<string, number>>({});
  const [refreshKey] = useState(0);

  const cariProgress = (progressData: any[], lessonId: string, levelNumber: number) => {
    return progressData.find(
      (p: any) => String(p.lessonId) === lessonId && Number(p.levelId) === levelNumber
    );
  };
  const progressSelesai = (p: any) => !!p && (p.completed === 1 || p.completed === true);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await apiService.getMaterials(1, 100);
      const materials = response?.materials || [];

      const parentMaterials = materials.filter(
        (m: any) => m.parent_id === null || m.parent_id === undefined
      );

      const getChildren = (parentId: number) => {
        return materials.filter((m: any) => m.parent_id === parentId);
      };

      let progressData: any[] = [];
      if (token) {
        try {
          const progressResponse = await apiService.getArenaProgress(token);
          progressData = progressResponse?.progress || [];
        } catch (e) {
          console.error(e);
        }
      }

      const checkQuestions = async (materialId: number) => {
        try {
          const detail = await apiService.getMaterialDetail(materialId);
          return (detail.questions && detail.questions.length > 0);
        } catch {
          return false;
        }
      };

      const pelajaranData: PelajaranKuis[] = [];
      const initialOpen: Record<string, number> = {};
      const initialSelected: Record<string, number> = {};

      for (const parent of parentMaterials) {
        const categoryColors = getCategoryColors(parent.category);
        const children = getChildren(parent.id);
        const lessonId = String(parent.id);

        const levels: LevelKuis[] = [];

        const hasQuestionsParent = await checkQuestions(parent.id);
        const progressParent = cariProgress(progressData, lessonId, 1);

        levels.push({
          id: parent.id,
          materialId: parent.id,
          levelNumber: 1,
          judul: parent.title,
          materi: parent.category,
          xp: getXp(1),
          estimasi: getEstimasi(1),
          deskripsi: '',
          titik: { x: 320, y: 70 },
          isCompleted: progressSelesai(progressParent),
          hasQuestions: hasQuestionsParent,
        });

        for (let idx = 0; idx < children.length; idx++) {
          const child = children[idx];
          const levelNumber = idx + 2;
          const hasQuestionsChild = await checkQuestions(child.id);
          const progressChild = cariProgress(progressData, lessonId, levelNumber);

          levels.push({
            id: child.id,
            materialId: child.id,
            levelNumber: levelNumber,
            judul: child.title,
            materi: parent.category,
            xp: getXp(levelNumber),
            estimasi: getEstimasi(levelNumber),
            deskripsi: '',
            titik: { x: 320 + (levelNumber % 2 === 0 ? 140 : -140) * (levelNumber / 3), y: 70 + (levelNumber - 1) * 130 },
            isCompleted: progressSelesai(progressChild),
            hasQuestions: hasQuestionsChild,
          });
        }

        let levelBerurutanSelesai = 0;
        for (const lvl of levels) {
          if (lvl.isCompleted) levelBerurutanSelesai++;
          else break;
        }

        const totalSelesai = levels.filter(l => l.isCompleted).length;

        pelajaranData.push({
          id: lessonId,
          nama: parent.title,
          warna: categoryColors.warna,
          warnaGelap: categoryColors.warnaGelap,
          ringkas: `${parent.category} - ${totalSelesai}/${levels.length} tahap selesai`,
          level: levels,
        });

        const terbuka = Math.max(1, Math.min(levelBerurutanSelesai + 1, levels.length + 1));
        initialOpen[lessonId] = terbuka;
        initialSelected[lessonId] = Math.max(1, Math.min(terbuka, levels.length));
      }

      setPelajaranList(pelajaranData);

      if (pelajaranData.length > 0) {
        if (!pelajaranAktifId || !pelajaranData.some(p => p.id === pelajaranAktifId)) {
          setPelajaranAktifId(pelajaranData[0].id);
        }
        setLevelTerbuka(initialOpen);
        setLevelDipilih(initialSelected);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token, refreshKey]);

  useEffect(() => {
    const checkRefresh = () => {
      const lastRefresh = localStorage.getItem('arenaRefresh');
      if (lastRefresh) {
        const lastTime = parseInt(lastRefresh);
        const now = Date.now();
        if (now - lastTime < 5000) {
          loadData();
          setTimeout(() => localStorage.removeItem('arenaRefresh'), 1000);
        }
      }
    };

    const interval = setInterval(checkRefresh, 2000);
    checkRefresh();

    return () => clearInterval(interval);
  }, []);

  const pelajaranAktif = useMemo(
    () => pelajaranList.find((pelajaran) => pelajaran.id === pelajaranAktifId) || pelajaranList[0],
    [pelajaranAktifId, pelajaranList]
  );

  const levelTerbukaAktif = levelTerbuka[pelajaranAktif?.id] || 1;
  const levelDipilihAktif = levelDipilih[pelajaranAktif?.id] || 1;
  const levelAktif =
    pelajaranAktif?.level.find((level) => level.levelNumber === levelDipilihAktif) || pelajaranAktif?.level[0];

  const totalXpTerkumpul = useMemo(() => {
    return pelajaranList.reduce((totalSemua, pelajaran) => {
      const xpPelajaran = pelajaran.level
        .filter((level) => level.isCompleted)
        .reduce((total, level) => total + level.xp, 0);
      return totalSemua + xpPelajaran;
    }, 0);
  }, [pelajaranList]);

  const progressPersen = useMemo(() => {
    const totalLevelSemua = pelajaranList.reduce((total, pelajaran) => total + pelajaran.level.length, 0);
    if (totalLevelSemua === 0) return 0;
    const totalSelesaiSemua = pelajaranList.reduce(
      (total, pelajaran) => total + pelajaran.level.filter((level) => level.isCompleted).length,
      0
    );
    return Math.round((totalSelesaiSemua / totalLevelSemua) * 100);
  }, [pelajaranList]);

  const ambilStatusLevel = (levelNumber: number): StatusLevel => {
    if (levelNumber < levelTerbukaAktif) return 'selesai';
    if (levelNumber === levelTerbukaAktif) return 'aktif';
    return 'terkunci';
  };

  const gantiPelajaran = (id: string) => {
    setPelajaranAktifId(id);
  };

  const pilihLevel = (level: LevelKuis) => {
    if (level.levelNumber > levelTerbukaAktif) return;
    setLevelDipilih((sebelumnya) => ({
      ...sebelumnya,
      [pelajaranAktif.id]: level.levelNumber,
    }));
  };

  const mulaiLevel = () => {
    if (!levelAktif) return;
    navigate(`/kuis/${levelAktif.id}`);
  };

  const isLevelAvailable = (levelNumber: number) => {
    return levelNumber <= levelTerbukaAktif;
  };

  const doesLevelHaveQuestions = (levelId: number) => {
    const level = pelajaranAktif?.level.find(l => l.id === levelId);
    return level?.hasQuestions || false;
  };

  const gaya: { [key: string]: React.CSSProperties } = {
    labelMusim: {
      display: 'inline-flex',
      alignItems: 'center',
      marginBottom: '10px',
      padding: '6px 12px',
      borderRadius: '999px',
      backgroundColor: 'rgba(255, 255, 255, 0.18)',
      color: '#ffffff',
      fontSize: '12px',
      fontWeight: 800,
    },
    ringkasanBanner: {
      display: 'flex',
      gap: '14px',
      color: '#ffffff',
    },
    angkaRingkasan: {
      display: 'block',
      minWidth: '82px',
      padding: '12px 14px 4px 14px',
      borderRadius: '18px 18px 0 0',
      backgroundColor: 'rgba(255, 255, 255, 0.18)',
      fontSize: '22px',
      fontWeight: 850,
      textAlign: 'center',
    },
    teksRingkasan: {
      display: 'block',
      padding: '0 14px 12px 14px',
      borderRadius: '0 0 18px 18px',
      backgroundColor: 'rgba(255, 255, 255, 0.18)',
      fontSize: '12px',
      fontWeight: 700,
      textAlign: 'center',
    },
    pilihanPelajaran: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
      gap: '12px',
      marginBottom: '24px',
    },
    tombolPelajaran: {
      minHeight: '54px',
      border: `1px solid ${colors.border}`,
      borderRadius: '999px',
      backgroundColor: colors.surface,
      color: colors.text,
      padding: '10px 14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '10px',
      cursor: 'pointer',
      fontWeight: 800,
      transition: 'border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease',
    },
    titikPelajaran: {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      flexShrink: 0,
    },
    namaPelajaran: {
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontSize: '13px',
    },
    progresPelajaran: {
      fontSize: '12px',
      color: colors.subtext,
      flexShrink: 0,
    },
    layoutArena: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1.25fr) minmax(300px, 0.75fr)',
      gap: '24px',
    },
    panelPeta: {
      backgroundColor: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: '24px',
      padding: '28px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
      overflow: 'hidden',
    },
    headerPeta: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '16px',
      marginBottom: '20px',
    },
    judulPanel: {
      margin: '0 0 6px 0',
      color: colors.text,
      fontSize: '18px',
      fontWeight: 850,
    },
    subPanel: {
      margin: 0,
      color: colors.subtext,
      fontSize: '13px',
      lineHeight: 1.45,
    },
    progressTrack: {
      height: '10px',
      borderRadius: '999px',
      backgroundColor: colors.border,
      overflow: 'hidden',
      marginBottom: '22px',
    },
    progressIsi: {
      height: '100%',
      borderRadius: '999px',
      transition: 'width 0.45s ease',
    },
    petaWrapper: {
      position: 'relative',
      width: '100%',
      aspectRatio: `${ukuranPeta.lebar} / ${ukuranPeta.tinggi}`,
      minHeight: '620px',
      borderRadius: '26px',
      background: theme === 'dark'
        ? `radial-gradient(circle at 25% 18%, ${pelajaranAktif?.warna}18, transparent 28%), radial-gradient(circle at 80% 62%, ${pelajaranAktif?.warna}18, transparent 30%), #0f172a`
        : `radial-gradient(circle at 25% 18%, ${pelajaranAktif?.warna}0f, transparent 28%), radial-gradient(circle at 80% 62%, ${pelajaranAktif?.warna}0f, transparent 30%), #f8fafc`,
      border: `1px solid ${colors.border}`,
      overflow: 'hidden',
    },
    svgJalur: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
    },
    simpulLevel: {
      position: 'absolute',
      width: '92px',
      height: '92px',
      transform: 'translate(-50%, -50%)',
      border: '4px solid',
      borderRadius: '50%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '3px',
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
      zIndex: 2,
    },
    nomorLevel: {
      fontSize: '23px',
      fontWeight: 950,
      lineHeight: 1,
    },
    labelLevel: {
      width: '70px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontSize: '10px',
      fontWeight: 850,
      textAlign: 'center',
    },
    panelDetail: {
      alignSelf: 'start',
      position: 'sticky',
      top: '100px',
      backgroundColor: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: '24px',
      padding: '28px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
    },
    badgeKategori: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '7px 12px',
      borderRadius: '999px',
      fontSize: '12px',
      fontWeight: 850,
      marginBottom: '16px',
    },
    judulDetail: {
      margin: '0 0 10px 0',
      color: colors.text,
      fontSize: '24px',
      fontWeight: 900,
    },
    metaGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px',
      marginBottom: '18px',
    },
    metaItem: {
      padding: '14px',
      borderRadius: '16px',
      backgroundColor: colors.background,
      border: `1px solid ${colors.border}`,
    },
    metaLabel: {
      display: 'block',
      color: colors.subtext,
      fontSize: '11px',
      fontWeight: 800,
      marginBottom: '6px',
    },
    metaNilai: {
      color: colors.text,
      fontSize: '15px',
      fontWeight: 900,
      textTransform: 'capitalize',
    },
    statusBox: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      padding: '14px',
      borderRadius: '16px',
      marginBottom: '20px',
    },
    statusTitik: {
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      marginTop: '5px',
      flexShrink: 0,
    },
    statusTeks: {
      margin: 0,
      fontSize: '13px',
      lineHeight: 1.5,
      fontWeight: 650,
    },
    tombolAksi: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    tombolMulai: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      border: 'none',
      borderRadius: '14px',
      padding: '14px 18px',
      color: '#ffffff',
      fontSize: '14px',
      fontWeight: 850,
      cursor: 'pointer',
      boxShadow: '0 8px 18px rgba(15, 23, 42, 0.15)',
    },
    statusLevel: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      padding: '14px 18px',
      borderRadius: '14px',
      fontSize: '14px',
      fontWeight: 700,
      cursor: 'default',
    },
    tombolNonaktif: {
      borderColor: colors.border,
      backgroundColor: colors.background,
      color: colors.subtext,
      cursor: 'not-allowed',
    },
    kotakTamat: {
      display: 'flex',
      alignItems: 'center',
      marginTop: '16px',
      padding: '14px',
      borderRadius: '16px',
      fontSize: '13px',
      fontWeight: 800,
      lineHeight: 1.45,
    },
  };

  if (loading) {
    return (
      <div style={styles.contentBody}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p style={{ color: colors.subtext }}>Memuat arena kuis...</p>
        </div>
      </div>
    );
  }

  if (pelajaranList.length === 0) {
    return (
      <div style={styles.contentBody}>
        <section style={styles.bannerInfo} className="arena-banner" aria-labelledby="arena-kuis-judul">
          <div style={styles.bannerTeks}>
            <h2 id="arena-kuis-judul" style={styles.bannerJudul}>Arena Kuis</h2>
            <p style={styles.bannerSubjudul}>Belum ada materi yang tersedia untuk arena kuis.</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div style={styles.contentBody}>
      <section style={styles.bannerInfo} className="arena-banner" aria-labelledby="arena-kuis-judul">
        <div style={styles.bannerTeks}>
          <span style={gaya.labelMusim}>
            <Trophy size={14} style={{ marginRight: '6px' }} />
            Arena per Pelajaran
          </span>
          <h2 id="arena-kuis-judul" style={styles.bannerJudul}>Arena Kuis</h2>
          <p style={styles.bannerSubjudul}>
            Pilih satu pelajaran, lalu ikuti tahap materi berurutan. Selesaikan kuis untuk membuka tahap berikutnya.
          </p>
        </div>
        <div style={gaya.ringkasanBanner} aria-label="Ringkasan progres arena">
          <div>
            <strong style={gaya.angkaRingkasan}>{progressPersen}%</strong>
            <span style={gaya.teksRingkasan}>Progres</span>
          </div>
          <div>
            <strong style={gaya.angkaRingkasan}>{totalXpTerkumpul}</strong>
            <span style={gaya.teksRingkasan}>XP</span>
          </div>
        </div>
      </section>

      <section style={gaya.pilihanPelajaran} className="pilihan-pelajaran-arena" aria-label="Pilih pelajaran kuis">
        {pelajaranList.map((pelajaran) => {
          const aktif = pelajaran.id === pelajaranAktif.id;
          const terbuka = levelTerbuka[pelajaran.id] || 1;
          const persen = Math.round(((terbuka - 1) / pelajaran.level.length) * 100);

          return (
            <button
              key={pelajaran.id}
              type="button"
              onClick={() => gantiPelajaran(pelajaran.id)}
              style={{
                ...gaya.tombolPelajaran,
                ...(aktif
                  ? {
                      borderColor: pelajaran.warna,
                      backgroundColor: `${pelajaran.warna}14`,
                      color: theme === 'dark' ? colors.text : pelajaran.warnaGelap,
                    }
                  : {}),
              }}
            >
              <span style={{ ...gaya.titikPelajaran, backgroundColor: pelajaran.warna }} />
              <span style={gaya.namaPelajaran}>{pelajaran.nama}</span>
              <span style={gaya.progresPelajaran}>{persen}%</span>
            </button>
          );
        })}
      </section>

      <section style={gaya.layoutArena} className="arena-layout">
        <div style={gaya.panelPeta} className="arena-map-panel">
          <div style={gaya.headerPeta}>
            <div>
              <h3 style={gaya.judulPanel}>{pelajaranAktif.nama}</h3>
              <p style={gaya.subPanel}>{pelajaranAktif.ringkas}</p>
            </div>
          </div>

          <div style={gaya.progressTrack} aria-hidden="true">
            <div
              style={{
                ...gaya.progressIsi,
                width: `${Math.round(((levelTerbukaAktif - 1) / pelajaranAktif.level.length) * 100)}%`,
                background: `linear-gradient(90deg, ${pelajaranAktif.warna} 0%, ${pelajaranAktif.warnaGelap} 100%)`,
              }}
            />
          </div>

          <div style={gaya.petaWrapper} className="arena-map-stage">
            <svg
              viewBox={`0 0 ${ukuranPeta.lebar} ${ukuranPeta.tinggi}`}
              style={gaya.svgJalur}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <marker
                  id="panahArena"
                  viewBox="0 0 12 12"
                  refX="10"
                  refY="6"
                  markerWidth="8"
                  markerHeight="8"
                  orient="auto-start-reverse"
                >
                  <path d="M 1 1 L 11 6 L 1 11 z" fill={pelajaranAktif.warna} />
                </marker>
                <marker
                  id="panahArenaTerkunci"
                  viewBox="0 0 12 12"
                  refX="10"
                  refY="6"
                  markerWidth="8"
                  markerHeight="8"
                  orient="auto-start-reverse"
                >
                  <path d="M 1 1 L 11 6 L 1 11 z" fill={colors.border} />
                </marker>
              </defs>

              {pelajaranAktif.level.slice(0, -1).map((level, index) => {
                const berikutnya = pelajaranAktif.level[index + 1];
                const isLevelCompleted = level.isCompleted || false;
                const isNextLevelUnlocked = levelTerbukaAktif > level.levelNumber;
                const showPath = isLevelCompleted || isNextLevelUnlocked;

                return (
                  <path
                    key={`${level.id}-${berikutnya.id}`}
                    d={buatPathLengkung(level.titik, berikutnya.titik, index)}
                    fill="none"
                    stroke={showPath ? pelajaranAktif.warna : colors.border}
                    strokeWidth={showPath ? 10 : 6}
                    strokeLinecap="round"
                    strokeDasharray={showPath ? '20 10' : '14 16'}
                    strokeDashoffset={isLevelCompleted ? '0' : '20'}
                    markerEnd={showPath ? 'url(#panahArena)' : 'url(#panahArenaTerkunci)'}
                    opacity={showPath ? 0.95 : 0.5}
                    className={isLevelCompleted ? 'path-aktif' : ''}
                  >
                    {isLevelCompleted && (
                      <animate
                        attributeName="stroke-dashoffset"
                        from="20"
                        to="0"
                        dur="0.8s"
                        fill="freeze"
                      />
                    )}
                  </path>
                );
              })}
            </svg>

            {pelajaranAktif.level.map((level) => {
              const status = ambilStatusLevel(level.levelNumber);
              const sudahDipilih = levelDipilihAktif === level.levelNumber;
              const available = isLevelAvailable(level.levelNumber);
              const hasQuestions = doesLevelHaveQuestions(level.id);

              const isClickable = available;

              return (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => isClickable && pilihLevel(level)}
                  disabled={!isClickable}
                  style={{
                    ...gaya.simpulLevel,
                    left: `${(level.titik.x / ukuranPeta.lebar) * 100}%`,
                    top: `${(level.titik.y / ukuranPeta.tinggi) * 100}%`,
                    border: !available
                      ? `4px solid ${colors.border}`
                      : status === 'selesai'
                        ? '4px solid #10b981'
                        : `4px solid ${pelajaranAktif.warna}`,
                    backgroundColor: !available
                      ? colors.surface
                      : status === 'selesai'
                        ? (theme === 'dark' ? '#064e3b' : '#ecfdf5')
                        : colors.surface,
                    color: !available
                      ? colors.subtext
                      : status === 'selesai'
                        ? (theme === 'dark' ? '#a7f3d0' : '#047857')
                        : (theme === 'dark' ? colors.text : pelajaranAktif.warnaGelap),
                    boxShadow: status === 'aktif' && available
                      ? `0 18px 40px ${pelajaranAktif.warna}4d`
                      : sudahDipilih
                        ? `0 0 0 8px ${pelajaranAktif.warna}1f`
                        : '0 12px 22px rgba(15, 23, 42, 0.10)',
                    cursor: isClickable ? 'pointer' : 'default',
                    opacity: available ? 1 : 0.7,
                  }}
                  className={`simpul-level-arena ${status === 'aktif' && available ? 'simpul-level-aktif' : ''}`}
                  aria-label={`${pelajaranAktif.nama}, tahap ${level.levelNumber}, ${level.judul}, ${status}`}
                >
                  <span style={gaya.nomorLevel}>
                    {status === 'selesai' ? <CheckCircle2 size={16} /> : !available ? <Clock size={16} /> : level.levelNumber}
                  </span>
                  <span style={gaya.labelLevel}>
                    {!available ? 'Terkunci' : hasQuestions ? 'Materi' : 'Segera Hadir'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <aside style={gaya.panelDetail} className="arena-detail-panel" aria-label="Detail level terpilih">
          <span
            style={{
              ...gaya.badgeKategori,
              backgroundColor: `${pelajaranAktif.warna}18`,
              color: theme === 'dark' ? colors.text : pelajaranAktif.warnaGelap,
            }}
          >
            <BookOpen size={14} style={{ marginRight: '6px' }} />
            {pelajaranAktif.nama} • Tahap {levelAktif?.levelNumber || 1}
          </span>
          <h3 style={gaya.judulDetail}>{levelAktif?.judul || 'Tahap'}</h3>

          <div style={gaya.metaGrid}>
            <div style={gaya.metaItem}>
              <span style={gaya.metaLabel}>Materi Kategori</span>
              <strong style={gaya.metaNilai}>{levelAktif?.materi || '-'}</strong>
            </div>
            <div style={gaya.metaItem}>
              <span style={gaya.metaLabel}>Jumlah Soal</span>
              <strong style={gaya.metaNilai}>5 soal</strong>
            </div>
            <div style={gaya.metaItem}>
              <span style={gaya.metaLabel}>Hadiah Penyelesaian</span>
              <strong style={gaya.metaNilai}>+{levelAktif?.xp || 0} XP</strong>
            </div>
            <div style={gaya.metaItem}>
              <span style={gaya.metaLabel}>Estimasi Durasi</span>
              <strong style={gaya.metaNilai}>{levelAktif?.estimasi || '-'}</strong>
            </div>
          </div>

          {(() => {
            const levelTersedia = isLevelAvailable(levelAktif?.levelNumber || 1);
            const levelPunyaSoal = doesLevelHaveQuestions(levelAktif?.id || 0);
            return (
              <>
                <div
                  style={{
                    ...gaya.statusBox,
                    backgroundColor: levelTersedia ? `${pelajaranAktif.warna}12` : colors.background,
                    border: levelTersedia ? `1px solid ${pelajaranAktif.warna}55` : `1px solid ${colors.border}`,
                  }}
                >
                  <span style={{ ...gaya.statusTitik, backgroundColor: levelTersedia ? pelajaranAktif.warna : colors.subtext }} />
                  <p style={{ ...gaya.statusTeks, color: levelTersedia ? (theme === 'dark' ? colors.text : pelajaranAktif.warnaGelap) : colors.subtext }}>
                    {levelTersedia && levelPunyaSoal
                      ? 'Tahap ini sedang aktif. XP yang Anda kumpulkan akan langsung menambahkan total XP untuk menaikkan Level Profil akun Anda.'
                      : levelTersedia && !levelPunyaSoal
                        ? 'Soal untuk tahap ini belum tersedia. Silakan coba lagi nanti.'
                        : 'Tahap ini masih terkunci. Selesaikan tahap sebelumnya terlebih dahulu untuk membuka kunci.'}
                  </p>
                </div>

                <div style={gaya.tombolAksi}>
                  {levelTersedia && levelPunyaSoal ? (
                    <button type="button" onClick={mulaiLevel} style={{ ...gaya.tombolMulai, backgroundColor: pelajaranAktif.warna }}>
                      <Play size={18} style={{ marginRight: '8px' }} />
                      Mulai Latihan
                    </button>
                  ) : (
                    <div style={{ ...gaya.statusLevel, backgroundColor: colors.background, border: `1px solid ${colors.border}`, color: colors.subtext }}>
                      <Clock size={18} style={{ marginRight: '8px' }} />
                      {levelTersedia ? 'Segera Hadir' : 'Terkunci'}
                    </div>
                  )}
                </div>
              </>
            );
          })()}

          {levelTerbukaAktif > pelajaranAktif.level.length && (
            <div
              style={{
                ...gaya.kotakTamat,
                backgroundColor: `${pelajaranAktif.warna}12`,
                color: theme === 'dark' ? colors.text : pelajaranAktif.warnaGelap,
              }}
            >
              <Trophy size={18} style={{ marginRight: '8px' }} />
              Semua tahap {pelajaranAktif.nama} selesai. Silakan pilih pelajaran lain untuk terus mengumpulkan XP akun!
            </div>
          )}
        </aside>
      </section>

      <style>{`
        .simpul-level-arena:not(:disabled):hover {
          transform: translate(-50%, -50%) scale(1.06);
        }

        .simpul-level-aktif {
          animation: denyutLevelAktif 1.8s ease-in-out infinite;
        }

        @keyframes denyutLevelAktif {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.06); }
        }

        .path-aktif {
          stroke-dasharray: 20 10;
          animation: alirPath 0.8s ease-in-out infinite;
        }

        @keyframes alirPath {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -30; }
        }

        @media (max-width: 980px) {
          .arena-layout {
            grid-template-columns: 1fr !important;
          }

          .pilihan-pelajaran-arena {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 640px) {
          .arena-banner {
            border-radius: 18px !important;
          }

          .arena-map-panel,
          .arena-detail-panel {
            padding: 20px !important;
            border-radius: 18px !important;
          }

          .arena-map-stage {
            min-height: 540px !important;
            aspect-ratio: auto !important;
          }

          .simpul-level-arena {
            width: 76px !important;
            height: 76px !important;
            border-width: 3px !important;
          }

          .simpul-level-arena span:first-child {
            font-size: 19px !important;
          }

          .simpul-level-arena span:last-child {
            width: 58px !important;
            font-size: 9px !important;
          }

          .pilihan-pelajaran-arena {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ArenaKuis;