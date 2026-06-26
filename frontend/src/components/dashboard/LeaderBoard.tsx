import React from 'react';
import { styles } from './dashboardStyles';

const Leaderboard: React.FC = () => {
  const data = [
    { nama: 'Andi', skor: 980, posisi: 1 },
    { nama: 'Budi', skor: 860, posisi: 2 },
    { nama: 'Citra', skor: 750, posisi: 3 },
  ];

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
        <div style={styles.riwayatWrapper}>
          {data.map((item) => (
            <div key={item.posisi} style={styles.riwayatItem}>
              <div style={styles.riwayatInfoKiri}>
                <span style={styles.ikonBukuKecil}>🏆</span>
                <div>
                  <h4 style={styles.riwayatJudulTeks}>{item.nama}</h4>
                  <p style={styles.riwayatKategori}>Posisi {item.posisi}</p>
                </div>
              </div>
              <div style={styles.riwayatInfoKanan}>
                <span style={{ ...styles.skorBadge, backgroundColor: '#F4A623', color: '#fff' }}>
                  {item.skor} XP
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
