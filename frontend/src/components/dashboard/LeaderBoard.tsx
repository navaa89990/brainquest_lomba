import React, { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { apiService } from '../../lib/apiService';
import { styles } from './dashboardStyles';

interface LeaderboardUser {
  id: number;
  rank: number;
  username: string;
  fullName?: string;
  points: number;
  level: number;
  role?: string;
}

const Leaderboard: React.FC = () => {
  const [data, setData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await apiService.getLeaderboard(10, 0);
        setData(response.leaderboard || []);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div style={styles.contentBody}>
      <div style={styles.bannerInfo}>
        <div style={styles.bannerTeks}>
          <h2 style={styles.bannerJudul}>Leaderboard</h2>
          <p style={styles.bannerSubjudul}>
            Lihat siapa yang berada di puncak klasemen dan jadilah juara.
          </p>
        </div>
      </div>

      <div style={styles.kartuLebar}>
        {loading ? (
          <p style={styles.kosongText}>Memuat leaderboard...</p>
        ) : data.length > 0 ? (
          <div style={styles.riwayatWrapper}>
            {data.map((item) => (
              <div key={item.id} style={styles.riwayatItem}>
                <div style={styles.riwayatInfoKiri}>
                  <span style={styles.ikonBukuKecil}><Trophy size={18} color="#f59e0b" /></span>
                  <div>
                    <h4 style={styles.riwayatJudulTeks}>{item.fullName || item.username}</h4>
                    <p style={styles.riwayatKategori}>Peringkat {item.rank} • {item.role === 'admin' ? 'Admin' : 'User'}</p>
                  </div>
                </div>
                <div style={styles.riwayatInfoKanan}>
                  <span style={{ ...styles.skorBadge, backgroundColor: '#F4A623', color: '#fff' }}>
                    {item.points} XP • Lv.{item.level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={styles.kosongText}>Belum ada data leaderboard.</p>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
