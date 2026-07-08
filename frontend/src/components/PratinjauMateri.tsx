import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Lock } from 'lucide-react';
import { apiService } from '../lib/apiService';
import { useTheme } from '../lib/ThemeContext';

interface Materi {
  id: number;
  title: string;
  content: string;
  category: string;
  img?: string;
  status?: string;
  parent_id?: number | null;
}

function PratinjauMateri() {
  const navigate = useNavigate();
  const { theme, colors } = useTheme();
  const [loading, setLoading] = useState(true);

  const daftarKategori = ['Semua', 'Pemrograman', 'Pengetahuan Umum', 'Bahasa Indonesia', 'Bahasa Inggris'];

  useEffect(() => {
    const fetchMateri = async () => {
      setLoading(true);
      try {
        const response = await apiService.getMaterials(1, 100);
        setListMateri(response.materials || []);
      } catch (err) {
        console.error(err);
        setListMateri([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMateri();
  }, []);

  const [listMateri, setListMateri] = useState<Materi[]>([]);
  const [expandedParent, setExpandedParent] = useState<number | null>(null);
  const [kategoriAktif, setKategoriAktif] = useState<string>('Semua');
  const [kartuAktif, setKartuAktif] = useState<string | number | null>(null);
  const [modalBuka, setModalBuka] = useState(false);
  const [materiTerpilih, setMateriTerpilih] = useState<Materi | null>(null);

  const materiParent = listMateri.filter(item => {
    if (item.parent_id !== null && item.parent_id !== undefined) {
      return false;
    }
    return true;
  });

  const getAllChildMaterials = (parentId: number) => {
    return listMateri.filter(item => item.parent_id === parentId);
  };

  const materiTersaring = kategoriAktif === 'Semua'
    ? materiParent
    : materiParent.filter(item => item.category === kategoriAktif);

  const toggleExpand = (parentId: number) => {
    setExpandedParent(expandedParent === parentId ? null : parentId);
  };

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

  const gaya = {
    seksiMateri: {
      width: '100%',
      padding: '100px 40px',
      backgroundColor: colors.background,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      transition: 'background-color 0.2s',
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
      color: '#F4A623',
      letterSpacing: '2px',
    } as React.CSSProperties,

    judulUtama: {
      fontSize: '38px',
      fontWeight: 800,
      color: colors.text,
      lineHeight: 1.2,
    } as React.CSSProperties,

    subJudul: {
      fontSize: '16px',
      color: colors.subtext,
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

    tombolFilter: (aktif: boolean) => ({
      padding: '12px 24px',
      borderRadius: '100px',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.25s ease',
      boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
      backgroundColor: aktif ? '#F4A623' : colors.surface,
      color: aktif ? '#ffffff' : colors.text,
      border: aktif ? '1px solid #F4A623' : `1px solid ${colors.border}`,
    }),

    listGaris: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    } as React.CSSProperties,

    barisMateri: {
      width: '100%',
      backgroundColor: colors.surface,
      border: '1px solid transparent',
      borderRadius: '20px',
      padding: '24px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.01)',
      transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.3s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.3s ease, background-color 0.2s',
      cursor: 'default',
      transform: 'translateX(0)',
    } as React.CSSProperties,

    barisMateriHover: {
      transform: 'translateX(8px)',
      boxShadow: theme === 'dark' ? '0 12px 30px rgba(0, 0, 0, 0.3)' : '0 12px 30px rgba(244, 166, 35, 0.08)',
    } as React.CSSProperties,

    infoKiri: {
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
    } as React.CSSProperties,

    badgeLevel: (sedangHover: boolean) => ({
      padding: '8px 16px',
      borderRadius: '100px',
      fontSize: '14px',
      fontWeight: 700,
      display: 'inline-block',
      transition: 'all 0.3s ease',
      backgroundColor: sedangHover ? '#F4A623' : (theme === 'dark' ? 'rgba(244, 166, 35, 0.15)' : 'rgba(244, 166, 35, 0.08)'),
      color: sedangHover ? '#ffffff' : '#F4A623',
    }),

    detailTeks: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    } as React.CSSProperties,

    teksKategori: {
      fontSize: '12px',
      fontWeight: 700,
      color: '#F4A623',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    } as React.CSSProperties,

    judulMateri: {
      fontSize: '20px',
      fontWeight: 700,
      color: colors.text,
      margin: 0,
    } as React.CSSProperties,

    jumlahMisi: {
      fontSize: '14px',
      color: colors.subtext,
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

    tombolAksi: (sedangHover: boolean) => ({
      padding: '12px 24px',
      border: 'none',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backgroundColor: sedangHover ? '#F4A623' : (theme === 'dark' ? colors.background : '#f0f2f5'),
      color: sedangHover ? '#ffffff' : colors.text,
    }),

    overlayModal: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(26, 0, 51, 0.6)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000,
      padding: '20px',
    } as React.CSSProperties,

    kotakModal: {
      backgroundColor: colors.surface,
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
      color: colors.subtext,
      cursor: 'pointer',
    } as React.CSSProperties,

    modalHeader: {
      marginBottom: '24px',
    } as React.CSSProperties,

    modalBadge: {
      fontSize: '12px',
      fontWeight: 800,
      color: '#F4A623',
      letterSpacing: '1px',
      textTransform: 'uppercase',
    } as React.CSSProperties,

    modalJudul: {
      fontSize: '28px',
      fontWeight: 800,
      color: colors.text,
      marginTop: '8px',
    } as React.CSSProperties,

    modalXp: {
      fontSize: '14px',
      fontWeight: 600,
      color: colors.subtext,
      marginTop: '4px',
    } as React.CSSProperties,

    modalBody: {
      marginBottom: '32px',
    } as React.CSSProperties,

    modalDeskripsi: {
      fontSize: '15px',
      color: colors.text,
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
      backgroundColor: theme === 'dark' ? 'rgba(244, 166, 35, 0.15)' : '#f6effd',
      color: '#F4A623',
      borderRadius: '100px',
      fontSize: '13px',
      fontWeight: 600,
    } as React.CSSProperties,

    modalFooter: {
      borderTop: `1px solid ${colors.border}`,
      paddingTop: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    } as React.CSSProperties,

    pesanLimit: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      backgroundColor: theme === 'dark' ? 'rgba(245, 158, 11, 0.1)' : '#fffbeb',
      padding: '12px 16px',
      borderRadius: '16px',
      border: theme === 'dark' ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid #fef3c7',
    } as React.CSSProperties,

    teksPeringatan: {
      fontSize: '13px',
      color: theme === 'dark' ? '#fbbf24' : '#92400e',
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
      backgroundColor: colors.background,
      color: colors.text,
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: 700,
      textAlign: 'center',
      flex: 1,
    } as React.CSSProperties,

    btnModalDaftar: {
      padding: '14px 20px',
      borderRadius: '14px',
      backgroundColor: '#F4A623',
      color: '#ffffff',
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: 700,
      textAlign: 'center',
      flex: 2,
      boxShadow: '0 8px 16px rgba(244, 166, 35, 0.2)',
    } as React.CSSProperties,

    btnCobaGratis: {
      background: 'none',
      border: 'none',
      color: colors.subtext,
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      textDecoration: 'underline',
    } as React.CSSProperties,
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
              style={gaya.tombolFilter(kategoriAktif === kat)}
              onClick={() => setKategoriAktif(kat)}
            >
              {kat}
            </button>
          ))}
        </div>

        <div style={gaya.listGaris}>
          {loading ? (
            <p style={{ color: colors.subtext, fontSize: '15px' }}>Memuat materi...</p>
          ) : materiTersaring.map((materi, indeks) => {
            const sedangHover = kartuAktif === indeks;
            const childMaterials = getAllChildMaterials(materi.id);
            const isExpanded = expandedParent === materi.id;
            const hasChildren = childMaterials.length > 0;

            return (
              <div key={materi.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div
                  style={{ 
                    ...gaya.barisMateri, 
                    ...(sedangHover ? gaya.barisMateriHover : {}),
                    ...(hasChildren ? { cursor: 'pointer' } : {})
                  }}
                  className="baris-materi-item"
                  onMouseEnter={() => setKartuAktif(indeks)}
                  onMouseLeave={() => setKartuAktif(null)}
                  onClick={() => hasChildren && toggleExpand(materi.id)}
                >
                  <div style={gaya.infoKiri} className="info-kiri-materi">
                    <span style={gaya.badgeLevel(sedangHover)}>
                      {materi.category}
                    </span>
                    <div style={gaya.detailTeks}>
                      <h3 style={gaya.judulMateri}>
                        {materi.title}
                        {hasChildren && (
                          <span style={{ 
                            marginLeft: '12px', 
                            fontSize: '14px', 
                            color: '#F4A623',
                            fontWeight: 600
                          }}>
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />} <span style={{ marginLeft: '4px' }}>{childMaterials.length} submateri</span>
                          </span>
                        )}
                      </h3>
                      <span style={gaya.jumlahMisi}>{(materi.content || '').split(' ').slice(0, 12).join(' ')}...</span>
                    </div>
                  </div>
                  <div style={gaya.infoKanan} className="info-kanan-materi">
                    <button
                      style={gaya.tombolAksi(sedangHover)}
                      className="tombol-aksi-materi tombol-efek-ringan"
                      onClick={(e) => {
                        e.stopPropagation();
                        bukaModal(materi);
                      }}
                    >
                      Lihat Misi
                    </button>
                  </div>
                </div>

                {isExpanded && hasChildren && (
                  <div style={{ 
                    marginLeft: '40px', 
                    paddingLeft: '20px', 
                    borderLeft: `2px solid ${colors.border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    {childMaterials.map((child) => {
                      const childKey = `child-${child.id}`;
                      const childHover = kartuAktif === childKey;
                      return (
                        <div
                          key={child.id}
                          style={{ 
                            ...gaya.barisMateri, 
                            ...(childHover ? gaya.barisMateriHover : {}),
                            padding: '16px 24px',
                            backgroundColor: colors.background,
                            border: '1px solid transparent'
                          }}
                          className="baris-materi-item"
                          onMouseEnter={() => setKartuAktif(childKey)}
                          onMouseLeave={() => setKartuAktif(null)}
                        >
                          <div style={gaya.infoKiri} className="info-kiri-materi">
                            <span style={{
                              ...gaya.badgeLevel(false),
                              backgroundColor: theme === 'dark' ? 'rgba(244, 166, 35, 0.15)' : 'rgba(244, 166, 35, 0.08)',
                              color: '#F4A623',
                              fontSize: '12px',
                              padding: '4px 12px'
                            }}>
                              Sub
                            </span>
                            <div style={gaya.detailTeks}>
                              <h3 style={{ ...gaya.judulMateri, fontSize: '16px' }}>{child.title}</h3>
                              <span style={gaya.jumlahMisi}>{(child.content || '').split(' ').slice(0, 10).join(' ')}...</span>
                            </div>
                          </div>
                          <div style={gaya.infoKanan} className="info-kanan-materi">
                            <button
                              style={gaya.tombolAksi(childHover)}
                              className="tombol-aksi-materi tombol-efek-ringan"
                              onClick={(e) => {
                                e.stopPropagation();
                                bukaModal(child);
                              }}
                            >
                              Lihat Misi
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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
              <p style={gaya.modalDeskripsi}>{(materiTerpilih.content || '').split(' ').slice(0, 40).join(' ')}...</p>
            </div>

            <div style={gaya.modalFooter}>
              <div style={gaya.pesanLimit}>
                <span style={{ display: 'inline-flex' }}><Lock size={20} color="#6366f1" /></span>
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

export default PratinjauMateri;