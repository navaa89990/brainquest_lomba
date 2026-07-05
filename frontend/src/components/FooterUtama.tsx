import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Heart, X } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import logo from '../assets/warnalogo.png';

function FooterUtama() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showPopup, setShowPopup] = useState(false);

  const keDashboard = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) navigate('/dashboard');
    else navigate('/login');
  };

  const keAtasHalaman = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDaftar = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      setShowPopup(true);
    } else {
      navigate('/daftar');
    }
  };

  const tutupPopup = () => {
    setShowPopup(false);
  };

  return (
    <>
      <footer style={gaya.wrapperFooter}>

        <div style={gaya.blokCta}>
          <div style={gaya.kontenCta} className="grid-footer-cta">
            <div style={gaya.teksCtaGrup}>
              <h2 style={gaya.judulCta}>Siap Memulai Petualangan Belajarmu?</h2>
              <p style={gaya.subCta}>Daftar sekarang gratis dan buktikan kemampuanmu di papan peringkat.</p>
            </div>
            <a 
              href="/daftar" 
              onClick={handleDaftar}
              style={gaya.tombolCta} 
              className="tombol-efek-ringan blok-cta-feedback"
            >
              <span>Bikin Akun Sekarang</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '8px' }}>
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </a>
          </div>
        </div>

        <div style={gaya.kontenFooter}>

          <div style={gaya.gridNavigasi} className="grid-footer-mobile">

            <div style={gaya.kolomBrand} className="kolom-brand-footer">
              <div style={gaya.wrapperLogoBrand}>
                <img src={logo} alt="BrainQuest Logo" style={gaya.logoImg} width="48" height="48" />
                <span style={gaya.namaBrand}>BrainQuest</span>
              </div>
              <p style={gaya.deskripsiBrand}>
                Platform belajar interaktif berbasis gamifikasi untuk membantu siswa menguasai materi dengan cara yang seru dan menyenangkan.
              </p>
              <div style={gaya.sosialMedia}>
                <a href="#" style={gaya.ikonSosmed} aria-label="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
                <a href="https://github.com" target="_blank" rel="noreferrer" style={gaya.ikonSosmed} aria-label="GitHub">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                  </svg>
                </a>
                <a href="#" style={gaya.ikonSosmed} aria-label="LinkedIn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
              </div>
            </div>

            <div style={gaya.kolomLink}>
              <span style={gaya.judulKolom}>Navigasi</span>
              <ul style={gaya.listLink} className="list-link-footer">
                <li><a href="/" onClick={keAtasHalaman} style={gaya.tautan}>Beranda</a></li>
                <li><Link to="/materi" style={gaya.tautan}>Materi</Link></li>
                <li><Link to="/kuis" style={gaya.tautan}>Arena Kuis</Link></li>
                <li><Link to="/leaderboard" style={gaya.tautan}>Leaderboard</Link></li>
              </ul>
            </div>

            <div style={gaya.kolomLink}>
              <span style={gaya.judulKolom}>Akun</span>
              <ul style={gaya.listLink} className="list-link-footer">
                <li><Link to="/daftar" style={gaya.tautan}>Daftar Gratis</Link></li>
                <li><Link to="/login" style={gaya.tautan}>Masuk</Link></li>
                <li><a href="/dashboard" onClick={keDashboard} style={gaya.tautan}>Dashboard</a></li>
              </ul>
            </div>

            <div style={gaya.kolomLink}>
              <span style={gaya.judulKolom}>Hubungi Kami</span>
              <div style={gaya.kontakItem}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F4A623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <p style={gaya.teksKontak}>Kuningan, Jawa Barat, Indonesia</p>
              </div>
              <div style={gaya.kontakItem}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F4A623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                <p style={gaya.teksKontak}>support@brainquest.id</p>
              </div>
            </div>

          </div>

          <div style={gaya.garisPemisah}></div>

          <div style={gaya.blokBawah} className="baris-papan-blur">
            <p style={gaya.hakCipta}>© 2026 BrainQuest. All rights reserved.</p>
            <p style={gaya.teksKreditBawah}>Dibuat dengan <Heart size={14} style={{ display: 'inline', margin: '0 4px', color: '#f43f5e' }} /> untuk pelajar Indonesia</p>
          </div>

        </div>
      </footer>

      {/* POPUP UNTUK USER YANG SUDAH LOGIN */}
      {showPopup && (
        <div style={gaya.overlayPopup} onClick={tutupPopup}>
          <div style={gaya.kotakPopup} onClick={(e) => e.stopPropagation()}>
            <button style={gaya.tombolTutupPopup} onClick={tutupPopup}><X size={18} /></button>
            <div style={gaya.ikonPopup}><Bell size={24} /></div>
            <h3 style={gaya.judulPopup}>Halo, Kamu Sudah Login!</h3>
            <p style={gaya.deskripsiPopup}>
              Kamu sudah memiliki akun BrainQuest. Silakan <strong>logout</strong> terlebih dahulu jika ingin mendaftar dengan akun baru.
            </p>
            <div style={gaya.grupTombolPopup}>
              <button onClick={tutupPopup} style={gaya.tombolPopupSekunder}>
                Oke, Saya Mengerti
              </button>
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.href = '/daftar';
                }} 
                style={gaya.tombolPopupUtama}
              >
                Logout & Daftar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const gaya = {
  wrapperFooter: {
    width: '100%',
    backgroundColor: '#111827',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  } as React.CSSProperties,

  blokCta: {
    width: '100%',
    backgroundColor: 'var(--primary-purple)',
    padding: '56px 40px',
    display: 'flex',
    justifyContent: 'center',
  } as React.CSSProperties,

  kontenCta: {
    width: '100%',
    maxWidth: '1200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '32px',
    flexWrap: 'wrap',
  } as React.CSSProperties,

  teksCtaGrup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  } as React.CSSProperties,

  judulCta: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#ffffff',
    lineHeight: 1.2,
    margin: 0,
  } as React.CSSProperties,

  subCta: {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.8)',
    margin: 0,
  } as React.CSSProperties,

  tombolCta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#ffffff',
    color: 'var(--primary-purple)',
    padding: '16px 32px',
    borderRadius: '14px',
    fontSize: '15px',
    fontWeight: 800,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    transition: 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.2s ease',
    flexShrink: 0,
    cursor: 'pointer',
    border: 'none',
  } as React.CSSProperties,

  kontenFooter: {
    width: '100%',
    maxWidth: '1200px',
    padding: '64px 40px 32px 40px',
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,

  gridNavigasi: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1.3fr',
    gap: '48px',
    marginBottom: '56px',
  } as React.CSSProperties,

  kolomBrand: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  } as React.CSSProperties,

  wrapperLogoBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  } as React.CSSProperties,

  logoImg: {
    width: '72px',
    height: '72px',
    objectFit: 'contain',
    marginLeft: '-10px',
  } as React.CSSProperties,

  namaBrand: {
    fontSize: '22px',
    fontWeight: 800,
    color: '#ffffff',
    letterSpacing: '-0.5px',
  } as React.CSSProperties,

  deskripsiBrand: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 1.7,
    maxWidth: '300px',
    margin: 0,
  } as React.CSSProperties,

  sosialMedia: {
    display: 'flex',
    gap: '10px',
    marginTop: '4px',
  } as React.CSSProperties,

  ikonSosmed: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    backgroundColor: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(255,255,255,0.55)',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  kolomLink: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  } as React.CSSProperties,

  judulKolom: {
    fontSize: '13px',
    fontWeight: 700,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  } as React.CSSProperties,

  listLink: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  } as React.CSSProperties,

  tautan: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.55)',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
  } as React.CSSProperties,

  kontakItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    marginTop: '2px',
  } as React.CSSProperties,

  teksKontak: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.55)',
    margin: 0,
    lineHeight: 1.5,
  } as React.CSSProperties,

  garisPemisah: {
    height: '1px',
    backgroundColor: 'rgba(255,255,255,0.07)',
    width: '100%',
    marginBottom: '28px',
  } as React.CSSProperties,

  blokBawah: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  } as React.CSSProperties,

  hakCipta: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.3)',
    margin: 0,
  } as React.CSSProperties,

  teksKreditBawah: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.3)',
    margin: 0,
  } as React.CSSProperties,

  // POPUP STYLES
  overlayPopup: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
    animation: 'fadeIn 0.3s ease',
  } as React.CSSProperties,

  kotakPopup: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '40px',
    maxWidth: '440px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 30px 60px rgba(0, 0, 0, 0.2)',
    position: 'relative',
    animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
  } as React.CSSProperties,

  tombolTutupPopup: {
    position: 'absolute',
    top: '12px',
    right: '16px',
    background: 'none',
    border: 'none',
    fontSize: '20px',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '4px',
    lineHeight: 1,
  } as React.CSSProperties,

  ikonPopup: {
    fontSize: '48px',
    display: 'block',
    marginBottom: '12px',
  } as React.CSSProperties,

  judulPopup: {
    fontSize: '22px',
    fontWeight: 800,
    color: '#0f172a',
    margin: '0 0 8px 0',
  } as React.CSSProperties,

  deskripsiPopup: {
    fontSize: '15px',
    color: '#64748b',
    lineHeight: 1.6,
    margin: '0 0 24px 0',
  } as React.CSSProperties,

  grupTombolPopup: {
    display: 'flex',
    gap: '10px',
    flexDirection: 'column',
  } as React.CSSProperties,

  tombolPopupSekunder: {
    padding: '12px 24px',
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s ease',
    width: '100%',
  } as React.CSSProperties,

  tombolPopupUtama: {
    padding: '12px 24px',
    backgroundColor: 'var(--primary-purple)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
    boxShadow: '0 4px 12px rgba(244, 166, 35, 0.25)',
    width: '100%',
  } as React.CSSProperties,
};

// Tambahkan keyframes untuk animasi
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
`;
document.head.appendChild(styleSheet);

export default FooterUtama;