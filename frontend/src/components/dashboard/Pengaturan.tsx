import React from 'react';
import { styles } from './dashboardStyles';

const Pengaturan: React.FC = () => {
  return (
    <div style={styles.contentBody}>
      <div style={styles.bannerInfo}>
        <div style={styles.bannerTeks}>
          <h2 style={styles.bannerJudul}>Pengaturan</h2>
          <p style={styles.bannerSubjudul}>
            Sesuaikan preferensi akun dan tampilan dashboard sesuai kebutuhanmu.
          </p>
        </div>
      </div>

      <div style={styles.kartuLebar}>
        <div style={styles.riwayatWrapper}>
          <div style={styles.riwayatItem}>
            <div style={styles.riwayatInfoKiri}>
              <span style={styles.ikonBukuKecil}>👤</span>
              <div>
                <h4 style={styles.riwayatJudulTeks}>Profil</h4>
                <p style={styles.riwayatKategori}>Ubah nama, avatar, dan email</p>
              </div>
            </div>
            <button style={styles.btnBannerCta}>Edit</button>
          </div>

          <div style={styles.riwayatItem}>
            <div style={styles.riwayatInfoKiri}>
              <span style={styles.ikonBukuKecil}>🎨</span>
              <div>
                <h4 style={styles.riwayatJudulTeks}>Tema</h4>
                <p style={styles.riwayatKategori}>Atur warna dan tampilan</p>
              </div>
            </div>
            <button style={styles.btnBannerCta}>Ubah</button>
          </div>

          <div style={styles.riwayatItem}>
            <div style={styles.riwayatInfoKiri}>
              <span style={styles.ikonBukuKecil}>🔒</span>
              <div>
                <h4 style={styles.riwayatJudulTeks}>Keamanan</h4>
                <p style={styles.riwayatKategori}>Ganti password dan verifikasi</p>
              </div>
            </div>
            <button style={styles.btnBannerCta}>Kelola</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pengaturan;
