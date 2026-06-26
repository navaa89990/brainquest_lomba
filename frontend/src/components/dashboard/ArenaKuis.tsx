import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { styles } from './dashboardStyles';

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

const arenaPelajaran: PelajaranKuis[] = [
  {
    id: 'bahasa-indonesia',
    nama: 'Bahasa Indonesia',
    warna: '#ef4444',
    warnaGelap: '#b91c1c',
    ringkas: 'Membaca, kalimat efektif, gagasan utama, dan teks narasi.',
    level: [
      {
        id: 1,
        judul: 'Gagasan Utama',
        materi: 'Paragraf',
        xp: 120,
        estimasi: '5 menit',
        deskripsi: 'Menentukan ide pokok dan kalimat pendukung dalam paragraf pendek.',
        titik: { x: 320, y: 70 },
      },
      {
        id: 2,
        judul: 'Kalimat Efektif',
        materi: 'Tata Bahasa',
        xp: 140,
        estimasi: '6 menit',
        deskripsi: 'Memilih kalimat yang paling jelas, hemat, dan sesuai kaidah.',
        titik: { x: 470, y: 185 },
      },
      {
        id: 3,
        judul: 'Sinonim Antonim',
        materi: 'Kosakata',
        xp: 150,
        estimasi: '6 menit',
        deskripsi: 'Mengenali hubungan makna kata dalam konteks bacaan.',
        titik: { x: 215, y: 315 },
      },
      {
        id: 4,
        judul: 'Teks Narasi',
        materi: 'Jenis Teks',
        xp: 190,
        estimasi: '8 menit',
        deskripsi: 'Menganalisis alur, tokoh, dan konflik dalam teks narasi.',
        titik: { x: 445, y: 465 },
      },
      {
        id: 5,
        judul: 'Ujian Bab',
        materi: 'Campuran',
        xp: 260,
        estimasi: '10 menit',
        deskripsi: 'Tantangan akhir Bahasa Indonesia untuk membuka badge literasi.',
        titik: { x: 300, y: 635 },
      },
    ],
  },
  {
    id: 'matematika',
    nama: 'Matematika',
    warna: '#F4A623',
    warnaGelap: '#d97706',
    ringkas: 'Bilangan, pecahan, perbandingan, bangun datar, dan aljabar.',
    level: [
      {
        id: 1,
        judul: 'Operasi Bilangan',
        materi: 'Aritmatika',
        xp: 130,
        estimasi: '5 menit',
        deskripsi: 'Pemanasan hitung cepat dengan operasi dasar dan prioritas hitung.',
        titik: { x: 300, y: 75 },
      },
      {
        id: 2,
        judul: 'Pecahan',
        materi: 'Bilangan',
        xp: 155,
        estimasi: '7 menit',
        deskripsi: 'Menyederhanakan, membandingkan, dan mengubah bentuk pecahan.',
        titik: { x: 135, y: 210 },
      },
      {
        id: 3,
        judul: 'Perbandingan',
        materi: 'Rasio',
        xp: 170,
        estimasi: '7 menit',
        deskripsi: 'Mengerjakan soal skala, rasio, dan perbandingan senilai.',
        titik: { x: 470, y: 330 },
      },
      {
        id: 4,
        judul: 'Bangun Datar',
        materi: 'Geometri',
        xp: 210,
        estimasi: '9 menit',
        deskripsi: 'Menghitung luas, keliling, dan mengenali sifat bangun datar.',
        titik: { x: 215, y: 485 },
      },
      {
        id: 5,
        judul: 'Aljabar Dasar',
        materi: 'Aljabar',
        xp: 280,
        estimasi: '11 menit',
        deskripsi: 'Menyelesaikan bentuk sederhana dan persamaan satu variabel.',
        titik: { x: 415, y: 640 },
      },
    ],
  },
  {
    id: 'sains',
    nama: 'Sains',
    warna: '#10b981',
    warnaGelap: '#047857',
    ringkas: 'Makhluk hidup, tata surya, energi, gaya, dan ekosistem.',
    level: [
      {
        id: 1,
        judul: 'Struktur Sel',
        materi: 'Biologi',
        xp: 130,
        estimasi: '5 menit',
        deskripsi: 'Mengenali bagian sel dan fungsi organel utama.',
        titik: { x: 310, y: 75 },
      },
      {
        id: 2,
        judul: 'Tata Surya',
        materi: 'Astronomi',
        xp: 160,
        estimasi: '6 menit',
        deskripsi: 'Mengurutkan planet dan memahami ciri benda langit.',
        titik: { x: 485, y: 215 },
      },
      {
        id: 3,
        judul: 'Gaya Newton',
        materi: 'Fisika',
        xp: 190,
        estimasi: '8 menit',
        deskripsi: 'Menghubungkan gaya, massa, dan gerak dalam contoh sehari-hari.',
        titik: { x: 210, y: 360 },
      },
      {
        id: 4,
        judul: 'Rantai Makanan',
        materi: 'Ekosistem',
        xp: 210,
        estimasi: '8 menit',
        deskripsi: 'Menentukan produsen, konsumen, dan aliran energi ekosistem.',
        titik: { x: 455, y: 520 },
      },
      {
        id: 5,
        judul: 'Energi',
        materi: 'Fisika',
        xp: 280,
        estimasi: '10 menit',
        deskripsi: 'Membedakan bentuk energi dan perubahan energi pada benda.',
        titik: { x: 305, y: 645 },
      },
    ],
  },
  {
    id: 'bahasa-inggris',
    nama: 'Bahasa Inggris',
    warna: '#3b82f6',
    warnaGelap: '#1d4ed8',
    ringkas: 'Vocabulary, grammar, reading, tenses, dan short conversation.',
    level: [
      {
        id: 1,
        judul: 'Daily Vocabulary',
        materi: 'Vocabulary',
        xp: 120,
        estimasi: '5 menit',
        deskripsi: 'Memilih arti kata yang sering muncul dalam kegiatan harian.',
        titik: { x: 325, y: 80 },
      },
      {
        id: 2,
        judul: 'Simple Present',
        materi: 'Grammar',
        xp: 150,
        estimasi: '6 menit',
        deskripsi: 'Melengkapi kalimat kebiasaan dengan pola simple present tense.',
        titik: { x: 150, y: 230 },
      },
      {
        id: 3,
        judul: 'Reading Clues',
        materi: 'Reading',
        xp: 175,
        estimasi: '7 menit',
        deskripsi: 'Menjawab pertanyaan berdasarkan petunjuk dalam teks pendek.',
        titik: { x: 430, y: 360 },
      },
      {
        id: 4,
        judul: 'Simple Past',
        materi: 'Tenses',
        xp: 205,
        estimasi: '8 menit',
        deskripsi: 'Mengenali kata kerja lampau dan susunan kalimat simple past.',
        titik: { x: 220, y: 510 },
      },
      {
        id: 5,
        judul: 'Conversation',
        materi: 'Speaking',
        xp: 260,
        estimasi: '10 menit',
        deskripsi: 'Menyusun respons yang tepat dalam percakapan singkat.',
        titik: { x: 445, y: 640 },
      },
    ],
  },
];

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
  const [pelajaranAktifId, setPelajaranAktifId] = useState(arenaPelajaran[0].id);
  const [levelTerbuka, setLevelTerbuka] = useState<Record<string, number>>({
    'bahasa-indonesia': 2,
    matematika: 1,
    sains: 1,
    'bahasa-inggris': 1,
  });
  const [levelDipilih, setLevelDipilih] = useState<Record<string, number>>({
    'bahasa-indonesia': 2,
    matematika: 1,
    sains: 1,
    'bahasa-inggris': 1,
  });

  const pelajaranAktif = useMemo(
    () => arenaPelajaran.find((pelajaran) => pelajaran.id === pelajaranAktifId) || arenaPelajaran[0],
    [pelajaranAktifId]
  );

  const levelTerbukaAktif = levelTerbuka[pelajaranAktif.id] || 1;
  const levelDipilihAktif = levelDipilih[pelajaranAktif.id] || 1;
  const levelAktif =
    pelajaranAktif.level.find((level) => level.id === levelDipilihAktif) || pelajaranAktif.level[0];

  const totalXpTerkumpul = pelajaranAktif.level
    .filter((level) => level.id < levelTerbukaAktif)
    .reduce((total, level) => total + level.xp, 0);

  const progressPersen = Math.round(((levelTerbukaAktif - 1) / pelajaranAktif.level.length) * 100);

  const ambilStatusLevel = (id: number): StatusLevel => {
    if (id < levelTerbukaAktif) return 'selesai';
    if (id === levelTerbukaAktif) return 'aktif';
    return 'terkunci';
  };

  const gantiPelajaran = (id: string) => {
    setPelajaranAktifId(id);
  };

  const pilihLevel = (level: LevelKuis) => {
    if (level.id > levelTerbukaAktif) return;
    setLevelDipilih((sebelumnya) => ({
      ...sebelumnya,
      [pelajaranAktif.id]: level.id,
    }));
  };

  const mulaiLevel = () => {
    navigate('/kuis', {
      state: {
        dariTeaser: true,
        levelId: levelAktif.id,
        namaLevel: `${pelajaranAktif.nama} - ${levelAktif.judul}`,
      },
    });
  };

  const selesaikanLevel = () => {
    if (levelDipilihAktif !== levelTerbukaAktif) return;

    const levelBerikutnya = Math.min(levelTerbukaAktif + 1, pelajaranAktif.level.length + 1);
    setLevelTerbuka((sebelumnya) => ({
      ...sebelumnya,
      [pelajaranAktif.id]: levelBerikutnya,
    }));
    setLevelDipilih((sebelumnya) => ({
      ...sebelumnya,
      [pelajaranAktif.id]: Math.min(levelBerikutnya, pelajaranAktif.level.length),
    }));
  };

  const resetArena = () => {
    setLevelTerbuka((sebelumnya) => ({
      ...sebelumnya,
      [pelajaranAktif.id]: 1,
    }));
    setLevelDipilih((sebelumnya) => ({
      ...sebelumnya,
      [pelajaranAktif.id]: 1,
    }));
  };

  return (
    <div style={styles.contentBody}>
      <section style={styles.bannerInfo} className="arena-banner" aria-labelledby="arena-kuis-judul">
        <div style={styles.bannerTeks}>
          <span style={gaya.labelMusim}>Arena per Pelajaran</span>
          <h2 id="arena-kuis-judul" style={styles.bannerJudul}>Arena Kuis</h2>
          <p style={styles.bannerSubjudul}>
            Pilih satu pelajaran, lalu ikuti level materi berurutan tanpa campur dengan pelajaran lain.
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
        {arenaPelajaran.map((pelajaran) => {
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
                      color: pelajaran.warnaGelap,
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
            <button type="button" onClick={resetArena} style={gaya.tombolSekunder}>
              Reset
            </button>
          </div>

          <div style={gaya.progressTrack} aria-hidden="true">
            <div
              style={{
                ...gaya.progressIsi,
                width: `${progressPersen}%`,
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
                  <path d="M 1 1 L 11 6 L 1 11 z" fill="#cbd5e1" />
                </marker>
              </defs>

              {pelajaranAktif.level.slice(0, -1).map((level, index) => {
                const berikutnya = pelajaranAktif.level[index + 1];
                const jalurSelesai = berikutnya.id <= levelTerbukaAktif;
                const jalurAktif = level.id <= levelTerbukaAktif;

                return (
                  <path
                    key={`${level.id}-${berikutnya.id}`}
                    d={buatPathLengkung(level.titik, berikutnya.titik, index)}
                    fill="none"
                    stroke={jalurAktif ? pelajaranAktif.warna : '#cbd5e1'}
                    strokeWidth={jalurSelesai ? 10 : 8}
                    strokeLinecap="round"
                    strokeDasharray={jalurAktif ? undefined : '14 16'}
                    markerEnd={jalurAktif ? 'url(#panahArena)' : 'url(#panahArenaTerkunci)'}
                    opacity={jalurAktif ? 0.95 : 0.72}
                  />
                );
              })}
            </svg>

            {pelajaranAktif.level.map((level) => {
              const status = ambilStatusLevel(level.id);
              const sudahDipilih = levelDipilihAktif === level.id;

              return (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => pilihLevel(level)}
                  disabled={status === 'terkunci'}
                  style={{
                    ...gaya.simpulLevel,
                    left: `${(level.titik.x / ukuranPeta.lebar) * 100}%`,
                    top: `${(level.titik.y / ukuranPeta.tinggi) * 100}%`,
                    borderColor:
                      status === 'terkunci'
                        ? '#cbd5e1'
                        : status === 'selesai'
                          ? '#10b981'
                          : pelajaranAktif.warna,
                    backgroundColor:
                      status === 'terkunci'
                        ? '#f8fafc'
                        : status === 'selesai'
                          ? '#ecfdf5'
                          : '#ffffff',
                    color:
                      status === 'terkunci'
                        ? '#94a3b8'
                        : status === 'selesai'
                          ? '#047857'
                          : pelajaranAktif.warnaGelap,
                    boxShadow:
                      status === 'aktif'
                        ? `0 18px 40px ${pelajaranAktif.warna}4d`
                        : sudahDipilih
                          ? `0 0 0 8px ${pelajaranAktif.warna}1f`
                          : '0 12px 22px rgba(15, 23, 42, 0.10)',
                  }}
                  className={`simpul-level-arena ${status === 'aktif' ? 'simpul-level-aktif' : ''}`}
                  aria-label={`${pelajaranAktif.nama}, level ${level.id}, ${level.judul}, ${status}`}
                >
                  <span style={gaya.nomorLevel}>
                    {status === 'selesai' ? '✓' : status === 'terkunci' ? '🔒' : level.id}
                  </span>
                  <span style={gaya.labelLevel}>{level.materi}</span>
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
              color: pelajaranAktif.warnaGelap,
            }}
          >
            {pelajaranAktif.nama} • Level {levelAktif.id}
          </span>
          <h3 style={gaya.judulDetail}>{levelAktif.judul}</h3>
          <p style={gaya.deskripsiDetail}>{levelAktif.deskripsi}</p>

          <div style={gaya.metaGrid}>
            <div style={gaya.metaItem}>
              <span style={gaya.metaLabel}>Materi</span>
              <strong style={gaya.metaNilai}>{levelAktif.materi}</strong>
            </div>
            <div style={gaya.metaItem}>
              <span style={gaya.metaLabel}>Hadiah</span>
              <strong style={gaya.metaNilai}>+{levelAktif.xp} XP</strong>
            </div>
            <div style={gaya.metaItem}>
              <span style={gaya.metaLabel}>Durasi</span>
              <strong style={gaya.metaNilai}>{levelAktif.estimasi}</strong>
            </div>
            <div style={gaya.metaItem}>
              <span style={gaya.metaLabel}>Status</span>
              <strong style={gaya.metaNilai}>{ambilStatusLevel(levelAktif.id)}</strong>
            </div>
          </div>

          <div
            style={{
              ...gaya.statusBox,
              backgroundColor: `${pelajaranAktif.warna}12`,
              borderColor: `${pelajaranAktif.warna}55`,
            }}
          >
            <span style={{ ...gaya.statusTitik, backgroundColor: pelajaranAktif.warna }} />
            <p style={{ ...gaya.statusTeks, color: pelajaranAktif.warnaGelap }}>
              {levelDipilihAktif < levelTerbukaAktif
                ? 'Level ini sudah selesai. Kamu bisa mengulang materi ini kapan saja.'
                : levelDipilihAktif === levelTerbukaAktif
                  ? 'Level ini sedang aktif. Selesaikan untuk membuka materi berikutnya.'
                  : 'Level ini masih terkunci. Selesaikan materi sebelumnya dulu.'}
            </p>
          </div>

          <div style={gaya.tombolAksi}>
            <button
              type="button"
              onClick={mulaiLevel}
              style={{ ...gaya.tombolMulai, backgroundColor: pelajaranAktif.warna }}
            >
              Mulai Latihan
            </button>
            <button
              type="button"
              onClick={selesaikanLevel}
              disabled={levelDipilihAktif !== levelTerbukaAktif || levelTerbukaAktif > pelajaranAktif.level.length}
              style={{
                ...gaya.tombolSelesai,
                borderColor: pelajaranAktif.warna,
                color: pelajaranAktif.warnaGelap,
                backgroundColor: `${pelajaranAktif.warna}12`,
                ...(levelDipilihAktif !== levelTerbukaAktif || levelTerbukaAktif > pelajaranAktif.level.length
                  ? gaya.tombolNonaktif
                  : {}),
              }}
            >
              Selesaikan Level
            </button>
          </div>

          {levelTerbukaAktif > pelajaranAktif.level.length && (
            <div
              style={{
                ...gaya.kotakTamat,
                backgroundColor: `${pelajaranAktif.warna}12`,
                color: pelajaranAktif.warnaGelap,
              }}
            >
              Semua level {pelajaranAktif.nama} selesai. Pilih pelajaran lain untuk lanjut.
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

const gaya: { [key: string]: React.CSSProperties } = {
  labelMusim: {
    display: 'inline-flex',
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
    border: '1px solid #e2e8f0',
    borderRadius: '999px',
    backgroundColor: '#ffffff',
    color: '#475569',
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
    color: '#64748b',
    flexShrink: 0,
  },
  layoutArena: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.25fr) minmax(300px, 0.75fr)',
    gap: '24px',
  },
  panelPeta: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
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
    color: '#2d3748',
    fontSize: '18px',
    fontWeight: 850,
  },
  subPanel: {
    margin: 0,
    color: '#718096',
    fontSize: '13px',
    lineHeight: 1.45,
  },
  tombolSekunder: {
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    color: '#475569',
    borderRadius: '999px',
    padding: '10px 14px',
    fontSize: '13px',
    fontWeight: 800,
    cursor: 'pointer',
  },
  progressTrack: {
    height: '10px',
    borderRadius: '999px',
    backgroundColor: '#e2e8f0',
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
    background:
      'radial-gradient(circle at 25% 18%, rgba(244, 166, 35, 0.08), transparent 28%), radial-gradient(circle at 80% 62%, rgba(16, 185, 129, 0.08), transparent 30%), #f8fafc',
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
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '24px',
    padding: '28px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
  },
  badgeKategori: {
    display: 'inline-flex',
    padding: '7px 12px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 850,
    marginBottom: '16px',
  },
  judulDetail: {
    margin: '0 0 10px 0',
    color: '#2d3748',
    fontSize: '24px',
    fontWeight: 900,
  },
  deskripsiDetail: {
    margin: '0 0 22px 0',
    color: '#64748b',
    fontSize: '14px',
    lineHeight: 1.6,
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
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
  },
  metaLabel: {
    display: 'block',
    color: '#94a3b8',
    fontSize: '11px',
    fontWeight: 800,
    marginBottom: '6px',
  },
  metaNilai: {
    color: '#2d3748',
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
    border: '1px solid',
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
  tombolSelesai: {
    width: '100%',
    border: '1px solid',
    borderRadius: '14px',
    padding: '14px 18px',
    fontSize: '14px',
    fontWeight: 850,
    cursor: 'pointer',
  },
  tombolNonaktif: {
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    color: '#94a3b8',
    cursor: 'not-allowed',
  },
  kotakTamat: {
    marginTop: '16px',
    padding: '14px',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: 800,
    lineHeight: 1.45,
  },
};

export default ArenaKuis;
