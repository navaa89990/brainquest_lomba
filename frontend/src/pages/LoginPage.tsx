import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';
import logo from '../assets/warnalogo.png';
import laptop from '../assets/laptop.png';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lihatPassword, setLihatPassword] = useState(false);

  const kembali = () => navigate(-1);

  const tanganiLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err?.message || 'Login gagal. Periksa email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.halamanWrapper}>
      <div style={styles.kontainerUtama} className="login-container">

        <div style={styles.sisiKiriIlustrasi} className="login-sisi-kiri">
          <button onClick={kembali} style={styles.btnKembali}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Kembali
          </button>

          <div style={styles.kontenIlustrasi}>
            <div style={styles.wrapperLogo}>
              <div style={styles.logoFrame}>
                <img src={logo} alt="BrainQuest Logo" style={styles.logoImg} />
              </div>
              <span style={styles.teksLogo}>BrainQuest</span>
            </div>
            <h1 style={styles.judulKiri}>Selamat Datang Kembali!</h1>
            <p style={styles.subKiri}>Masuk dan lanjutkan perjalanan belajarmu. Raih XP lebih banyak hari ini!</p>
            <div style={styles.wadahMockup}>
              <img src={laptop} alt="BrainQuest Dashboard" style={styles.gambarMockup} />
            </div>
          </div>
        </div>

        <div style={styles.sisiKananForm} className="login-sisi-kanan">
          <div style={styles.blokForm}>
            <button type="button" onClick={kembali} style={styles.btnKembaliMobile} className="btn-kembali-auth-mobile">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Beranda
            </button>

            <div style={styles.headerForm}>
              <h2 style={styles.judulKanan}>Masuk ke Akun</h2>
              <p style={styles.subKanan}>Belum punya akun? <Link to="/daftar" style={styles.linkDaftar}>Daftar gratis</Link></p>
            </div>

            <form onSubmit={tanganiLogin} style={styles.formElement}>
              {error ? <p style={{ color: '#dc2626', marginBottom: '12px', fontSize: '14px' }}>{error}</p> : null}

              <div style={styles.grupInput}>
                <label style={styles.labelTeks}>Email</label>
                <div style={styles.wadahField}>
                  <span style={styles.ikonSamping}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </span>
                  <input
                    type="email"
                    placeholder="masukan email anda"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.inputField}
                    required
                  />
                </div>
              </div>

              <div style={styles.grupInput}>
                <label style={styles.labelTeks}>Password</label>
                <div style={styles.wadahField}>
                  <span style={styles.ikonSamping}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    type={lihatPassword ? 'text' : 'password'}
                    placeholder="masukan password anda"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.inputField}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setLihatPassword(!lihatPassword)}
                    style={styles.tombolMata}
                    aria-label="Toggle password visibility"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2d3748" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                </div>
              </div>

              <button type="submit" style={styles.btnMasuk} className="tombol-efek-ringan" disabled={loading}>
                {loading ? 'Memuat...' : 'Masuk'}
              </button>
            </form>

            <p style={styles.teksBawah}>
              Belum punya akun? <Link to="/daftar" style={styles.linkDaftar}>Daftar sekarang</Link>
            </p>
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 968px) {
          .login-container {
            flex-direction: column !important;
          }
          .login-sisi-kiri {
            display: none !important;
          }
          .login-sisi-kanan {
            padding: 40px 24px !important;
            width: 100% !important;
          }
          .btn-kembali-auth-mobile {
            display: inline-flex !important;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  halamanWrapper: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-gray)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  } as React.CSSProperties,

  kontainerUtama: {
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    backgroundColor: '#ffffff',
  } as React.CSSProperties,

  sisiKiriIlustrasi: {
    flex: '0 0 35%',
    backgroundColor: 'var(--primary-purple)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
    position: 'relative',
    overflow: 'hidden',
    borderTopRightRadius: '32px',
    borderBottomRightRadius: '32px',
    boxShadow: '4px 0 25px rgba(244, 166, 35, 0.2)',
  } as React.CSSProperties,

  btnKembali: {
    position: 'absolute',
    top: '32px',
    left: '32px',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    borderRadius: '100px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
  } as React.CSSProperties,

  kontenIlustrasi: {
    width: '100%',
    maxWidth: '380px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    zIndex: 2,
  } as React.CSSProperties,

  wrapperLogo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '12px',
    marginBottom: '24px',
    marginLeft: '-45px',
  } as React.CSSProperties,

  logoFrame: {
    width: '64px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: '30px',
  } as React.CSSProperties,

  logoImg: {
    width: '140px',
    height: '140px',
    objectFit: 'contain',
    filter: 'brightness(0) invert(1)',
  } as React.CSSProperties,

  teksLogo: {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: 800,
    letterSpacing: '-0.5px',
    lineHeight: 1,
    display: 'inline-block',
    paddingTop: '20px',
  } as React.CSSProperties,

  judulKiri: {
    fontSize: '32px',
    fontWeight: 850,
    color: '#ffffff',
    lineHeight: 1.25,
    marginBottom: '16px',
  } as React.CSSProperties,

  subKiri: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 1.6,
    marginBottom: '40px',
  } as React.CSSProperties,

  wadahMockup: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  } as React.CSSProperties,

  gambarMockup: {
    width: '100%',
    height: 'auto',
    maxWidth: '360px',
    objectFit: 'contain',
    filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.2))',
  } as React.CSSProperties,

  sisiKananForm: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '60px',
    backgroundColor: '#ffffff',
  } as React.CSSProperties,

  blokForm: {
    width: '100%',
    maxWidth: '420px',
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,

  btnKembaliMobile: {
    display: 'none',
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '22px',
    padding: '8px 13px',
    borderRadius: '999px',
    border: '1px solid rgba(244, 166, 35, 0.22)',
    backgroundColor: '#fffbeb',
    color: '#d97706',
    fontSize: '13px',
    fontWeight: 800,
    cursor: 'pointer',
  } as React.CSSProperties,

  headerForm: {
    marginBottom: '36px',
    textAlign: 'center',
  } as React.CSSProperties,

  judulKanan: {
    fontSize: '28px',
    fontWeight: 800,
    color: 'var(--text-dark)',
    marginBottom: '8px',
  } as React.CSSProperties,

  subKanan: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: 500,
  } as React.CSSProperties,

  formElement: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  } as React.CSSProperties,

  grupInput: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  } as React.CSSProperties,

  labelTeks: {
    fontSize: '14px',
    fontWeight: 700,
    color: 'var(--text-dark)',
  } as React.CSSProperties,

  wadahField: {
    width: '100%',
    height: '56px',
    border: '2px solid var(--primary-purple)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 12px rgba(244, 166, 35, 0.05)',
  } as React.CSSProperties,

  ikonSamping: {
    paddingLeft: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,

  inputField: {
    flex: 1,
    height: '100%',
    border: 'none',
    outline: 'none',
    padding: '0 18px',
    fontSize: '15px',
    color: 'var(--text-dark)',
    fontWeight: 500,
    backgroundColor: 'transparent',
  } as React.CSSProperties,

  tombolMata: {
    position: 'absolute',
    right: '18px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  } as React.CSSProperties,

  btnMasuk: {
    width: '100%',
    height: '54px',
    backgroundColor: 'var(--primary-purple)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '16px',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: '12px',
    boxShadow: '0 8px 24px rgba(244, 166, 35, 0.3)',
  } as React.CSSProperties,

  teksBawah: {
    fontSize: '14px',
    color: '#64748b',
    textAlign: 'center',
    marginTop: '28px',
    fontWeight: 500,
  } as React.CSSProperties,

  linkDaftar: {
    color: 'var(--primary-purple)',
    textDecoration: 'none',
    fontWeight: 700,
  } as React.CSSProperties,
};

export default LoginPage;
