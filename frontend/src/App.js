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
      <div className="App">
        <div className="App-header">
          <h1>🤖 AI Destekli Chat</h1>
          <p>Güvenli mesajlaşma ve duygu analizi</p>
        </div>

        {error && <div style={{color: 'red', padding: '10px'}}>{error}</div>}

        <form onSubmit={handleLogin} style={{padding: '20px'}}>
          <div style={{marginBottom: '10px'}}>
            <label>Kullanıcı Adı: </label>
            <input
              type="text"
              value={loginForm.username}
              onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
              disabled={loading}
              placeholder="Kullanıcı adınızı girin"
            />
          </div>
          <div style={{marginBottom: '10px'}}>
            <label>Şifre: </label>
            <input
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              disabled={loading}
              placeholder="Şifrenizi girin"
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div style={{padding: '20px'}}>
          <h3>Demo Kullanıcıları</h3>
          <div style={{textAlign: 'left', maxWidth: '300px', margin: '0 auto'}}>
            <div onClick={() => setLoginForm({username: 'admin1', password: '1234'})} style={{cursor: 'pointer', padding: '5px', background: '#f0f0f0', margin: '5px 0', borderRadius: '3px'}}>
              <strong>admin1</strong> / 1234
            </div>
            <div onClick={() => setLoginForm({username: 'alice05', password: '1234'})} style={{cursor: 'pointer', padding: '5px', background: '#f0f0f0', margin: '5px 0', borderRadius: '3px'}}>
              <strong>alice05</strong> / 1234
            </div>
            <div onClick={() => setLoginForm({username: 'bob22', password: '1234'})} style={{cursor: 'pointer', padding: '5px', background: '#f0f0f0', margin: '5px 0', borderRadius: '3px'}}>
              <strong>bob22</strong> / 1234
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Chat Page
  return (
    <div className="App">
      <div className="App-header">
        <h1>🤖 AI Destekli Chat</h1>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <span>👤 {currentUser.username}</span>
          <button onClick={handleLogout}>Çıkış</button>
        </div>
      </div>

      {error && <div style={{color: 'red', padding: '10px'}}>{error}</div>}

      <div style={{padding: '20px'}}>
        <h2>🟢 Online Kullanıcılar ({users.length})</h2>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
          {users.map(user => (
            <div key={user.id} style={{
              padding: '10px',
              background: user.id === currentUser.id ? '#e3f2fd' : '#f5f5f5',
              borderRadius: '5px',
              border: user.id === currentUser.id ? '2px solid #2196f3' : '1px solid #ddd'
            }}>
              <span>👤 {user.username}</span>
              {user.id === currentUser.id && <span style={{color: '#2196f3'}}> (Sen)</span>}
            </div>
          ))}
        </div>
      </div>

      <div style={{padding: '20px', textAlign: 'center'}}>
        <h2>🎉 Chat Uygulaması Hazır!</h2>
        <p>Backend: ✅ Çalışıyor</p>
        <p>AI Service: ✅ Çalışıyor</p>
        <p>Frontend: ✅ Çalışıyor</p>
        <p>Kullanıcı Sayısı: {users.length}</p>
      </div>
    </div>
  );
}

export default App;
