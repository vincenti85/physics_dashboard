import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DataManagement from './pages/DataManagement';
import Documentation from './pages/Documentation';

const App: React.FC = () => {
  return (
    <Router>
      <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <nav style={{
          background: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '0 20px'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            gap: '20px'
          }}>
            <Link
              to="/"
              style={{
                padding: '20px',
                textDecoration: 'none',
                color: '#333',
                fontWeight: 'bold',
                borderBottom: '3px solid transparent',
                transition: 'border-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.borderBottomColor = '#1976d2'}
              onMouseOut={(e) => e.currentTarget.style.borderBottomColor = 'transparent'}
            >
              대시보드
            </Link>
            <Link
              to="/data-management"
              style={{
                padding: '20px',
                textDecoration: 'none',
                color: '#333',
                fontWeight: 'bold',
                borderBottom: '3px solid transparent',
                transition: 'border-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.borderBottomColor = '#1976d2'}
              onMouseOut={(e) => e.currentTarget.style.borderBottomColor = 'transparent'}
            >
              데이터 관리
            </Link>
            <Link
              to="/documentation"
              style={{
                padding: '20px',
                textDecoration: 'none',
                color: '#333',
                fontWeight: 'bold',
                borderBottom: '3px solid transparent',
                transition: 'border-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.borderBottomColor = '#1976d2'}
              onMouseOut={(e) => e.currentTarget.style.borderBottomColor = 'transparent'}
            >
              DB 설명서
            </Link>
          </div>
        </nav>

        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/data-management" element={<DataManagement />} />
            <Route path="/documentation" element={<Documentation />} />
          </Routes>
        </div>

        <footer style={{
          marginTop: '50px',
          padding: '20px',
          textAlign: 'center',
          color: '#666',
          background: 'white',
          borderTop: '1px solid #e0e0e0'
        }}>
          <p style={{ margin: 0 }}>
            Physics Dashboard © 2025 - Google Maps & Firebase Integration
          </p>
        </footer>
      </div>
    </Router>
  );
};

export default App;
