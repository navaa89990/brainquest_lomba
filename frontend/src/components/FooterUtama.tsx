import React from 'react';
import { Link } from 'react-router-dom';

function FooterUtama() {
  return (
    <footer style={gaya.wrapperFooter}>
      <div style={gaya.kontenFooter}>
        
        <div style={gaya.blokCta}>
          <h2 style={gaya.judulCta}>Siap Memulai Petualangan Belajarmu?</h2>
          <p style={gaya.subCta}>Daftar sekarang gratis dan buktikan kemampuanmu di papan peringkat sekolah.</p>
          <Link to="/daftar" style={gaya.tombolCtaBawah} className="tombol-efek-ringan">Bikin Akun Sekarang</Link>
        </div>

        <div style={gaya.gridNavigasi} className="grid-footer-mobile">
          <div style={gaya.kolomBrand} className="kolom-brand-footer">
            <span style={gaya.namaBrand}>BrainQuest</span>
            <p style={gaya.deskripsiBrand}>
              Platform belajar interaktif berbasis gamifikasi untuk membantu siswa menguasai materi dengan cara yang seru.
            </p>
          </div>

          <div style={gaya.kolomLink} className="kolom-brand-footer">
            <span style={gaya.judulKolom}>Navigasi</span>
            <ul style={gaya.listLink} className="list-link-footer">
              <li><Link to="/" style={gaya.tautan}>Beranda</Link></li>
              <li><Link to="/materi" style={gaya.tautan}>Materi</Link></li>
              <li><Link to="/kuis" style={gaya.tautan}>Arena Kuis</Link></li>
              <li><Link to="/leaderboard" style={gaya.tautan}>Leaderboard</Link></li>
            </ul>
          </div>

          <div style={gaya.kolomLink} className="kolom-brand-footer">
            <span style={gaya.judulKolom}>Kolaborasi</span>
            <ul style={gaya.listLink} className="list-link-footer">
              <li><a href="mailto:admin@brainquest.id" style={gaya.tautan}>Email Admin</a></li>
              <li><a href="https://github.com" target="_blank" rel="noreferrer" style={gaya.tautan}>Open Source</a></li>
              <li><a href="#" style={gaya.tautan}>Kemitraan Sekolah</a></li>
            </ul>
          </div>

          <div style={gaya.kolomLink} className="kolom-brand-footer">
            <span style={gaya.judulKolom}>Hubungi Kami</span>
            <p style={gaya.teksKontak}>Kuningan, West Java, Indonesia</p>
            <p style={gaya.teksKontak}>support@brainquest.id</p>
          </div>
        </div>

        <div style={gaya.garisPemisah}></div>

        <div style={gaya.blokBawah}>
          <p style={gaya.hakCipta}>&copy; 2026 BrainQuest. All rights reserved.</p>
          <div style={gaya.sosialMedia}>
            <a href="#" style={gaya.tautanSosmed}>Instagram</a>
            <a href="#" style={gaya.tautanSosmed}>GitHub</a>
            <a href="#" style={gaya.tautanSosmed}>LinkedIn</a>
          </div>
        </div>

      </div>
    </footer>
  );
}

const gaya = {
  wrapperFooter: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderTop: '1px solid rgba(244, 166, 35, 0.08)',
    padding: '100px 40px 30px 40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  } as React.CSSProperties,

  kontenFooter: {
    width: '100%',
    maxWidth: '1200px',
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,

  blokCta: {
    backgroundColor: '#ffffff',
    border: '1px solid rgba(244, 166, 35, 0.12)',
    borderRadius: '24px',
    padding: '50px 40px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 10px 30px rgba(244, 166, 35, 0.04)',
    marginBottom: '80px',
  } as React.CSSProperties,

  judulCta: {
    fontSize: '32px',
    fontWeight: 800,
    color: 'var(--text-dark)',
    lineHeight: 1.2,
    margin: 0,
  } as React.CSSProperties,

  subCta: {
    fontSize: '16px',
    color: '#666666',
    maxWidth: '520px',
    lineHeight: 1.5,
    margin: 0,
  } as React.CSSProperties,

  tombolCtaBawah: {
    marginTop: '8px',
    display: 'inline-block',
    backgroundColor: 'var(--primary-purple)',
    color: '#ffffff',
    padding: '16px 36px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 700,
    textDecoration: 'none',
    boxShadow: '0 6px 16px rgba(244, 166, 35, 0.2)',
    transition: 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.2s ease, opacity 0.2s ease',
  } as React.CSSProperties,

  gridNavigasi: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1.2fr',
    gap: '40px',
    marginBottom: '60px',
  } as React.CSSProperties,

  kolomBrand: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  } as React.CSSProperties,

  namaBrand: {
    fontSize: '24px',
    fontWeight: 800,
    color: 'var(--text-dark)',
    letterSpacing: '-0.5px',
  } as React.CSSProperties,

  deskripsiBrand: {
    fontSize: '14px',
    color: '#666666',
    lineHeight: 1.6,
    maxWidth: '320px',
  } as React.CSSProperties,

  kolomLink: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  } as React.CSSProperties,

  judulKolom: {
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--text-dark)',
    margin: 0,
  } as React.CSSProperties,

  listLink: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  } as React.CSSProperties,

  tautan: {
    fontSize: '14px',
    color: '#555555',
    textDecoration: 'none',
  } as React.CSSProperties,

  teksKontak: {
    fontSize: '14px',
    color: '#555555',
    margin: 0,
    lineHeight: 1.6,
  } as React.CSSProperties,

  garisPemisah: {
    height: '1px',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    width: '100%',
    marginBottom: '30px',
  } as React.CSSProperties,

  blokBawah: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as React.CSSProperties,

  hakCipta: {
    fontSize: '14px',
    color: '#888888',
    margin: 0,
  } as React.CSSProperties,

  sosialMedia: {
    display: 'flex',
    gap: '20px',
  } as React.CSSProperties,

  tautanSosmed: {
    fontSize: '14px',
    color: '#888888',
    textDecoration: 'none',
  } as React.CSSProperties,
};

export default FooterUtama;