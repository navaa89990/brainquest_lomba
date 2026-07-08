import React, { useEffect } from 'react';
import { useTheme, themeStyles } from '../lib/ThemeContext';
import { useAuth } from '../lib/useAuth';
import logo from '../assets/warnalogo.png';
import FiturUtama from '../components/FiturUtama';
import PratinjauMateri from '../components/PratinjauMateri';
import StatistikKomunitas from '../components/StatistikKomunitas';
import FooterUtama from '../components/FooterUtama';

function Home() {
  const { isAuthenticated } = useAuth();
  const { theme, setTheme, colors } = useTheme();

  useEffect(() => {
    if (!isAuthenticated && theme !== 'light') {
      setTheme('light');
    }
  }, [isAuthenticated, theme, setTheme]);

  const activeTheme = isAuthenticated ? theme : 'light';
  const activeColors = isAuthenticated ? colors : themeStyles.light;

  const scrollKeMisi = () => {
    document.getElementById('tahapan-misi')?.scrollIntoView({ behavior: 'smooth' });
  };

  const heroBgColor = activeTheme === 'dark' ? activeColors.background : '#FAF9F6';
  const gridDotColor = activeTheme === 'dark' ? 'rgba(244, 166, 35, 0.05)' : 'rgba(244, 166, 35, 0.04)';
  const glowColor = activeTheme === 'dark' ? 'rgba(244, 166, 35, 0.04)' : 'rgba(244, 166, 35, 0.03)';

  useEffect(() => {
    const canvas = document.getElementById('hero-particles') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = 35;
    const particles: Array<{ x: number; y: number; r: number; d: number; speed: number; opacity: number }> = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.8 + 0.8,
        d: Math.random() * particleCount,
        speed: Math.random() * 0.4 + 0.1,
        opacity: Math.random() * 0.5 + 0.1
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
        ctx.fillStyle = `rgba(244, 166, 35, ${p.opacity})`;
        ctx.fill();

        p.y -= p.speed;
        p.x += Math.sin(p.d) * 0.15;
        p.d += 0.005;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeTheme]);

  const gaya = {
    wrapperHero: {
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '140px 40px 60px 40px',
      backgroundColor: heroBgColor,
      backgroundImage: `
        radial-gradient(circle, ${gridDotColor} 1.5px, transparent 1.5px),
        radial-gradient(circle at 30% 40%, ${glowColor}, transparent 60%)
      `,
      backgroundSize: '24px 24px, 100% 100%',
      position: 'relative' as const,
      overflow: 'hidden' as const,
    } as React.CSSProperties,

    canvas: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 1,
      pointerEvents: 'none' as const,
    } as React.CSSProperties,

    kontenHero: {
      width: '100%',
      maxWidth: '1200px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '60px',
      position: 'relative' as const,
      zIndex: 2,
    } as React.CSSProperties,

    blokKiri: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    } as React.CSSProperties,

    tulisanGede: {
      fontSize: '56px',
      fontWeight: 900,
      lineHeight: 1.1,
      marginBottom: '24px',
      color: activeColors.text,
    } as React.CSSProperties,

    warnaUngu: {
      color: '#F4A623',
    } as React.CSSProperties,

    subTeks: {
      fontSize: '18px',
      color: activeColors.subtext,
      lineHeight: 1.6,
      marginBottom: '40px',
      maxWidth: '520px',
    } as React.CSSProperties,

    tombolCta: {
      width: 'fit-content',
      backgroundColor: '#F4A623',
      color: 'white',
      padding: '18px 42px',
      borderRadius: '16px',
      fontSize: '18px',
      fontWeight: 700,
      border: 'none',
      cursor: 'pointer',
      boxShadow: '0 8px 20px rgba(244, 166, 35, 0.25)',
      transition: 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.2s ease, opacity 0.2s ease',
    } as React.CSSProperties,

    blokKanan: {
      flex: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    } as React.CSSProperties,

    frameBuku: {
      width: '100%',
      maxWidth: '500px',
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    } as React.CSSProperties,

    vektorBuku: {
      width: '100%',
      height: 'auto',
      filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.15))',
    } as React.CSSProperties,

    kertasBuku: {
      transformOrigin: '250px 200px',
      animation: 'gerakMelayang 6.3s ease-in-out infinite',
    } as React.CSSProperties,

    lembarKiri: {
      transformOrigin: '250px 200px',
      animation: 'lembarKiriBuka 1.35s cubic-bezier(0.4, 0, 0.2, 1) forwards',
    } as React.CSSProperties,

    lembarKanan: {
      transformOrigin: '250px 200px',
      animation: 'lembarKananBuka 1.35s cubic-bezier(0.4, 0, 0.2, 1) forwards',
    } as React.CSSProperties,

    wadahLogo: {
      position: 'absolute',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
      transform: 'translateY(-20px)',
    } as React.CSSProperties,

    logoMuncul: {
      width: '160px',
      height: '160px',
      objectFit: 'contain',
      opacity: 0,
      transform: 'scale(0.5) translateY(30px)',
      animation: 'elemenMuncul 1.1s cubic-bezier(0.34, 1.56, 0.64, 1) 1.15s forwards, gerakMelayang 3.8s ease-in-out infinite 2.25s',
    } as React.CSSProperties,

    teksMuncul: {
      fontSize: '28px',
      fontWeight: 900,
      color: '#F4A623',
      letterSpacing: '2px',
      marginTop: '10px',
      opacity: 0,
      transform: 'translateY(20px)',
      animation: 'elemenMuncul 0.95s ease-out 1.4s forwards',
      textShadow: '0 4px 12px rgba(244, 166, 35, 0.2)',
    } as React.CSSProperties,

    efekSinar: {
      position: 'absolute',
      width: '180px',
      height: '180px',
      borderRadius: '50%',
      backgroundColor: '#F4A623',
      filter: 'blur(60px)',
      opacity: 0,
      zIndex: 5,
      animation: 'efekSinarDenyut 1.8s ease-out 0.9s forwards, denyutLambat 3.7s infinite 2.8s',
    } as React.CSSProperties,
  };

  return (
    <>
      <main style={gaya.wrapperHero} className="wrapper-hero-utama">
        <canvas id="hero-particles" style={gaya.canvas}></canvas>
        <div style={gaya.kontenHero} className="konten-hero-utama">
          
          <div style={gaya.blokKiri}>
            <h1 style={gaya.tulisanGede} className="judul-gede-mobile">
              Ubah Cara Belajarmu Dengan <br />
              <span style={gaya.warnaUngu}>MISI YANG SERU!</span>
            </h1>
            <p style={gaya.subTeks} className="subteks-mobile">
              Taklukkan tantangan harian, kuasai materi pelajaran dalam 5 menit, 
              dan jadilah juara di papan peringkat BrainQuest.
            </p>
            <button 
              style={gaya.tombolCta} 
              className="tombol-efek-ringan tombol-cta-mobile"
              onClick={scrollKeMisi}
            >
              Mulai Explore
            </button>
          </div>

          <div style={gaya.blokKanan}>
            <div style={gaya.frameBuku}>
              <div style={gaya.efekSinar}></div>
              
              <svg viewBox="0 0 500 400" style={gaya.vektorBuku}>
                <defs>
                  <linearGradient id="coverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#c47d0a' }} />
                    <stop offset="100%" style={{ stopColor: '#7a4e08' }} />
                  </linearGradient>
                  <linearGradient id="pageGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: activeTheme === 'dark' ? '#334155' : '#e0e0e0' }} />
                    <stop offset="10%" style={{ stopColor: activeTheme === 'dark' ? '#1e293b' : '#ffffff' }} />
                    <stop offset="90%" style={{ stopColor: activeTheme === 'dark' ? '#1e293b' : '#ffffff' }} />
                    <stop offset="100%" style={{ stopColor: activeTheme === 'dark' ? '#334155' : '#e0e0e0' }} />
                  </linearGradient>
                </defs>

                <path 
                  d="M 50,320 Q 250,350 450,320 L 460,70 Q 250,100 40,70 Z" 
                  fill="url(#coverGrad)" 
                  stroke="#F4A623" 
                  strokeWidth="3"
                />

                <path 
                  d="M 60,310 Q 250,335 440,310 L 445,80 Q 250,105 55,80 Z" 
                  fill="url(#pageGrad)" 
                  style={gaya.kertasBuku}
                />

                <path 
                  d="M 250,85 Q 350,95 442,82 L 438,308 Q 350,320 250,310 Z" 
                  fill={activeTheme === 'dark' ? '#1e293b' : '#ffffff'} 
                  style={gaya.lembarKanan}
                />
                <path 
                  d="M 250,85 Q 150,95 58,82 L 62,308 Q 150,320 250,310 Z" 
                  fill={activeTheme === 'dark' ? '#212d42' : '#fffcf5'} 
                  style={gaya.lembarKiri}
                />

                <line x1="250" y1="85" x2="250" y2="310" stroke={activeTheme === 'dark' ? '#334155' : '#e8d5a8'} strokeWidth="2" />
              </svg>

              <div style={gaya.wadahLogo} className="wadah-logo-hero-mobile">
                <img src={logo} alt="BrainQuest Logo" style={gaya.logoMuncul} width="160" height="160" />
                <h2 style={gaya.teksMuncul} className="teks-brainquest-hero-mobile">BRAINQUEST</h2>
              </div>
            </div>
          </div>

        </div>
      </main>

      <FiturUtama />
      <PratinjauMateri />
      <StatistikKomunitas />
      <FooterUtama />
    </>
  );
}

export default Home;