import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

function KuisPage() {
  const location = useLocation();
  const dataTeaser = location.state?.dariTeaser;
  const levelId = location.state?.levelId || 1;
  const namaMateri = location.state?.namaLevel || 'Sampel Pengenalan';

  const bankSoal: Record<number, { tanya: string; opsi: string[]; kunci: number; reward: string }> = {
    1: {
      tanya: 'Manakah di bawah ini yang merupakan fungsi utama dari struktur tag HTML dalam pembuatan halaman web?',
      opsi: [
        'A. Mengatur skema warna dan animasi objek utama',
        'B. Membuat kerangka struktur dasar halaman website',
        'C. Menyimpan database akun pengguna secara lokal',
        'D. Mengatur logika dan fungsi aritmatika backend'
      ],
      kunci: 1,
      reward: '+150 XP'
    },
    2: {
      tanya: 'Planet manakah yang dijuluki sebagai Planet Merah dalam sistem tata surya kita karena kandungan besi oksida di permukaannya?',
      opsi: [
        'A. Venus',
        'B. Mars',
        'C. Jupiter',
        'D. Saturnus'
      ],
      kunci: 1,
      reward: '+180 XP'
    },
    3: {
      tanya: 'Kalimat manakah di bawah ini yang dikategorikan sebagai kalimat efektif dan memenuhi kaidah PUEBI?',
      opsi: [
        'A. Bagi semua siswa-siswa diharapkan berkumpul di lapangan.',
        'B. Semua siswa diharapkan berkumpul di lapangan.',
        'C. Untuk para siswa-siswa sekalian harap berkumpul di lapangan.',
        'D. Siswa-siswa semua diharapkan berkumpul ke lapangan.'
      ],
      kunci: 1,
      reward: '+120 XP'
    },
    4: {
      tanya: 'Which of the following sentences best demonstrates the correct usage of the Simple Past Tense?',
      opsi: [
        'A. She is write a beautiful narrative essay yesterday morning.',
        'B. She wrote a beautiful narrative essay yesterday morning.',
        'C. She has writes a beautiful narrative essay yesterday morning.',
        'D. She will writing a beautiful narrative essay yesterday morning.'
      ],
      kunci: 1,
      reward: '+200 XP'
    }
  };

  const soalAktif = bankSoal[levelId] || bankSoal[1];
  
  const [opsiTerpilih, setOpsiTerpilih] = useState<number | null>(null);
  const [sudahJawab, setSudahJawab] = useState(false);
  const [skorDapat, setSkorDapat] = useState<number | null>(null);

  const cekJawaban = (indeksOpsi: number) => {
    if (sudahJawab) return;
    setOpsiTerpilih(indeksOpsi);
    setSudahJawab(true);
    
    if (indeksOpsi === soalAktif.kunci) {
      setSkorDapat(100);
    } else {
      setSkorDapat(0);
    }
  };

  return (
    <div style={gaya.container}>
      <div style={gaya.konten}>
        {dataTeaser ? (
          <div style={gaya.boxKuis}>
            <div style={gaya.headerKuis}>
              <span style={gaya.badgeLive}>⚡ MODE TEASER GRATIS</span>
              <h2 style={gaya.judulKuis}>{namaMateri}</h2>
              <div style={gaya.barWaktu}><div style={gaya.isiWaktu}></div></div>
            </div>

            <div style={gaya.areaPertanyaan}>
              <p style={gaya.teksPertanyaan}>{soalAktif.tanya}</p>
              <div style={gaya.opsiGrid}>
                {soalAktif.opsi.map((opsi, indeks) => {
                  let gayaKustom = {};
                  if (sudahJawab) {
                    if (indeks === soalAktif.kunci) {
                      gayaKustom = gaya.opsiBenar;
                    } else if (opsiTerpilih === indeks) {
                      gayaKustom = gaya.opsiSalah;
                    } else {
                      gayaKustom = gaya.opsiRedup;
                    }
                  }

                  return (
                    <button 
                      key={indeks}
                      style={{...gaya.tombolOpsi, ...gayaKustom}} 
                      onClick={() => cekJawaban(indeks)}
                      disabled={sudahJawab}
                    >
                      {opsi}
                    </button>
                  );
                })}
              </div>
            </div>

            {sudahJawab && (
              <div style={{
                ...gaya.kotakFeedback,
                backgroundColor: skorDapat === 100 ? '#f0fdf4' : '#fef2f2',
                borderColor: skorDapat === 100 ? '#bbf7d0' : '#fecaca',
                animation: 'elemenMuncul 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}>
                <div style={gaya.kontenFeedbackText}>
                  <span style={{fontSize: '24px'}}>{skorDapat === 100 ? '🎉' : '😢'}</span>
                  <div>
                    <h4 style={{margin: 0, color: skorDapat === 100 ? '#166534' : '#991b1b', fontWeight: 700}}>
                      {skorDapat === 100 ? 'Jawaban Kamu Benar!' : 'Yah, Jawaban Kurang Tepat!'}
                    </h4>
                    <p style={{margin: '4px 0 0 0', fontSize: '14px', color: '#555'}}>
                      {skorDapat === 100 ? `Selamat! Kamu mendapatkan potensi ${soalAktif.reward} & +10 Koin` : 'Jangan menyerah, coba pelajari materinya lagi!'}
                    </p>
                  </div>
                </div>
                
                <div style={gaya.wrapperCtaFeedback} className="blok-cta-feedback">
                  <p style={gaya.teksGembok}>🔒 Simpan skor & klaim hadiahmu sekarang!</p>
                  <div style={gaya.grupTombolFeedback}>
                    <Link to="/daftar" style={gaya.btnDaftarFeedback}>Daftar Akun</Link>
                    <Link to="/" style={gaya.btnKeluarFeedback}>Kembali</Link>
                  </div>
                </div>
              </div>
            )}

            <div style={gaya.footerKuis}>
              <p style={gaya.infoBatas}>Selesaikan kuis sampel ini untuk menguji pemahaman instan kamu.</p>
            </div>
          </div>
        ) : (
          <div style={gaya.dindingKunci}>
            <span style={{fontSize: '48px'}}>⚔️</span>
            <h2 style={gaya.judulKunci}>Arena Kuis Terkunci!</h2>
            <p style={gaya.deskripsiKunci}>
              Kamu harus masuk ke dalam akun atau melakukan registrasi siswa terlebih dahulu agar dapat menantang diri dalam kuis berwaktu serta mengklaim penambahan akumulasi XP harian.
            </p>
            <div style={gaya.blokTombol}>
              <Link to="/login" style={gaya.btnMasuk}>Masuk Akun</Link>
              <Link to="/daftar" style={gaya.btnDaftar}>Daftar Sekarang</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const gaya = {
  container: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#ffffff',
    padding: '140px 24px 80px 24px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  } as React.CSSProperties,

  konten: {
    width: '100%',
    maxWidth: '700px',
  } as React.CSSProperties,

  boxKuis: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    border: '1px solid rgba(244, 166, 35, 0.12)',
    padding: '40px',
    boxShadow: '0 12px 40px rgba(244, 166, 35, 0.05)',
  } as React.CSSProperties,

  headerKuis: {
    marginBottom: '32px',
  } as React.CSSProperties,

  badgeLive: {
    fontSize: '12px',
    fontWeight: 800,
    color: '#d97706',
    backgroundColor: '#fef3c7',
    padding: '6px 14px',
    borderRadius: '100px',
    display: 'inline-block',
    marginBottom: '12px',
  } as React.CSSProperties,

  judulKuis: {
    fontSize: '24px',
    fontWeight: 800,
    color: 'var(--text-dark)',
    margin: 0,
    marginBottom: '20px',
  } as React.CSSProperties,

  barWaktu: {
    width: '100%',
    height: '6px',
    backgroundColor: '#f0f2f5',
    borderRadius: '100px',
    overflow: 'hidden',
  } as React.CSSProperties,

  isiWaktu: {
    width: '100%',
    height: '100%',
    backgroundColor: 'var(--primary-purple)',
    borderRadius: '100px',
    animation: 'jalanWaktu 15s linear forwards',
    transformOrigin: 'left',
  } as React.CSSProperties,

  areaPertanyaan: {
    marginBottom: '32px',
  } as React.CSSProperties,

  teksPertanyaan: {
    fontSize: '18px',
    fontWeight: 600,
    color: 'var(--text-dark)',
    lineHeight: 1.5,
    marginBottom: '24px',
  } as React.CSSProperties,

  opsiGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  } as React.CSSProperties,

  tombolOpsi: {
    width: '100%',
    textAlign: 'left',
    padding: '18px 24px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    fontSize: '15px',
    fontWeight: 500,
    color: 'var(--text-dark)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  opsiBenar: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
    color: '#065f46',
    fontWeight: 700,
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
  } as React.CSSProperties,

  opsiSalah: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
    color: '#991b1b',
    fontWeight: 700,
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)',
  } as React.CSSProperties,

  opsiRedup: {
    opacity: 0.6,
    backgroundColor: '#f8fafc',
  } as React.CSSProperties,

  kotakFeedback: {
    padding: '24px',
    borderRadius: '20px',
    border: '1px solid',
    marginBottom: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  } as React.CSSProperties,

  kontenFeedbackText: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
  } as React.CSSProperties,

  wrapperCtaFeedback: {
    borderTop: '1px solid rgba(0, 0, 0, 0.06)',
    paddingTop: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as React.CSSProperties,

  teksGembok: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#475569',
    margin: 0,
  } as React.CSSProperties,

  grupTombolFeedback: {
    display: 'flex',
    gap: '12px',
  } as React.CSSProperties,

  btnDaftarFeedback: {
    padding: '10px 20px',
    backgroundColor: 'var(--primary-purple)',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 700,
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(244, 166, 35, 0.2)',
  } as React.CSSProperties,

  btnKeluarFeedback: {
    padding: '10px 16px',
    backgroundColor: '#ffffff',
    color: 'var(--text-dark)',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 600,
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
  } as React.CSSProperties,

  footerKuis: {
    borderTop: '1px solid #f0f2f5',
    paddingTop: '20px',
    textAlign: 'center',
  } as React.CSSProperties,

  infoBatas: {
    fontSize: '13px',
    color: '#718096',
    margin: 0,
  } as React.CSSProperties,

  dindingKunci: {
    textAlign: 'center',
    backgroundColor: '#fffcf5',
    border: '1px solid rgba(244, 166, 35, 0.08)',
    padding: '60px 40px',
    borderRadius: '28px',
  } as React.CSSProperties,

  judulKunci: {
    fontSize: '28px',
    fontWeight: 800,
    color: 'var(--text-dark)',
    marginTop: '16px',
    marginBottom: '12px',
  } as React.CSSProperties,

  deskripsiKunci: {
    fontSize: '15px',
    color: '#666666',
    lineHeight: 1.6,
    maxWidth: '480px',
    margin: '0 auto 32px auto',
  } as React.CSSProperties,

  blokTombol: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
  } as React.CSSProperties,

  btnMasuk: {
    padding: '14px 28px',
    backgroundColor: '#f0f2f5',
    color: 'var(--text-dark)',
    textDecoration: 'none',
    borderRadius: '12px',
    fontWeight: 700,
    fontSize: '15px',
  } as React.CSSProperties,

  btnDaftar: {
    padding: '14px 28px',
    backgroundColor: 'var(--primary-purple)',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '12px',
    fontWeight: 700,
    fontSize: '15px',
    boxShadow: '0 6px 16px rgba(244, 166, 35, 0.2)',
  } as React.CSSProperties,
};

export default KuisPage;