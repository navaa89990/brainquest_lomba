import React, { useState } from 'react';
import { BookOpen, Swords, Trophy } from 'lucide-react';

function FiturUtama() {
  const [kartuAktif, setKartuAktif] = useState<number | null>(null);

  const listFitur = [
    {
      icon: BookOpen,
      judul: 'Peta Materi',
      deskripsi: 'Jelajahi petualangan belajar dengan visual peta pangkalan yang seru dan mudah dipahami.'
    },
    {
      icon: Swords,
      judul: 'Arena Kuis',
      deskripsi: 'Tantang dirimu dalam kuis interaktif berwaktu untuk menguji pemahaman materi secara instan.'
    },
    {
      icon: Trophy,
      judul: 'Leaderboard',
      deskripsi: 'Raih poin tertinggi dari setiap misi dan bersainglah untuk menjadi juara di sekolahmu.'
    }
  ];

  return (
    <section style={gaya.seksiFitur}>
      <div style={gaya.kontenFitur}>
        
        <div style={gaya.blokJudul}>
          <span style={gaya.labelKecil}>KENAPA BRAINQUEST?</span>
          <h2 style={gaya.judulUtama}>Fitur Seru Untuk Teman Belajarmu</h2>
          <p style={gaya.subJudul}>Kami mengubah metode belajar konvensional yang membosankan menjadi petualangan game yang bikin nagih.</p>
        </div>

        <div style={gaya.gridKartu}>
          {listFitur.map((fitur, indeks) => {
            const sedangHover = kartuAktif === indeks;
            const Icon = fitur.icon;

            return (
              <div 
                key={indeks} 
                style={{
                  ...gaya.kartu,
                  ...(sedangHover ? gaya.kartuHover : {})
                }}
                onMouseEnter={() => setKartuAktif(indeks)}
                onMouseLeave={() => setKartuAktif(null)}
              >
                <div style={{
                  ...gaya.wadahIkon,
                  ...(sedangHover ? gaya.wadahIkonHover : {})
                }}>
                  <Icon size={28} strokeWidth={2.2} color={sedangHover ? '#ffffff' : 'var(--primary-purple)'} />
                </div>
                <h3 style={gaya.judulKartu}>{fitur.judul}</h3>
                <p style={gaya.deskripsiKartu}>{fitur.deskripsi}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

const gaya = {
  seksiFitur: {
    width: '100%',
    padding: '100px 40px',
    backgroundColor: '#ffffff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  } as React.CSSProperties,

  kontenFitur: {
    width: '100%',
    maxWidth: '1200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '60px',
  } as React.CSSProperties,

  blokJudul: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    maxWidth: '600px',
  } as React.CSSProperties,

  labelKecil: {
    fontSize: '14px',
    fontWeight: 700,
    color: 'var(--primary-purple)',
    letterSpacing: '2px',
  } as React.CSSProperties,

  judulUtama: {
    fontSize: '38px',
    fontWeight: 800,
    color: 'var(--text-dark)',
    lineHeight: 1.2,
  } as React.CSSProperties,

  subJudul: {
    fontSize: '16px',
    color: '#666666',
    lineHeight: 1.5,
  } as React.CSSProperties,

  gridKartu: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
  } as React.CSSProperties,

  kartu: {
    backgroundColor: '#ffffff',
    border: '1px solid rgba(244, 166, 35, 0.12)',
    borderRadius: '24px',
    padding: '40px 30px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    boxShadow: '0 10px 30px rgba(244, 166, 35, 0.04)',
    transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.3s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.3s ease',
    cursor: 'pointer',
    transform: 'translateY(0)',
  } as React.CSSProperties,

  kartuHover: {
    transform: 'translateY(-12px)',
    boxShadow: '0 20px 40px rgba(244, 166, 35, 0.15)',
    borderColor: 'var(--primary-purple)',
  } as React.CSSProperties,

  wadahIkon: {
    width: '60px',
    height: '60px',
    borderRadius: '16px',
    backgroundColor: 'rgba(244, 166, 35, 0.08)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '24px',
    transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), background-color 0.3s ease',
  } as React.CSSProperties,

  wadahIkonHover: {
    transform: 'scale(1.1) rotate(5deg)',
    backgroundColor: 'var(--primary-purple)',
  } as React.CSSProperties,

  teksIkon: {
    fontSize: '28px',
  } as React.CSSProperties,

  judulKartu: {
    fontSize: '22px',
    fontWeight: 700,
    color: 'var(--text-dark)',
    marginBottom: '12px',
  } as React.CSSProperties,

  deskripsiKartu: {
    fontSize: '15px',
    color: '#555555',
    lineHeight: 1.6,
  } as React.CSSProperties,
};

export default FiturUtama;