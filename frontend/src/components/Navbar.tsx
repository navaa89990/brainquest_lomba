import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MdPerson, MdShield } from 'react-icons/md';
import { useAuth } from '../lib/useAuth';
import { useTheme } from '../lib/ThemeContext';
import logo from '../assets/warnalogo.png';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, colors } = useTheme();
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

  const isAdmin = isAuthenticated && user?.role === 'admin';
  const dashboardPath = isAdmin ? '/admin' : '/dashboard';

  const navigation = [
    { name: 'Beranda', path: '/' },
    { name: 'Materi', path: '/materi' },
    { name: 'Arena Kuis', path: '/kuis' },
    { name: 'Leaderboard', path: '/leaderboard' },
  ];

  if (isAuthenticated) {
    navigation.push({ name: 'Dashboard', path: dashboardPath });
  }

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const gaya = {
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
      backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      boxShadow: '0 4px 30px rgba(244, 166, 35, 0.04)',
      borderBottom: `1px solid ${colors.border}`,
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
      flexShrink: 0,
    } as React.CSSProperties,

    centerSection: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
      margin: '0 16px',
    } as React.CSSProperties,

    rightSectionDesktop: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      position: 'relative',
      flexShrink: 0,
    } as React.CSSProperties,

    rightSectionMobile: {
      display: 'none',
    } as React.CSSProperties,

    profileWrapper: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingBottom: '20px',
      marginTop: '20px',
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
      color: colors.text,
      fontWeight: 800,
      fontSize: '24px',
      letterSpacing: '-0.5px',
      lineHeight: 1,
      marginLeft: '4px',
    } as React.CSSProperties,

    navCapsule: {
      backgroundColor: colors.surface,
      padding: '4px 8px',
      borderRadius: '100px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.03)',
      border: `1px solid ${colors.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '48px',
      width: 'auto',
      minWidth: '400px',
      maxWidth: '600px',
      transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
    } as React.CSSProperties,

    navCapsuleLiquid: {
      backgroundColor: theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(244, 166, 35, 0.04)',
      border: `1px solid ${colors.border}`,
      boxShadow: 'none',
    } as React.CSSProperties,

    menuList: {
      display: 'flex',
      listStyle: 'none',
      gap: '20px',
      margin: 0,
      padding: 0,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    } as React.CSSProperties,

    menuItem: {
      display: 'flex',
      alignItems: 'center',
    } as React.CSSProperties,

    item: {
      display: 'block',
      padding: '8px 16px',
      fontWeight: 600,
      fontSize: '14px',
      color: theme === 'dark' ? colors.text : '#F4A623',
      textDecoration: 'none',
      borderRadius: '100px',
      transition: 'all 0.2s ease',
      textAlign: 'center',
      whiteSpace: 'nowrap',
    } as React.CSSProperties,

    active: {
      backgroundColor: '#F4A623',
      color: '#ffffff',
      boxShadow: '0 4px 12px rgba(244, 166, 35, 0.1)',
    } as React.CSSProperties,

    profileBtn: {
      backgroundColor: '#F4A623',
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
      color: '#ffffff',
      fontSize: '16px',
      fontWeight: 700,
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
      backgroundColor: '#ffffff',
      borderRadius: '50%',
      marginBottom: '3px',
    } as React.CSSProperties,

    avatarBody: {
      width: '24px',
      height: '14px',
      backgroundColor: '#ffffff',
      borderRadius: '100px 100px 0 0',
    } as React.CSSProperties,

    avatarInitials: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F4A623',
      color: '#ffffff',
      fontSize: '16px',
      fontWeight: 700,
    } as React.CSSProperties,

    kotakMelayang: {
      position: 'absolute',
      top: '54px',
      right: '0px',
      backgroundColor: colors.surface,
      borderRadius: '16px',
      padding: '12px',
      width: '160px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${colors.border}`,
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      zIndex: 1001,
      transition: 'opacity 0.25s ease, transform 0.25s ease',
    } as React.CSSProperties,

    userInfo: {
      padding: '4px 0',
    } as React.CSSProperties,

    userName: {
      display: 'block',
      fontSize: '14px',
      fontWeight: 700,
      color: colors.text,
      textAlign: 'center',
    } as React.CSSProperties,

    userRole: {
      display: 'block',
      fontSize: '12px',
      color: colors.subtext,
      textAlign: 'center',
    } as React.CSSProperties,

    tombolMenu: {
      display: 'block',
      textAlign: 'center',
      padding: '8px 0',
      color: colors.text,
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: 600,
      borderRadius: '8px',
      transition: 'background 0.2s ease',
    } as React.CSSProperties,

    tombolMenuUtama: {
      display: 'block',
      textAlign: 'center',
      padding: '8px 0',
      backgroundColor: '#F4A623',
      color: '#ffffff',
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: 700,
      borderRadius: '8px',
      transition: 'opacity 0.2s ease',
    } as React.CSSProperties,

    tombolLogout: {
      display: 'block',
      textAlign: 'center',
      padding: '8px 0',
      backgroundColor: theme === 'dark' ? '#7f1d1d' : '#fef2f2',
      color: theme === 'dark' ? '#fca5a5' : '#dc2626',
      border: 'none',
      fontSize: '14px',
      fontWeight: 600,
      borderRadius: '8px',
      cursor: 'pointer',
      width: '100%',
      transition: 'background 0.2s ease',
    } as React.CSSProperties,

    garisPembatas: {
      height: '1px',
      backgroundColor: colors.border,
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
      backgroundColor: colors.text,
      transition: 'all 0.3s ease',
    } as React.CSSProperties,

    mobileNavOverlay: {
      position: 'absolute',
      top: '74px',
      left: '24px',
      right: '24px',
      backgroundColor: colors.surface,
      borderRadius: '24px',
      padding: '24px',
      boxShadow: '0 15px 35px rgba(244, 166, 35, 0.1)',
      border: `1px solid ${colors.border}`,
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
      backgroundColor: colors.border,
      margin: '8px 0',
    } as React.CSSProperties,

    mobileAuthBlok: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    } as React.CSSProperties,

    mobileUserName: {
      padding: '8px 4px',
      fontSize: '14px',
      fontWeight: 600,
      color: colors.text,
      textAlign: 'center',
    } as React.CSSProperties,

    mobileTombolLogin: {
      flex: 1,
      textAlign: 'center',
      padding: '12px 0',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: 600,
      color: colors.text,
      textDecoration: 'none',
      backgroundColor: colors.background,
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
      backgroundColor: '#F4A623',
    } as React.CSSProperties,

    mobileTombolLogout: {
      textAlign: 'center',
      padding: '12px 0',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: 600,
      color: theme === 'dark' ? '#fca5a5' : '#dc2626',
      textDecoration: 'none',
      backgroundColor: theme === 'dark' ? '#7f1d1d' : '#fef2f2',
      border: 'none',
      cursor: 'pointer',
    } as React.CSSProperties,
  };

  return (
    <header style={{
      ...gaya.wrapper,
      ...(terscroll ? gaya.wrapperLiquid : {})
    }}>
      <div style={gaya.container}>
        
        <div style={gaya.leftSection}>
          <Link to="/" style={gaya.brand} title="BrainQuest Home">
            <div style={gaya.logoWrapper}>
              <img src={logo} alt="BrainQuest Logo" style={gaya.logoImg} width="200" height="200" />
            </div>
            <span style={gaya.brandName}>BrainQuest</span>
          </Link>
        </div>

        <div style={gaya.centerSection} className="blok-center-desktop">
          <nav style={{
            ...gaya.navCapsule,
            ...(terscroll ? gaya.navCapsuleLiquid : {})
          }} aria-label="Main Navigation">
            <ul style={gaya.menuList}>
              {navigation.map((item) => {
                const isActive = location.pathname === item.path || 
                  (item.path === '/admin' && location.pathname.startsWith('/admin'));
                return (
                  <li key={item.name} style={gaya.menuItem}>
                    <Link
                      to={item.path}
                      style={{
                        ...gaya.item,
                        ...(isActive ? gaya.active : {}),
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

        <div style={gaya.rightSectionDesktop} className="blok-kanan-desktop">
          <div 
            style={gaya.profileWrapper}
            onMouseEnter={() => setMenuTerbuka(true)}
            onMouseLeave={() => setMenuTerbuka(false)}
          >
            <button style={gaya.profileBtn} aria-label="User Profile" aria-haspopup="true" aria-expanded={menuTerbuka}>
              {isAuthenticated && user ? (
                <div style={gaya.avatarInitials}>
                  {getInitials(user.fullName || user.username)}
                </div>
              ) : (
                <div style={gaya.avatarDesign}>
                  <div style={gaya.avatarHead}></div>
                  <div style={gaya.avatarBody}></div>
                </div>
              )}
            </button>

            <div style={{
              ...gaya.kotakMelayang,
              opacity: menuTerbuka ? 1 : 0,
              transform: menuTerbuka ? 'translateY(0)' : 'translateY(-10px)',
              pointerEvents: menuTerbuka ? 'auto' : 'none',
            }}>
              {isAuthenticated ? (
                <>
                  <div style={gaya.userInfo}>
                    <span style={gaya.userName}>{user?.fullName || user?.username}</span>
                    <span style={gaya.userRole}>
                      {user?.role === 'admin' ? (
                        <><MdShield size={14} style={{ marginRight: '6px' }} /> Admin</>
                      ) : (
                        <><MdPerson size={14} style={{ marginRight: '6px' }} /> User</>
                      )}
                    </span>
                  </div>
                  <div style={gaya.garisPembatas}></div>
                  <Link to="/profile" style={gaya.tombolMenu}>Profil</Link>
                  <Link to={dashboardPath} style={gaya.tombolMenu}>Dashboard</Link>
                  <button 
                    onClick={handleLogout}
                    style={gaya.tombolLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" style={gaya.tombolMenu}>Login</Link>
                  <div style={gaya.garisPembatas}></div>
                  <Link to="/daftar" style={gaya.tombolMenuUtama}>Daftar</Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div style={gaya.rightSectionMobile} className="blok-kanan-mobile">
          <button 
            style={gaya.hamburgerBtn} 
            onClick={() => setHpMenuBuka(!hpMenuBuka)}
            aria-label="Toggle Menu"
            aria-expanded={hpMenuBuka}
          >
            <div style={{...gaya.garisHam, transform: hpMenuBuka ? 'rotate(45deg) translate(5px, 6px)' : 'none'}} />
            <div style={{...gaya.garisHam, opacity: hpMenuBuka ? 0 : 1}} />
            <div style={{...gaya.garisHam, transform: hpMenuBuka ? 'rotate(-45deg) translate(5px, -6px)' : 'none'}} />
          </button>
        </div>

      </div>

      <div style={{
        ...gaya.mobileNavOverlay,
        opacity: hpMenuBuka ? 1 : 0,
        transform: hpMenuBuka ? 'translateY(0)' : 'translateY(-20px)',
        pointerEvents: hpMenuBuka ? 'auto' : 'none',
      }}>
        <nav style={gaya.mobileNavList} aria-label="Mobile Navigation">
          {navigation.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path === '/admin' && location.pathname.startsWith('/admin'));
            return (
              <Link
                key={item.name}
                to={item.path}
                style={{
                  ...gaya.mobileNavItem,
                  color: isActive ? '#F4A623' : colors.text,
                  fontWeight: isActive ? 700 : 500,
                }}
              >
                {item.name}
              </Link>
            );
          })}
          <div style={gaya.garisPembatasMobile}></div>
          <div style={gaya.mobileAuthBlok}>
            {isAuthenticated ? (
              <>
                <span style={gaya.mobileUserName}>
                  <MdPerson size={16} style={{ marginRight: '6px' }} /> {user?.fullName || user?.username}
                </span>
                <Link to="/profile" style={gaya.mobileTombolLogin}>Profil</Link>
                <Link to={dashboardPath} style={gaya.mobileTombolDaftar}>Dashboard</Link>
                <button 
                  onClick={handleLogout}
                  style={gaya.mobileTombolLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={gaya.mobileTombolLogin}>Login</Link>
                <Link to="/daftar" style={gaya.mobileTombolDaftar}>Daftar</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;