import { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if already logged in
    const storedAdmin = localStorage.getItem('admin_data');
    if (storedAdmin) {
      setAdminData(JSON.parse(storedAdmin));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (admin) => {
    localStorage.setItem('admin_data', JSON.stringify(admin));
    setAdminData(admin);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_data');
    setAdminData(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#050505' }}>
        <div className="w-8 h-8 rounded-full border border-white/20 border-t-white/70 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#050505' }}>
      {isAuthenticated ? (
        <Dashboard adminData={adminData} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
