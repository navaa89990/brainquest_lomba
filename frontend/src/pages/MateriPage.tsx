import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function MateriPage() {
  const [kategoriAktif, setKategoriAktif] = useState<string>('Semua');
  const [modalBuka, setModalBuka] = useState(false);
  const [materiTerpilih, setMateriTerpilih] = useState<any>(null);

  const daftarKategori = ['Semua', 'Pemrograman', 'Pengetahuan Umum', 'Bahasa Indonesia', 'Bahasa Inggris'];

  const bankMateri = [
    {
      id: 1,
      kategori: 'Pemrograman',
      judul: 'Dasar Pemrograman Web',
      img: 'https://placehold.co/600x400/9200ef/ffffff?text=HTML+&+CSS',
      deskripsi: 'Fondasi utama membangun website modern yang responsif dan interaktif.',
      status: 'Gratis',
      level: 'Level 01'
    },
    {
      id: 2,
      kategori: 'Pengetahuan Umum',
      judul: 'Eksplorasi Tata Surya',
      img: 'https://placehold.co/600x400/0ea5e9/ffffff?text=Space+Exploration',
      deskripsi: 'Menjelajahi keajaiban planet, bintang, dan misteri luar angkasa.',
      status: 'Gratis',
      level: 'Level 01'
    },
    {
      id: 3,
      kategori: 'Bahasa Indonesia',
      judul: 'Struktur Teks Eksposisi',
      img: 'https://placehold.co/600x400/f59e0b/ffffff?text=Bahasa+Indonesia',
      deskripsi: 'Belajar menyusun argumen yang logis dan memahami struktur kebahasaan.',
      status: 'Gratis',
      level: 'Level 01'
    },
    {
      id: 4,
      kategori: 'Bahasa Inggris',
      judul: 'Mastering Past Tense',
      img: 'https://placehold.co/600x400/ef4444/ffffff?text=English+Grammar',
      deskripsi: 'Kuasai percakapan masa lampau dengan grammar yang tepat dan mudah.',
      status: 'Gratis',
      level: 'Level 01'
    },
    {
      id: 5,
      kategori: 'Pemrograman',
      judul: 'Logika Javascript Dasar',
      img: 'https://placehold.co/600x400/1e1e1e/ffffff?text=Logic+Programming',
      deskripsi: 'Asah logika pemrograman untuk membuat fungsi game yang kompleks.',
      status: 'Premium',
      level: 'Level 02'
    },
    {
      id: 6,
      kategori: 'Pengetahuan Umum',
      judul: 'Geografi & Iklim Dunia',
      img: 'https://placehold.co/600x400/10b981/ffffff?text=Geography',
      deskripsi: 'Pahami fenomena alam dan pembagian wilayah iklim di seluruh dunia.',
      status: 'Premium',
      level: 'Level 02'
    }
  ];

  const materiTersaring = kategoriAktif === 'Semua' 
    ? bankMateri 
    : bankMateri.filter(m => m.kategori === kategoriAktif);

  const aksiKlikMateri = (materi: any) => {
    if (materi.status === 'Premium') {
      setMateriTerpilih(materi);
      setModalBuka(true);
      document.body.style.overflow = 'hidden';
    } else {
      window.scrollTo(0, 0);
    }
  };

  const tutupModal = () => {
    setModalBuka(false);
    document.body.style.overflow = 'auto';
  };

  return (
    <div style={gaya.pageWrapper}>
      <div style={gaya.container}>
        
        <div style={gaya.header}>
          <h1 style={gaya.judulHalaman}>Jelajahi Modul Belajar</h1>
          <p style={gaya.subHalaman}>Pilih pangkalan misi kamu dan kumpulkan XP sebanyak-banyaknya.</p>
        </div>

        <div style={gaya.filterBar} className="wadah-filter-kategori">
          {daftarKategori.map(kat => (
            <button
              key={kat}
              style={{
                ...gaya.btnFilter,
                backgroundColor: kategoriAktif === kat ? 'var(--primary-purple)' : '#ffffff',
                color: kategoriAktif === kat ? '#ffffff' : 'var(--text-dark)',
                border: kategoriAktif === kat ? '1px solid var(--primary-purple)' : '1px solid #e2e8f0'
              }}
              onClick={() => setKategoriAktif(kat)}
            >
              {kat}
            </button>
          ))}
        </div>

        <div style={gaya.gridCard} className="grid-materi-layout">
          {materiTersaring.map(materi => (
            <div 
              key={materi.id} 
              style={gaya.card} 
              className="kartu-materi-item-hover"
              onClick={() => aksiKlikMateri(materi)}
            >
              <div style={gaya.wrapperImg}>
                <img src={materi.img} alt={materi.judul} style={gaya.gambar} />
                <div style={gaya.overlayStatus}>
                  <span style={{
                    ...gaya.badgeStatus,
                    backgroundColor: materi.status === 'Premium' ? '#fee2e2' : '#dcfce7',
                    color: materi.status === 'Premium' ? '#ef4444' : '#15803d'
                  }}>
                    {materi.status === 'Premium' ? '🔒 Premium' : '🔓 Gratis'}
                  </span>
                </div>
              </div>

              <div style={gaya.cardContent}>
                <span style={gaya.katTeks}>{materi.kategori} • {materi.level}</span>
                <h3 style={gaya.judulCard}>{materi.judul}</h3>
                <p style={gaya.descCard}>{materi.deskripsi}</p>
                
                <div style={gaya.cardFooter}>
                  <Link 
                    to={materi.status === 'Gratis' ? "/kuis" : "#"} 
                    state={{ dariTeaser: true, levelId: materi.id, namaLevel: materi.judul }}
                    style={{
                      ...gaya.btnMain,
                      backgroundColor: materi.status === 'Premium' ? '#f1f5f9' : 'var(--primary-purple)',
                      color: materi.status === 'Premium' ? '#64748b' : '#ffffff'
                    }}
                  >
                    {materi.status === 'Premium' ? 'Buka Akses' : 'Mulai Belajar'}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {modalBuka && materiTerpilih && (
        <div style={gaya.overlay} onClick={tutupModal}>
          <div style={gaya.modal} onClick={e => e.stopPropagation()}>
            <h2 style={gaya.mJudul}>Misi Terkunci! 🔒</h2>
            <p style={gaya.mDesc}>Modul <strong>{materiTerpilih.judul}</strong> hanya tersedia untuk siswa yang sudah terdaftar di BrainQuest.</p>
            <div style={gaya.mAuth}>
              <Link to="/login" style={gaya.mBtnLogin} onClick={() => document.body.style.overflow = 'auto'}>Login</Link>
              <Link to="/daftar" style={gaya.mBtnDaftar} onClick={() => document.body.style.overflow = 'auto'}>Daftar Akun</Link>
            </div>
            <button style={gaya.mClose} onClick={tutupModal}>Mungkin Nanti</button>
          </div>
        </div>
      )}
    </div>
  );
}

const gaya = {
  pageWrapper: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    padding: '140px 24px 80px 24px',
  } as React.CSSProperties,

  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
  } as React.CSSProperties,

  header: {
    textAlign: 'center',
  } as React.CSSProperties,

  judulHalaman: {
    fontSize: '38px',
    fontWeight: 900,
    color: 'var(--text-dark)',
    marginBottom: '12px',
  } as React.CSSProperties,

  subHalaman: {
    fontSize: '16px',
    color: '#666',
  } as React.CSSProperties,

  filterBar: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  } as React.CSSProperties,

  btnFilter: {
    padding: '10px 22px',
    borderRadius: '100px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  } as React.CSSProperties,

  gridCard: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '30px',
  } as React.CSSProperties,

  card: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    overflow: 'hidden',
    border: '1px solid #edf2f7',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
  } as React.CSSProperties,

  wrapperImg: {
    width: '100%',
    height: '200px',
    position: 'relative',
    overflow: 'hidden',
  } as React.CSSProperties,

  gambar: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s ease',
  } as React.CSSProperties,

  overlayStatus: {
    position: 'absolute',
    top: '16px',
    left: '16px',
  } as React.CSSProperties,

  badgeStatus: {
    padding: '6px 12px',
    borderRadius: '100px',
    fontSize: '11px',
    fontWeight: 800,
    textTransform: 'uppercase',
  } as React.CSSProperties,

  cardContent: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  } as React.CSSProperties,

  katTeks: {
    fontSize: '12px',
    fontWeight: 700,
    color: 'var(--primary-purple)',
    marginBottom: '8px',
    textTransform: 'uppercase',
  } as React.CSSProperties,

  judulCard: {
    fontSize: '20px',
    fontWeight: 800,
    color: 'var(--text-dark)',
    marginBottom: '12px',
    lineHeight: 1.3,
  } as React.CSSProperties,

  descCard: {
    fontSize: '14px',
    color: '#666',
    lineHeight: 1.5,
    marginBottom: '24px',
    flex: 1,
  } as React.CSSProperties,

  cardFooter: {
    marginTop: 'auto',
  } as React.CSSProperties,

  btnMain: {
    display: 'block',
    textAlign: 'center',
    padding: '14px 0',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 700,
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
    padding: '20px',
  } as React.CSSProperties,

  modal: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '30px',
    maxWidth: '450px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
  } as React.CSSProperties,

  mJudul: {
    fontSize: '24px',
    fontWeight: 800,
    marginBottom: '16px',
  } as React.CSSProperties,

  mDesc: {
    fontSize: '15px',
    color: '#555',
    lineHeight: 1.6,
    marginBottom: '32px',
  } as React.CSSProperties,

  mAuth: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
  } as React.CSSProperties,

  mBtnLogin: {
    flex: 1,
    padding: '14px',
    backgroundColor: '#f1f5f9',
    color: 'var(--text-dark)',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: 700,
  } as React.CSSProperties,

  mBtnDaftar: {
    flex: 1,
    padding: '14px',
    backgroundColor: 'var(--primary-purple)',
    color: '#ffffff',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: 700,
  } as React.CSSProperties,

  mClose: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  } as React.CSSProperties,
};

export default MateriPage;