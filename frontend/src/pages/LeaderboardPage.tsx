// src/pages/Leaderboard.tsx
import React, { useEffect, useState } from "react";
import { apiService } from "../lib/apiService";

const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await apiService.getLeaderboard(10, 0);
        setUsers(response.leaderboard || []);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setUsers([]);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div style={style.container}>
      <h1 style={style.title}>Leaderboard</h1>
      <p style={style.subtitle}>
        Berikut adalah daftar user dengan skor tertinggi minggu ini.
      </p>

      <div className="responsive-content" style={style.content}>
        {/* Area Podium */}
        <div className="responsive-podium" style={style.podium}>
          {/* Juara 2, 1, 3 bisa kamu mapping dari state 'users' agar dinamis */}
          <div style={{ ...style.podiumBlock, ...style.second }}>
            <span style={style.rank}>2</span>
          </div>
          <div style={{ ...style.podiumBlock, ...style.first }}>
            <span style={style.rank}>1</span>
          </div>
          <div style={{ ...style.podiumBlock, ...style.third }}>
            <span style={style.rank}>3</span>
          </div>
        </div>

        {/* Area Top Players List */}
        <div className="responsive-box" style={style.box}>
          <h2 style={style.boxTitle}>Top Players</h2>
          <ul style={style.userList}>
            {users.map((user) => (
              <li key={user.id} style={style.listItem}>
                <span>{user.fullName || user.username}</span> <strong>{user.points} pts</strong>
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
          
          /* Responsivitas terikat dengan Class Name JSX */
          @media (max-width: 900px) {
            .responsive-content {
              flex-direction: column !important;
              align-items: center !important;
              gap: 5rem !important; /* Diperbesar sedikit agar jarak podium dan list lega */
            }
            .responsive-box {
              width: 100% !important;
              max-width: 400px !important;
            }
            .responsive-podium {
              width: 100% !important;
              margin-top: 3rem !important; /* PERBAIKAN: Menambah jarak di mobile agar icon tidak menabrak paragraf */
            }
          }
        `}
      </style>
    </div>
  );
};

const style = {
  container: {
    textAlign: "center" as const,
    padding: "8rem 2rem 4rem", 
    background: "var(--bg-gray, #f8f9fa)",
    minHeight: "100vh",
    boxSizing: "border-box" as const,
  },
  title: {
    color: "#2c3e50",
    fontSize: "2.5rem",
    fontWeight: "bold",
    marginBottom: "0.5rem",
  },
  subtitle: {
    color: "#7f8c8d",
    marginBottom: "5.5rem", 
  },
  content: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end", 
    gap: "4rem",
    maxWidth: "1100px",
    margin: "0 auto",
  },
  podium: {
    display: "flex",
    alignItems: "flex-end",
    gap: "1.2rem",
    justifyContent: "center",
  },
  podiumBlock: {
    position: "relative" as const,
    width: "120px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "flex-end",
    borderRadius: "12px",
    paddingBottom: "1rem",
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.08)",
  },
  profileIconContainer: {
    width: "60px",
    height: "60px",
    background: "#ffa726", 
    borderRadius: "50%",
    position: "absolute" as const,
    top: "-75px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
    animation: "float 3s ease-in-out infinite",
  },
  userAvatarHead: {
    width: "20px",
    height: "20px",
    background: "#fff",
    borderRadius: "50%",
    marginBottom: "3px",
    marginTop: "8px",
  },
  userAvatarBody: {
    width: "36px",
    height: "25px",
    background: "#fff",
    borderRadius: "50% 50% 0 0",
  },
  rank: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#fff", 
  },
  first: {
    height: "240px",
    background: "#ffa726", 
    boxShadow: "0 10px 25px rgba(255, 167, 38, 0.4)",
  },
  second: {
    height: "180px",
    background: "#d4af37", 
  },
  third: {
    height: "140px",
    background: "#b0bec5", 
  },
  box: {
    width: "350px",
    background: "#ffffff",
    padding: "2rem",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    textAlign: "left" as const,
  },
  boxTitle: {
    fontSize: "1.5rem",
    color: "#2c3e50",
    marginBottom: "1.5rem",
    textAlign: "center" as const,
  },
  userList: {
    listStyle: "none",
    padding: 0,
    margin: "0 0 2rem 0",
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    color: "#4f5d73",
    fontSize: "1.05rem",
    borderBottom: "1px solid #f1f3f5",
    paddingBottom: "0.5rem",
  },
  seeMore: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "0.5rem",
    color: "#ffa726",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "0.95rem",
  },
  arrow: {
    width: "8px",
    height: "8px",
    borderRight: "2px solid #ffa726",
    borderBottom: "2px solid #ffa726",
    transform: "rotate(45deg)",
    animation: "bounce 1.2s infinite",
    marginLevel: "2px",
  },
};

export default Leaderboard;