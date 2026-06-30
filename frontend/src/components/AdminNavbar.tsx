import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';

function AdminNavbar() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <nav style={styles.nav} aria-label="Admin Navigation">
      <Link to="/admin" style={location.pathname === '/admin' ? styles.activeLink : styles.link}>
        Admin Panel
      </Link>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '16px 24px',
    backgroundColor: '#111827',
    color: '#fff',
  } as React.CSSProperties,
  link: {
    color: '#f9fafb',
    textDecoration: 'none',
    padding: '10px 16px',
    borderRadius: '12px',
    backgroundColor: '#1f2937',
    fontWeight: 600,
  } as React.CSSProperties,
  activeLink: {
    color: '#111827',
    textDecoration: 'none',
    padding: '10px 16px',
    borderRadius: '12px',
    backgroundColor: '#fbbf24',
    fontWeight: 700,
  } as React.CSSProperties,
};

export default AdminNavbar;
