import React from 'react';

function StatistikKomunitas() {
  const dataStats = [
    { angka: '15,420+', label: 'Siswa Aktif Belajar' },
    { angka: '450K+', label: 'Total XP Dikumpulkan' },
    { angka: '89,200+', label: 'Kuis Telah Diselesaikan' }
  ];

  return (
    <section style={gaya.seksiStats}>
      <div style={gaya.kontenStats}>
        
        <div style={gaya.gridStats}>
          {dataStats.map((item, indeks) => (
            <div key={indeks} style={gaya.kotakStat}>
              <h3 style={gaya.angkaStat}>{item.angka}</h3>
              <p style={gaya.labelStat}>{item.label}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

const gaya = {
  seksiStats: {
    width: '100%',
    padding: '80px 40px',
    backgroundColor: 'var(--primary-purple)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  } as React.CSSProperties,

  kontenStats: {
    width: '100%',
    maxWidth: '1200px',
  } as React.CSSProperties,

  gridStats: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '40px',
    textAlign: 'center',
  } as React.CSSProperties,

  kotakStat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  } as React.CSSProperties,

  angkaStat: {
    fontSize: '48px',
    fontWeight: 900,
    color: '#ffffff',
    margin: 0,
    letterSpacing: '-1px',
  } as React.CSSProperties,

  labelStat: {
    fontSize: '16px',
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.8)',
    margin: 0,
  } as React.CSSProperties,
};

export default StatistikKomunitas;