import { styles } from './dashboardStyles';

interface MateriItem {
  id: number;
  title: string;
  desc: string;
  progress: number;
}

export default function Materi() {
  const materiList: MateriItem[] = [
    { id: 1, title: 'Matematika Dasar', desc: 'Pemahaman konsep aljabar dan aritmatika', progress: 75 },
    { id: 2, title: 'Fisika Mekanika', desc: 'Hukum Newton dan aplikasinya', progress: 40 },
    { id: 3, title: 'Biologi Sel', desc: 'Struktur dan fungsi sel makhluk hidup', progress: 0 },
    { id: 4, title: 'Kimia Dasar', desc: 'Sistem periodik dan ikatan kimia', progress: 100 },
  ];

  return (
    <>
      <header style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#2d3748', margin: '0 0 8px 0' }}>Materi Belajar</h2>
        <p style={{ color: '#718096' }}>Pilih materi untuk melanjutkan petualangan belajarmu hari ini.</p>
      </header>

      <section style={styles.cardsGrid} className="dashboard-cards-grid">
        {materiList.map((materi) => (
          <article key={materi.id} style={styles.kartuUtama} className="kartu">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ padding: '12px', backgroundColor: '#eff6ff', borderRadius: '12px', color: '#3b82f6' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
              </div>
              {materi.progress === 100 && (
                <span style={{ fontSize: '12px', fontWeight: 800, backgroundColor: '#ecfdf5', color: '#10b981', padding: '4px 10px', borderRadius: '8px' }}>SELESAI</span>
              )}
            </div>
            
            <h3 style={{ ...styles.kartuJudul, marginBottom: '8px' }}>{materi.title}</h3>
            <p style={{ fontSize: '13px', color: '#718096', marginBottom: '20px', flexGrow: 1 }}>{materi.desc}</p>
            
            <div>
              <div style={styles.questHeader}>
                <span style={styles.questProgressTeks}>Progres</span>
                <span style={styles.questPersen}>{materi.progress}%</span>
              </div>
              <div style={styles.progressBarBg}>
                <div style={{ 
                  ...styles.progressBarFill, 
                  width: `${materi.progress}%`, 
                  backgroundColor: materi.progress === 100 ? '#10b981' : '#F4A623' 
                }}></div>
              </div>
            </div>

            <button style={{ 
              ...styles.btnBannerCta, 
              backgroundColor: '#eff6ff', 
              color: '#3b82f6', 
              width: '100%', 
              marginTop: '16px', 
              boxShadow: 'none' 
            }}>
              {materi.progress === 0 ? 'Mulai Belajar' : materi.progress === 100 ? 'Ulas Ulang' : 'Lanjutkan'}
            </button>
          </article>
        ))}
      </section>
    </>
  );
}
