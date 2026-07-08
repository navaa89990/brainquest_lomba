import React, { useEffect, useState } from 'react';
import { Bell, Globe, Palette, ChevronDown } from 'lucide-react';
import { useAuth } from '../../lib/useAuth';
import { apiService } from '../../lib/apiService';
import { useTheme } from '../../lib/ThemeContext';
import { styles } from './dashboardStyles';

const Pengaturan: React.FC = () => {
  const { token } = useAuth();
  const { theme, setTheme, colors } = useTheme();
  
  const [settings, setSettings] = useState(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedNotifications = localStorage.getItem('notifications') !== 'false';
    const savedLanguage = localStorage.getItem('language') || 'id';
    return { theme: savedTheme, notifications: savedNotifications, language: savedLanguage };
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      if (!token) return;
      try {
        const response = await apiService.getUserSettings(token);
        if (response && response.settings) {
          const fetchedTheme = response.settings.theme;
          const fetchedNotifications = response.settings.notifications !== false;
          const fetchedLanguage = response.settings.language || 'id';
          const mergedTheme = fetchedTheme === 'light' || fetchedTheme === 'dark' ? fetchedTheme : theme;
          
          setSettings({
            theme: mergedTheme,
            notifications: fetchedNotifications,
            language: fetchedLanguage,
          });
          
          localStorage.setItem('theme', mergedTheme);
          localStorage.setItem('notifications', JSON.stringify(fetchedNotifications));
          localStorage.setItem('language', fetchedLanguage);

          if (fetchedTheme === 'light' || fetchedTheme === 'dark') {
            setTheme(fetchedTheme);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchSettings();
  }, [token, setTheme, theme]);

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
        setTheme(settings.theme as 'light' | 'dark');
        localStorage.setItem('theme', settings.theme);
        localStorage.setItem('notifications', JSON.stringify(settings.notifications));
        localStorage.setItem('language', settings.language);
      }
    } catch (err) {
      console.error(err);
      setMessage('Gagal memperbarui pengaturan');
    } finally {
      setSaving(false);
    }
  };

  const customStyles = {
    card: {
      ...styles.kartuLebar,
      backgroundColor: colors.surface,
      border: `1.5px solid ${colors.border}`,
      color: colors.text,
    },
    textTitle: {
      color: colors.text,
    },
    textSubtitle: {
      color: colors.subtext,
    },
    select: {
      width: '100%',
      padding: '10px 36px 10px 16px',
      borderRadius: '12px',
      border: `1.5px solid ${colors.border}`,
      backgroundColor: colors.background,
      color: colors.text,
      fontSize: '14px',
      fontWeight: 600,
      appearance: 'none' as const,
      WebkitAppearance: 'none' as const,
      cursor: 'pointer',
      outline: 'none',
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

      <div style={customStyles.card}>
        <div style={styles.riwayatWrapper}>
          <div style={styles.riwayatItem}>
            <div style={styles.riwayatInfoKiri}>
              <span style={styles.ikonBukuKecil}><Palette size={18} color={colors.primary} /></span>
              <div>
                <h4 style={{ ...styles.riwayatJudulTeks, ...customStyles.textTitle }}>Tema</h4>
                <p style={{ ...styles.riwayatKategori, ...customStyles.textSubtitle }}>Pilih tampilan dashboard yang paling nyaman</p>
              </div>
            </div>
            <div style={{ position: 'relative', width: '180px' }}>
              <select
                value={settings.theme}
                onChange={(e) => {
                  const newTheme = e.target.value as 'light' | 'dark';
                  setSettings((prev) => ({ ...prev, theme: newTheme }));
                }}
                style={customStyles.select}
              >
                <option value="light">Terang</option>
                <option value="dark">Gelap</option>
              </select>
              <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                <ChevronDown size={16} color={colors.subtext} />
              </div>
            </div>
          </div>

          <div style={styles.riwayatItem}>
            <div style={styles.riwayatInfoKiri}>
              <span style={styles.ikonBukuKecil}><Bell size={18} color={colors.secondary} /></span>
              <div>
                <h4 style={{ ...styles.riwayatJudulTeks, ...customStyles.textTitle }}>Notifikasi</h4>
                <p style={{ ...styles.riwayatKategori, ...customStyles.textSubtitle }}>Aktifkan reminder untuk aktivitas belajar</p>
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => setSettings((prev) => ({ ...prev, notifications: e.target.checked }))}
                style={{
                  position: 'absolute',
                  width: '1px',
                  height: '1px',
                  padding: '0',
                  margin: '-1px',
                  overflow: 'hidden',
                  clip: 'rect(0, 0, 0, 0)',
                  whiteSpace: 'nowrap',
                  border: '0',
                }}
              />
              <div
                style={{
                  position: 'relative',
                  width: '46px',
                  height: '24px',
                  backgroundColor: settings.notifications ? colors.primary : colors.border,
                  borderRadius: '9999px',
                  transition: 'background-color 0.2s',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '2px',
                    left: settings.notifications ? '24px' : '2px',
                    width: '20px',
                    height: '20px',
                    backgroundColor: '#ffffff',
                    borderRadius: '50%',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  }}
                />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: colors.subtext }}>
                {settings.notifications ? 'Aktif' : 'Nonaktif'}
              </span>
            </label>
          </div>

          <div style={styles.riwayatItem}>
            <div style={styles.riwayatInfoKiri}>
              <span style={styles.ikonBukuKecil}><Globe size={18} color={colors.accent} /></span>
              <div>
                <h4 style={{ ...styles.riwayatJudulTeks, ...customStyles.textTitle }}>Bahasa</h4>
                <p style={{ ...styles.riwayatKategori, ...customStyles.textSubtitle }}>Pilih bahasa antarmuka</p>
              </div>
            </div>
            <div style={{ position: 'relative', width: '180px' }}>
              <select
                value={settings.language}
                onChange={(e) => setSettings((prev) => ({ ...prev, language: e.target.value }))}
                style={customStyles.select}
              >
                <option value="id">Bahasa Indonesia</option>
                <option value="en" disabled>English (Belum Tersedia)</option>
              </select>
              <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                <ChevronDown size={16} color={colors.subtext} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
          <button onClick={handleSave} disabled={saving} style={styles.btnBannerCta}>
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
          {message ? <p style={{ color: colors.accent, fontWeight: 600 }}>{message}</p> : null}
        </div>
      </div>
    </div>
  );
};

export default Pengaturan;