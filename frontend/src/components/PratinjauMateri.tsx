import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

interface Materi {
  id: number;
  title: string;
  content: string;
  category: string;
  img?: string;
  status?: string;
}

function PratinjauMateri() {
  const navigate = useNavigate();
  const [kategoriAktif, setKategoriAktif] = useState<string>('Semua');
  const [kartuAktif, setKartuAktif] = useState<number | null>(null);
  const [modalBuka, setModalBuka] = useState(false);
  const [materiTerpilih, setMateriTerpilih] = useState<Materi | null>(null);
  const [listMateri, setListMateri] = useState<Materi[]>([]);
  const [loading, setLoading] = useState(true);

  const daftarKategori = ['Semua', 'Pemrograman', 'Pengetahuan Umum', 'Bahasa Indonesia', 'Bahasa Inggris'];

  useEffect(() => {
    const fetchMateri = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('materials')
        .select('id, title, content, category, status, img')
        .is('parent_id', null);
      setListMateri(data || []);
      setLoading(false);
    };
    fetchMateri();
  }, []);

  const materiTersaring = kategoriAktif === 'Semua'
    ? listMateri
    : listMateri.filter(item => item.category === kategoriAktif);

  const bukaModal = (materi: Materi) => {
    setMateriTerpilih(materi);
    setModalBuka(true);
    document.body.style.overflow = 'hidden';
  };

  const tutupModal = () => {
    setModalBuka(false);
    document.body.style.overflow = 'auto';
  };

  const aksiTeaserGratis = () => {
    document.body.style.overflow = 'auto';
    if (materiTerpilih) navigate('/kuis', { state: { dariTeaser: true, levelId: materiTerpilih.id, namaLevel: materiTerpilih.title } });
  };

  return (
    <section id="tahapan-misi" style={gaya.seksiMateri}>
      <div style={gaya.kontenMateri}>
        
        <div style={gaya.blokText}>
          <span style={gaya.labelKecil}>TAHAPAN MISI</span>
          <h2 style={gaya.judulUtama}>Intip Peta Petualangan Belajarmu</h2>
          <p style={gaya.subJudul}>Pilih kategori pelajaran di bawah. Klik Lihat Misi untuk bersiap bertarung di Arena Kuis.</p>
        </div>

        <div style={gaya.wrapperFilter} className="wadah-filter-kategori">
          {daftarKategori.map((kat) => (
            <button
              key={kat}
              style={{
                ...gaya.tombolFilter,
                backgroundColor: kategoriAktif === kat ? 'var(--primary-purple)' : '#ffffff',
                color: kategoriAktif === kat ? '#ffffff' : 'var(--text-dark)',
                border: kategoriAktif === kat ? '1px solid var(--primary-purple)' : '1px solid rgba(146, 0, 239, 0.1)'
              }}
              onClick={() => setKategoriAktif(kat)}
            >
              {kat}
            </button>
          ))}
        </div>

        <div style={gaya.listGaris}>
          {loading ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Memuat materi...</p>
          ) : materiTersaring.map((materi, indeks) => {
            const sedangHover = kartuAktif === indeks;
            return (
              <div
                key={materi.id}
                style={{ ...gaya.barisMateri, ...(sedangHover ? gaya.barisMateriHover : {}) }}
                className="baris-materi-item"
                onMouseEnter={() => setKartuAktif(indeks)}
                onMouseLeave={() => setKartuAktif(null)}
              >
                <div style={gaya.infoKiri} className="info-kiri-materi">
                  <span style={{
                    ...gaya.badgeLevel,
                    backgroundColor: sedangHover ? 'var(--primary-purple)' : 'rgba(244, 166, 35, 0.08)',
                    color: sedangHover ? '#ffffff' : 'var(--primary-purple)'
                  }}>
                    {materi.category}
                  </span>
                  <div style={gaya.detailTeks}>
                    <h3 style={gaya.judulMateri}>{materi.title}</h3>
                    <span style={gaya.jumlahMisi}>{materi.content.split(' ').slice(0, 12).join(' ')}...</span>
                  </div>
                </div>
                <div style={gaya.infoKanan} className="info-kanan-materi">
                  <button
                    style={{
                      ...gaya.tombolAksi,
                      backgroundColor: sedangHover ? 'var(--primary-purple)' : '#f0f2f5',
                      color: sedangHover ? '#ffffff' : 'var(--text-dark)'
                    }}
                    className="tombol-aksi-materi tombol-efek-ringan"
                    onClick={() => bukaModal(materi)}
                  >
                    Lihat Misi
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {modalBuka && materiTerpilih && (
        <div style={gaya.overlayModal} onClick={tutupModal}>
          <div style={gaya.kotakModal} onClick={(e) => e.stopPropagation()}>
            <button style={gaya.tombolTutup} onClick={tutupModal}>&times;</button>

            <div style={gaya.modalHeader}>
              <span style={gaya.modalBadge}>{materiTerpilih.category}</span>
              <h3 style={gaya.modalJudul}>{materiTerpilih.title}</h3>
            </div>

            <div style={gaya.modalBody}>
              <p style={gaya.modalDeskripsi}>{materiTerpilih.content.split(' ').slice(0, 40).join(' ')}...</p>
            </div>

            <div style={gaya.modalFooter}>
              <div style={gaya.pesanLimit}>
                <span style={{ fontSize: '20px' }}>🔒</span>
                <p style={gaya.teksPeringatan}>Kamu sedang dalam mode tamu. Progres kuis dan XP tidak akan disimpan.</p>
              </div>
              <div style={gaya.opsiAuth}>
                <Link
                  to={`/materi/${materiTerpilih.id}`}
                  style={gaya.btnModalLogin}
                  onClick={() => document.body.style.overflow = 'auto'}
                >
                  Pelajari Materi
                </Link>
                <button style={{ ...gaya.btnModalDaftar, border: 'none', cursor: 'pointer' }} onClick={aksiTeaserGratis}>
                  Coba Kuis Gratis
                </button>
              </div>
              <div style={gaya.opsiAuth}>
                <Link to="/login" style={{ ...gaya.btnModalLogin, flex: 1 }} onClick={() => document.body.style.overflow = 'auto'}>Masuk</Link>
                <Link to="/daftar" style={{ ...gaya.btnModalDaftar, flex: 2 }} onClick={() => document.body.style.overflow = 'auto'}>Daftar Akun</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

const gaya = {
  seksiMateri: {
    width: '100%',
    padding: '100px 40px',
    backgroundColor: '#fdfbff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  } as React.CSSProperties,

  kontenMateri: {
    width: '100%',
    maxWidth: '1200px',
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
  } as React.CSSProperties,

  blokText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  } as React.CSSProperties,

  labelKecil: {
    fontSize: '14px',
    fontWeight: 700,
    color: 'var(--primary-purple)',
    letterSpacing: '2px',
  } as React.CSSProperties,

  judulUtama: {
    fontSize: '38px',
    fontWeight: 800,
    color: 'var(--text-dark)',
    lineHeight: 1.2,
  } as React.CSSProperties,

  subJudul: {
    fontSize: '16px',
    color: '#666666',
    lineHeight: 1.5,
    maxWidth: '600px',
  } as React.CSSProperties,

  wrapperFilter: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    width: '100%',
    marginBottom: '10px',
  } as React.CSSProperties,

  tombolFilter: {
    padding: '12px 24px',
    borderRadius: '100px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
  } as React.CSSProperties,

  listGaris: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  } as React.CSSProperties,

  barisMateri: {
    width: '100%',
    backgroundColor: '#ffffff',
    border: '1px solid rgba(146, 0, 239, 0.06)',
    borderRadius: '20px',
    padding: '24px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.01)',
    transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.3s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.3s ease',
    cursor: 'pointer',
    transform: 'translateX(0)',
  } as React.CSSProperties,

  barisMateriHover: {
    transform: 'translateX(8px)',
    boxShadow: '0 12px 30px rgba(146, 0, 239, 0.08)',
    borderColor: 'var(--primary-purple)',
  } as React.CSSProperties,

  infoKiri: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  } as React.CSSProperties,

  badgeLevel: {
    padding: '8px 16px',
    borderRadius: '100px',
    fontSize: '14px',
    fontWeight: 700,
    display: 'inline-block',
    transition: 'all 0.3s ease',
  } as React.CSSProperties,

  detailTeks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  } as React.CSSProperties,

  teksKategori: {
    fontSize: '12px',
    fontWeight: 700,
    color: 'var(--primary-purple)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  } as React.CSSProperties,

  judulMateri: {
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--text-dark)',
    margin: 0,
  } as React.CSSProperties,

  jumlahMisi: {
    fontSize: '14px',
    color: '#777777',
    fontWeight: 500,
  } as React.CSSProperties,

  infoKanan: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
  } as React.CSSProperties,

  teksXp: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#27c93f',
    letterSpacing: '0.5px',
  } as React.CSSProperties,

  tombolAksi: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  } as React.CSSProperties,

  overlayModal: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(26, 0, 51, 0.6)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
    padding: '20px',
  } as React.CSSProperties,

  kotakModal: {
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: '500px',
    borderRadius: '32px',
    padding: '40px',
    position: 'relative',
    boxShadow: '0 30px 60px rgba(0,0,0,0.2)',
    animation: 'elemenMuncul 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
  } as React.CSSProperties,

  tombolTutup: {
    position: 'absolute',
    top: '20px',
    right: '25px',
    background: 'none',
    border: 'none',
    fontSize: '28px',
    color: '#888',
    cursor: 'pointer',
  } as React.CSSProperties,

  modalHeader: {
    marginBottom: '24px',
  } as React.CSSProperties,

  modalBadge: {
    fontSize: '12px',
    fontWeight: 800,
    color: 'var(--primary-purple)',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  } as React.CSSProperties,

  modalJudul: {
    fontSize: '28px',
    fontWeight: 800,
    color: 'var(--text-dark)',
    marginTop: '8px',
  } as React.CSSProperties,

  modalXp: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#666',
    marginTop: '4px',
  } as React.CSSProperties,

  modalBody: {
    marginBottom: '32px',
  } as React.CSSProperties,

  modalDeskripsi: {
    fontSize: '15px',
    color: '#555',
    lineHeight: 1.6,
    marginBottom: '20px',
  } as React.CSSProperties,

  blokTopik: {
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,

  chipContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  } as React.CSSProperties,

  chip: {
    padding: '6px 14px',
    backgroundColor: '#f6effd',
    color: 'var(--primary-purple)',
    borderRadius: '100px',
    fontSize: '13px',
    fontWeight: 600,
  } as React.CSSProperties,

  modalFooter: {
    borderTop: '1px solid #f0f0f0',
    paddingTop: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  } as React.CSSProperties,

  pesanLimit: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#fffbeb',
    padding: '12px 16px',
    borderRadius: '16px',
    border: '1px solid #fef3c7',
  } as React.CSSProperties,

  teksPeringatan: {
    fontSize: '13px',
    color: '#92400e',
    fontWeight: 600,
    lineHeight: 1.4,
  } as React.CSSProperties,

  opsiAuth: {
    display: 'flex',
    gap: '12px',
  } as React.CSSProperties,

  btnModalLogin: {
    padding: '14px 20px',
    borderRadius: '14px',
    backgroundColor: '#f0f2f5',
    color: 'var(--text-dark)',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 700,
    textAlign: 'center',
    flex: 1,
  } as React.CSSProperties,

  btnModalDaftar: {
    padding: '14px 20px',
    borderRadius: '14px',
    backgroundColor: 'var(--primary-purple)',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 700,
    textAlign: 'center',
    flex: 2,
    boxShadow: '0 8px 16px rgba(146, 0, 239, 0.2)',
  } as React.CSSProperties,

  btnCobaGratis: {
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'underline',
  } as React.CSSProperties,
};

export default PratinjauMateri;