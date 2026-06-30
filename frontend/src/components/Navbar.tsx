import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';
import logo from '../assets/warnalogo.png';

function Navbar() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [menuTerbuka, setMenuTerbuka] = useState(false);
  const [terscroll, setTerscroll] = useState(false);
  const [hpMenuBuka, setHpMenuBuka] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setTerscroll(true);
      } else {
        setTerscroll(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setHpMenuBuka(false);
  }, [location]);

  const navigation = [
    { name: 'Beranda', path: '/' },
    { name: 'Materi', path: '/materi' },
    { name: 'Arena Kuis', path: '/kuis' },
    { name: 'Leaderboard', path: '/leaderboard' },
    ...(isAuthenticated && user?.role === 'admin' ? [{ name: 'Admin', path: '/admin' }] : []),
  ];

  return (
    <header style={{
      ...styles.wrapper,
      ...(terscroll ? styles.wrapperLiquid : {})
    }}>
      <div style={styles.container}>
        
        <div style={styles.leftSection}>
          <Link to="/" style={styles.brand} title="BrainQuest Home">
            <div style={styles.logoWrapper}>
              <img src={logo} alt="BrainQuest Logo" style={styles.logoImg} width="200" height="200" />
            </div>
            <span style={styles.brandName}>BrainQuest</span>
          </Link>
        </div>

        <div style={styles.centerSection} className="blok-center-desktop">
          <nav style={{
            ...styles.navCapsule,
            ...(terscroll ? styles.navCapsuleLiquid : {})
          }} aria-label="Main Navigation">
            <ul style={styles.menuList}>
              {navigation.map((item) => {
                const isActive = location.pathname === item.path;
                
                return (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      style={{
                        ...styles.item,
                        ...(isActive ? styles.active : {}),
                      }}
                    >
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div style={styles.rightSectionDesktop} className="blok-kanan-desktop">
          <div 
            style={styles.profileWrapper}
            onMouseEnter={() => setMenuTerbuka(true)}
            onMouseLeave={() => setMenuTerbuka(false)}
          >
            <button style={styles.profileBtn} aria-label="User Profile" aria-haspopup="true" aria-expanded={menuTerbuka}>
              <div style={styles.avatarDesign}>
                <div style={styles.avatarHead}></div>
                <div style={styles.avatarBody}></div>
              </div>
            </button>

            <div style={{
              ...styles.kotakMelayang,
              opacity: menuTerbuka ? 1 : 0,
              transform: menuTerbuka ? 'translateY(0)' : 'translateY(-10px)',
              pointerEvents: menuTerbuka ? 'auto' : 'none',
            }}>
              <Link to="/login" style={styles.tombolMenu}>Login</Link>
              <div style={styles.garisPembatas}></div>
              <Link to="/daftar" style={styles.tombolMenuUtama}>Daftar</Link>
            </div>
          </div>
        </div>

        <div style={styles.rightSectionMobile} className="blok-kanan-mobile">
          <button 
            style={styles.hamburgerBtn} 
            onClick={() => setHpMenuBuka(!hpMenuBuka)}
            aria-label="Toggle Menu"
            aria-expanded={hpMenuBuka}
          >
            <div style={{...styles.garisHam, transform: hpMenuBuka ? 'rotate(45deg) translate(5px, 6px)' : 'none'}} />
            <div style={{...styles.garisHam, opacity: hpMenuBuka ? 0 : 1}} />
            <div style={{...styles.garisHam, transform: hpMenuBuka ? 'rotate(-45deg) translate(5px, -6px)' : 'none'}} />
          </button>
        </div>

      </div>

      <div style={{
        ...styles.mobileNavOverlay,
        opacity: hpMenuBuka ? 1 : 0,
        transform: hpMenuBuka ? 'translateY(0)' : 'translateY(-20px)',
        pointerEvents: hpMenuBuka ? 'auto' : 'none',
      }}>
        <nav style={styles.mobileNavList} aria-label="Mobile Navigation">
          {navigation.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                style={{
                  ...styles.mobileNavItem,
                  color: isActive ? 'var(--primary-purple)' : 'var(--text-dark)',
                  fontWeight: isActive ? 700 : 500,
                }}
              >
                {item.name}
              </Link>
            );
          })}
          <div style={styles.garisPembatasMobile}></div>
          <div style={styles.mobileAuthBlok}>
            <Link to="/login" style={styles.mobileTombolLogin}>Login</Link>
            <Link to="/daftar" style={styles.mobileTombolDaftar}>Daftar</Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

const styles = {
  wrapper: {
    width: '100%',
    position: 'fixed',
    top: '24px',
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0 24px',
    zIndex: 1000,
    transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
  } as React.CSSProperties,

  wrapperLiquid: {
    top: 0,
    padding: '12px 24px',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    boxShadow: '0 4px 30px rgba(244, 166, 35, 0.04)',
    borderBottom: '1px solid rgba(244, 166, 35, 0.06)',
  } as React.CSSProperties,

  container: {
    width: '100%',
    maxWidth: '1200px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 1005,
  } as React.CSSProperties,

  leftSection: {
    display: 'flex',
    alignItems: 'center',
  } as React.CSSProperties,

  centerSection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  } as React.CSSProperties,

  rightSectionDesktop: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  } as React.CSSProperties,

  profileWrapper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingBottom: '20px',
    marginTop: '20px',
  } as React.CSSProperties,

  rightSectionMobile: {
    display: 'none',
  } as React.CSSProperties,

  brand: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    position: 'relative',
  } as React.CSSProperties,

  logoWrapper: {
    width: '60px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
  } as React.CSSProperties,

  logoImg: {
    width: '180px',
    height: '180px',
    objectFit: 'contain',
    position: 'absolute',
    left: '-60px',
    transform: 'translateY(-12px)',
  } as React.CSSProperties,

  brandName: {
    color: 'var(--text-dark)',
    fontWeight: 800,
    fontSize: '24px',
    letterSpacing: '-0.5px',
    lineHeight: 1,
    marginLeft: '4px',
  } as React.CSSProperties,

  navCapsule: {
    backgroundColor: 'var(--navbar-capsule-bg)',
    padding: '4px 8px',
    borderRadius: '100px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.03)',
    border: '1px solid rgba(0, 0, 0, 0.01)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '48px',
    width: '530px',
    transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
  } as React.CSSProperties,

  navCapsuleLiquid: {
    backgroundColor: 'rgba(244, 166, 35, 0.04)',
    border: '1px solid rgba(244, 166, 35, 0.08)',
    boxShadow: 'none',
  } as React.CSSProperties,

  menuList: {
    display: 'flex',
    listStyle: 'none',
    gap: '4px',
    margin: 0,
    padding: 0,
    width: '100%',
    justifyContent: 'space-between',
  } as React.CSSProperties,

  item: {
    display: 'block',
    padding: '10px 22px',
    fontWeight: 600,
    fontSize: '14px',
    color: 'var(--primary-purple)',
    textDecoration: 'none',
    borderRadius: '100px',
    transition: 'all 0.2s ease',
    textAlign: 'center',
  } as React.CSSProperties,

  active: {
    backgroundColor: '#F4A623',
    color: '#ffffff',
    boxShadow: '0 4px 12px rgba(244, 166, 35, 0.1)',
  } as React.CSSProperties,

  profileBtn: {
    backgroundColor: 'var(--primary-purple)',
    border: 'none',
    borderRadius: '50%',
    width: '44px',
    height: '44px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(244, 166, 35, 0.25)',
    padding: 0,
    overflow: 'hidden',
  } as React.CSSProperties,

  avatarDesign: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingTop: '6px',
  } as React.CSSProperties,

  avatarHead: {
    width: '12px',
    height: '12px',
    backgroundColor: 'var(--white)',
    borderRadius: '50%',
    marginBottom: '3px',
  } as React.CSSProperties,

  avatarBody: {
    width: '24px',
    height: '14px',
    backgroundColor: 'var(--white)',
    borderRadius: '100px 100px 0 0',
  } as React.CSSProperties,

  kotakMelayang: {
    position: 'absolute',
    top: '54px',
    right: '0px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '12px',
    width: '160px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(244, 166, 35, 0.12)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    zIndex: 1001,
    transition: 'opacity 0.25s ease, transform 0.25s ease',
  } as React.CSSProperties,

  tombolMenu: {
    display: 'block',
    textAlign: 'center',
    padding: '8px 0',
    color: 'var(--text-dark)',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 600,
    borderRadius: '8px',
  } as React.CSSProperties,

  tombolMenuUtama: {
    display: 'block',
    textAlign: 'center',
    padding: '8px 0',
    backgroundColor: 'var(--primary-purple)',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 700,
    borderRadius: '8px',
  } as React.CSSProperties,

  garisPembatas: {
    height: '1px',
    backgroundColor: '#f0f0f0',
    margin: '4px 0',
  } as React.CSSProperties,

  hamburgerBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    padding: '8px',
    zIndex: 1006,
  } as React.CSSProperties,

  garisHam: {
    width: '24px',
    height: '2px',
    backgroundColor: 'var(--text-dark)',
    transition: 'all 0.3s ease',
  } as React.CSSProperties,

  mobileNavOverlay: {
    position: 'absolute',
    top: '74px',
    left: '24px',
    right: '24px',
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '24px',
    boxShadow: '0 15px 35px rgba(244, 166, 35, 0.1)',
    border: '1px solid rgba(244, 166, 35, 0.08)',
    zIndex: 999,
    transition: 'opacity 0.3s ease, transform 0.3s ease',
  } as React.CSSProperties,

  mobileNavList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  } as React.CSSProperties,

  mobileNavItem: {
    fontSize: '16px',
    textDecoration: 'none',
    padding: '8px 4px',
  } as React.CSSProperties,

  garisPembatasMobile: {
    height: '1px',
    backgroundColor: '#f0f0f0',
    margin: '8px 0',
  } as React.CSSProperties,

  mobileAuthBlok: {
    display: 'flex',
    gap: '12px',
  } as React.CSSProperties,

  mobileTombolLogin: {
    flex: 1,
    textAlign: 'center',
    padding: '12px 0',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-dark)',
    textDecoration: 'none',
    backgroundColor: '#f0f2f5',
  } as React.CSSProperties,

  mobileTombolDaftar: {
    flex: 1,
    textAlign: 'center',
    padding: '12px 0',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 700,
    color: '#ffffff',
    textDecoration: 'none',
    backgroundColor: 'var(--primary-purple)',
  } as React.CSSProperties,
};

export default Navbar;