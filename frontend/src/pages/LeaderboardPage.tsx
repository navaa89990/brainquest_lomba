import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/useAuth';
import { useTheme, themeStyles } from '../lib/ThemeContext';
import { apiService } from '../lib/apiService';

const Leaderboard: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { theme, setTheme, colors } = useTheme();
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated && theme !== 'light') {
      setTheme('light');
    }
  }, [isAuthenticated, theme, setTheme]);

  const activeColors = isAuthenticated ? colors : themeStyles.light;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await apiService.getLeaderboard(10, 0);
        setUsers(response.leaderboard || []);
      } catch (err) {
        console.error(err);
        setUsers([]);
      }
    };

    fetchLeaderboard();
  }, []);

  const style = {
    container: {
      textAlign: 'center' as const,
      padding: '8rem 2rem 4rem', 
      backgroundColor: activeColors.background,
      minHeight: '100vh',
      boxSizing: 'border-box' as const,
      transition: 'background-color 0.2s',
    },
    title: {
      color: activeColors.text,
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
    },
    subtitle: {
      color: activeColors.subtext,
      marginBottom: '6rem', 
    },
    content: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end', 
      gap: '4rem',
      maxWidth: '1100px',
      margin: '0 auto',
    },
    podium: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: '1.2rem',
      justifyContent: 'center',
    },
    podiumBlock: {
      position: 'relative' as const,
      width: '120px',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'flex-end',
      borderRadius: '12px',
      paddingBottom: '1rem',
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.08)',
    },
    profileIconContainer: {
      width: '60px',
      height: '60px',
      background: '#F4A623', 
      borderRadius: '50%',
      position: 'absolute' as const,
      top: '-75px',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
      animation: 'float 3s ease-in-out infinite',
    },
    userAvatarHead: {
      width: '20px',
      height: '20px',
      background: '#ffffff',
      borderRadius: '50%',
      marginBottom: '3px',
      marginTop: '8px',
    },
    userAvatarBody: {
      width: '36px',
      height: '25px',
      background: '#ffffff',
      borderRadius: '50% 50% 0 0',
    },
    rank: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#ffffff', 
    },
    first: {
      height: '240px',
      background: '#F4A623', 
      boxShadow: '0 10px 25px rgba(244, 166, 35, 0.4)',
    },
    second: {
      height: '180px',
      background: '#94a3b8', 
    },
    third: {
      height: '140px',
      background: '#b45309', 
    },
    box: {
      width: '350px',
      backgroundColor: activeColors.surface,
      padding: '2rem',
      borderRadius: '16px',
      border: `1px solid ${activeColors.border}`,
      boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
      textAlign: 'left' as const,
      transition: 'background-color 0.2s, border-color 0.2s',
    },
    boxTitle: {
      fontSize: '1.5rem',
      color: activeColors.text,
      marginBottom: '1.5rem',
      textAlign: 'center' as const,
    },
    userList: {
      listStyle: 'none',
      padding: 0,
      margin: '0 0 2rem 0',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem',
    },
    listItem: {
      display: 'flex',
      justifyContent: 'space-between',
      color: activeColors.text,
      fontSize: '1.05rem',
      borderBottom: `1px solid ${activeColors.border}`,
      paddingBottom: '0.5rem',
    },
    seeMore: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '0.5rem',
      color: '#F4A623',
      fontWeight: 'bold',
      cursor: 'pointer',
      fontSize: '0.95rem',
    },
    arrow: {
      width: '8px',
      height: '8px',
      borderRight: '2px solid #F4A623',
      borderBottom: '2px solid #F4A623',
      transform: 'rotate(45deg)',
      animation: 'bounce 1.2s infinite',
      marginLeft: '2px',
    },
    podiumName: {
      fontSize: '13px',
      fontWeight: 700,
      color: '#ffffff',
      marginTop: '8px',
      textAlign: 'center' as const,
      width: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const,
      padding: '0 8px',
      boxSizing: 'border-box' as const,
    },
  };

  const firstPlace = users[0];
  const secondPlace = users[1];
  const thirdPlace = users[2];

  return (
    <div style={style.container}>
      <h1 style={style.title}>Leaderboard</h1>
      <p style={style.subtitle}>
        Berikut adalah daftar user dengan skor tertinggi minggu ini.
      </p>

      <div className="responsive-content" style={style.content}>
        
        <div className="responsive-podium" style={style.podium}>
          <div style={{ ...style.podiumBlock, ...style.second }}>
            {secondPlace && (
              <div style={style.profileIconContainer}>
                <div style={style.userAvatarHead} />
                <div style={style.userAvatarBody} />
              </div>
            )}
            <span style={style.rank}>2</span>
            {secondPlace && (
              <span style={style.podiumName}>
                {secondPlace.fullName || secondPlace.username}
              </span>
            )}
          </div>

          <div style={{ ...style.podiumBlock, ...style.first }}>
            {firstPlace && (
              <div style={style.profileIconContainer}>
                <div style={style.userAvatarHead} />
                <div style={style.userAvatarBody} />
              </div>
            )}
            <span style={style.rank}>1</span>
            {firstPlace && (
              <span style={style.podiumName}>
                {firstPlace.fullName || firstPlace.username}
              </span>
            )}
          </div>

          <div style={{ ...style.podiumBlock, ...style.third }}>
            {thirdPlace && (
              <div style={style.profileIconContainer}>
                <div style={style.userAvatarHead} />
                <div style={style.userAvatarBody} />
              </div>
            )}
            <span style={style.rank}>3</span>
            {thirdPlace && (
              <span style={style.podiumName}>
                {thirdPlace.fullName || thirdPlace.username}
              </span>
            )}
          </div>
        </div>

        <div className="responsive-box" style={style.box}>
          <h2 style={style.boxTitle}>Top Players</h2>
          <ul style={style.userList}>
            {users.map((user, index) => (
              <li key={user.id} style={style.listItem}>
                <span>
                  <strong style={{ color: activeColors.subtext, marginRight: '10px' }}>#{index + 1}</strong>
                  {user.fullName || user.username}
                </span>
                <strong style={{ color: '#F4A623' }}>{user.points} XP</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          @keyframes bounce {
            0%, 100% { transform: rotate(45deg) translate(0, 0); }
            50% { transform: rotate(45deg) translate(4px, 4px); }
          }
          
          @media (max-width: 900px) {
            .responsive-content {
              flex-direction: column !important;
              align-items: center !important;
              gap: 5rem !important;
            }
            .responsive-box {
              width: 100% !important;
              max-width: 400px !important;
            }
            .responsive-podium {
              width: 100% !important;
              margin-top: 3rem !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Leaderboard;