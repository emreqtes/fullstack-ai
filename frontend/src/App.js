import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://fullstack-ai-klct.onrender.com/api';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);

  // Check if user is already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
      loadUsers();
    }
  }, []);

  // Load users
  const loadUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      setUsers(response.data);
    } catch (err) {
      console.error("Kullanıcılar yüklenirken hata oluştu:", err);
    }
  };

  // Login function
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.username.trim() || !loginForm.password.trim()) {
      setError('Kullanıcı adı ve şifre gerekli');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: loginForm.username.trim(),
        password: loginForm.password.trim()
      });
      
      setCurrentUser(response.data);
      setIsLoggedIn(true);
      localStorage.setItem('currentUser', JSON.stringify(response.data));
      loadUsers();
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Kullanıcı adı veya şifre hatalı');
      } else {
        console.error("Giriş yapılırken hata oluştu:", err);
        setError('Giriş yapılırken hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('currentUser');
    setUsers([]);
  };

  // Login Page
  if (!isLoggedIn) {
    return (
      <div className="app">
        <div className="auth-container">
          <div className="auth-header">
            <h1>💬 AI Destekli Sohbet</h1>
            <p>Güvenli mesajlaşma ve duygu analizi</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label>Kullanıcı Adı</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                disabled={loading}
                placeholder="Kullanıcı adınızı girin"
              />
            </div>
            <div className="form-group">
              <label>Şifre</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                disabled={loading}
                placeholder="Şifrenizi girin"
              />
            </div>
            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <div className="demo-users">
            <h3>Demo Kullanıcıları</h3>
            <div className="demo-user-list">
              <div className="demo-user" onClick={() => setLoginForm({username: 'admin1', password: '1234'})}>
                <strong>admin1</strong> / 1234
              </div>
              <div className="demo-user" onClick={() => setLoginForm({username: 'alice05', password: '1234'})}>
                <strong>alice05</strong> / 1234
              </div>
              <div className="demo-user" onClick={() => setLoginForm({username: 'bob22', password: '1234'})}>
                <strong>bob22</strong> / 1234
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Chat Page
  return (
    <div className="app">
      <div className="chat-container">
        <div className="chat-header">
          <h1>💬 AI Destekli Sohbet</h1>
          <div className="user-info">
            <span className="current-user">👤 {currentUser.username}</span>
            <button onClick={handleLogout} className="logout-button">
              Çıkış
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="chat-main">
          <div className="chat-sidebar">
            <div className="users-section">
              <h3>🟢 Online Kullanıcılar ({users.length})</h3>
              <div className="users-list">
                {users.map(user => (
                  <div key={user.id} className={`user-item ${user.id === currentUser.id ? 'current' : ''}`}>
                    <span className="user-avatar">👤</span>
                    <span className="user-name">{user.username}</span>
                    {user.id === currentUser.id && <span className="you-badge">(Sen)</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="chat-content">
            <div className="welcome-message">
              <h2>👋 Hoş Geldin, {currentUser.username}!</h2>
              <p>Sol taraftan kullanıcıları görebilirsin.</p>
              <div className="features">
                <div className="feature">
                  <span className="feature-icon">🤖</span>
                  <span>AI Duygu Analizi</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">💬</span>
                  <span>Özel Mesajlaşma</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">📱</span>
                  <span>WhatsApp Tarzı Durum</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
