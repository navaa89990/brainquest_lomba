import React, { useEffect, useState } from 'react';
import { Bell, Globe, Palette } from 'lucide-react';
import { useAuth } from '../../lib/useAuth';
import { apiService } from '../../lib/apiService';
import { styles } from './dashboardStyles';

const Pengaturan: React.FC = () => {
  const { token } = useAuth();
  const [settings, setSettings] = useState({ theme: 'light', notifications: true, language: 'id' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      if (!token) return;
      try {
        const response = await apiService.getUserSettings(token);
        if (response.settings) {
          setSettings({
            theme: response.settings.theme || 'light',
            notifications: Boolean(response.settings.notifications),
            language: response.settings.language || 'id',
          });
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };

    fetchSettings();
  }, [token]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setMessage('');

    try {
      const response = await apiService.updateUserSettings(token, settings);
      if (response.error) {
        setMessage(response.error);
      } else {
        setMessage('Pengaturan berhasil diperbarui');
      }
    } catch (err) {
      console.error('Error updating settings:', err);
      setMessage('Gagal memperbarui pengaturan');
    } finally {
      setSaving(false);
    }
  };

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
              <span style={styles.ikonBukuKecil}><Palette size={18} color="#7c3aed" /></span>
              <div>
                <h4 style={styles.riwayatJudulTeks}>Tema</h4>
                <p style={styles.riwayatKategori}>Pilih tampilan dashboard yang paling nyaman</p>
              </div>
            </div>
            <select
              value={settings.theme}
              onChange={(e) => setSettings((prev) => ({ ...prev, theme: e.target.value }))}
              style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #dbe4f0' }}
            >
              <option value="light">Terang</option>
              <option value="dark">Gelap</option>
            </select>
          </div>

          <div style={styles.riwayatItem}>
            <div style={styles.riwayatInfoKiri}>
              <span style={styles.ikonBukuKecil}><Bell size={18} color="#f59e0b" /></span>
              <div>
                <h4 style={styles.riwayatJudulTeks}>Notifikasi</h4>
                <p style={styles.riwayatKategori}>Aktifkan reminder untuk aktivitas belajar</p>
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => setSettings((prev) => ({ ...prev, notifications: e.target.checked }))}
              />
              Aktif
            </label>
          </div>

          <div style={styles.riwayatItem}>
            <div style={styles.riwayatInfoKiri}>
              <span style={styles.ikonBukuKecil}><Globe size={18} color="#0f766e" /></span>
              <div>
                <h4 style={styles.riwayatJudulTeks}>Bahasa</h4>
                <p style={styles.riwayatKategori}>Pilih bahasa antarmuka</p>
              </div>
            </div>
            <select
              value={settings.language}
              onChange={(e) => setSettings((prev) => ({ ...prev, language: e.target.value }))}
              style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #dbe4f0' }}
            >
              <option value="id">Bahasa Indonesia</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
          <button onClick={handleSave} disabled={saving} style={styles.btnBannerCta}>
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
          {message ? <p style={{ color: '#0f766e', fontWeight: 600 }}>{message}</p> : null}
        </div>
      </div>
    </div>
  );
};

export default Pengaturan;
