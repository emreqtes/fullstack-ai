import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Chat states
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [privateMessages, setPrivateMessages] = useState([]);
  const [viewMode, setViewMode] = useState('private'); // 'general' or 'private'

  // Check if user is already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
      loadUsers();
      loadConversations();
    }
  }, [loadUsers, loadConversations]);

  // Load users
  const loadUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      setUsers(response.data);
    } catch (err) {
      console.error("Kullanıcılar yüklenirken hata oluştu:", err);
    }
  }, []);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/privatemessages/conversations/${currentUser.id}`);
      setConversations(response.data);
    } catch (err) {
      console.error("Konuşmalar yüklenirken hata oluştu:", err);
    }
  }, [currentUser]);

  // Load private messages
  const loadPrivateMessages = useCallback(async (otherUserId) => {
    if (!currentUser || !otherUserId) return;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/privatemessages/${currentUser.id}/${otherUserId}`);
      setPrivateMessages(response.data);
      
      // Mark messages as read
      await axios.put(`${API_BASE_URL}/privatemessages/conversation/${currentUser.id}/${otherUserId}/read`);
    } catch (err) {
      console.error("Özel mesajlar yüklenirken hata oluştu:", err);
    }
  }, [currentUser]);

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
      loadConversations();
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

  // Register function
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!registerForm.username.trim() || !registerForm.password.trim()) {
      setError('Kullanıcı adı ve şifre gerekli');
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    if (registerForm.username.length < 3) {
      setError('Kullanıcı adı en az 3 karakter olmalı');
      return;
    }

    if (registerForm.password.length < 6) {
      setError('Şifre en az 6 karakter olmalı');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        username: registerForm.username.trim(),
        password: registerForm.password.trim()
      });
      
      setCurrentUser(response.data);
      setIsLoggedIn(true);
      localStorage.setItem('currentUser', JSON.stringify(response.data));
      loadUsers();
      loadConversations();
    } catch (err) {
      if (err.response?.data === 'Kullanıcı adı zaten kullanılıyor.') {
        setError('Bu kullanıcı adı zaten kullanılıyor');
      } else {
        console.error("Kayıt olurken hata oluştu:", err);
        setError('Kayıt olurken hata oluştu');
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
    setConversations([]);
    setPrivateMessages([]);
    setSelectedUser(null);
  };

  // Send private message
  const sendPrivateMessage = async () => {
    if (!message.trim() || !currentUser || !selectedUser) return;

    try {
      setLoading(true);
      setError('');
      
      await axios.post(`${API_BASE_URL}/privatemessages`, {
        content: message.trim(),
        senderId: currentUser.id,
        receiverId: selectedUser.id
      });
      
      setMessage('');
      loadPrivateMessages(selectedUser.id);
      loadConversations();
    } catch (err) {
      console.error("Özel mesaj gönderilirken hata oluştu:", err);
      setError('Mesaj gönderilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Select user
  const selectUser = (user) => {
    setSelectedUser(user);
    loadPrivateMessages(user.id);
    setViewMode('private');
  };

  // Duygu rengi
  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'pozitif': return '#4CAF50';
      case 'negatif': return '#F44336';
      case 'nötr': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  // Duygu emoji
  const getSentimentEmoji = (sentiment) => {
    switch (sentiment) {
      case 'pozitif': return '😊';
      case 'negatif': return '😞';
      case 'nötr': return '😐';
      default: return '❓';
    }
  };

  // Mesaj durumu emoji
  const getMessageStatusEmoji = (status) => {
    switch (status) {
      case 0: return '✓'; // Sent
      case 1: return '✓✓'; // Delivered
      case 2: return '✓✓'; // Read (blue)
      default: return '✓';
    }
  };

  // Mesaj durumu rengi
  const getMessageStatusColor = (status) => {
    switch (status) {
      case 0: return '#999'; // Sent
      case 1: return '#999'; // Delivered
      case 2: return '#2196F3'; // Read (blue)
      default: return '#999';
    }
  };

  // Real-time updates
  useEffect(() => {
    if (currentUser) {
      const interval = setInterval(() => {
        loadUsers();
        loadConversations();
        if (selectedUser) {
          loadPrivateMessages(selectedUser.id);
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [currentUser, selectedUser, loadUsers, loadConversations, loadPrivateMessages]);

  // Login/Register Page
  if (!isLoggedIn) {
    return (
      <div className="app">
        <div className="auth-container">
          <div className="auth-header">
            <h1>💬 AI Destekli Sohbet</h1>
            <p>Güvenli mesajlaşma ve duygu analizi</p>
          </div>

          <div className="auth-tabs">
            <button 
              className={activeTab === 'login' ? 'active' : ''} 
              onClick={() => setActiveTab('login')}
            >
              Giriş Yap
            </button>
            <button 
              className={activeTab === 'register' ? 'active' : ''} 
              onClick={() => setActiveTab('register')}
            >
              Kayıt Ol
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {activeTab === 'login' ? (
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
          ) : (
            <form onSubmit={handleRegister} className="auth-form">
              <div className="form-group">
                <label>Kullanıcı Adı</label>
                <input
                  type="text"
                  value={registerForm.username}
                  onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})}
                  disabled={loading}
                  placeholder="Kullanıcı adınızı girin"
                />
              </div>
              <div className="form-group">
                <label>Şifre</label>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                  disabled={loading}
                  placeholder="Şifrenizi girin"
                />
              </div>
              <div className="form-group">
                <label>Şifre Tekrar</label>
                <input
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                  disabled={loading}
                  placeholder="Şifrenizi tekrar girin"
                />
              </div>
              <button type="submit" disabled={loading} className="auth-button">
                {loading ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
              </button>
            </form>
          )}

          <div className="demo-users">
            <h3>Demo Kullanıcıları</h3>
            <div className="demo-user-list">
              <div className="demo-user" onClick={() => setLoginForm({username: 'admin', password: '1234'})}>
                <strong>admin</strong> / 1234
              </div>
              <div className="demo-user" onClick={() => setLoginForm({username: 'alice', password: '1234'})}>
                <strong>alice</strong> / 1234
              </div>
              <div className="demo-user" onClick={() => setLoginForm({username: 'bob', password: '1234'})}>
                <strong>bob</strong> / 1234
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
            <div className="header-actions">
              <div className="view-mode-buttons">
                <button 
                  className={viewMode === 'private' ? 'active' : ''} 
                  onClick={() => setViewMode('private')}
                >
                  💬 Mesajlar
                </button>
              </div>
              <button onClick={handleLogout} className="logout-button">
                Çıkış
              </button>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="chat-main">
          <div className="chat-sidebar">
            <h3>💬 Konuşmalar</h3>
            <div className="conversations-list">
              {conversations.map(conv => (
                <div 
                  key={conv.OtherUserId} 
                  className={`conversation-item ${selectedUser?.id === conv.OtherUserId ? 'selected' : ''}`}
                  onClick={() => selectUser({ id: conv.OtherUserId, username: conv.OtherUsername })}
                >
                  <div className="conversation-header">
                    <span className="conversation-user">👤 {conv.OtherUsername}</span>
                    {conv.UnreadCount > 0 && (
                      <span className="unread-badge">{conv.UnreadCount}</span>
                    )}
                  </div>
                  <div className="conversation-time">
                    {conv.LastMessageAt ? new Date(conv.LastMessageAt).toLocaleTimeString() : ''}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="users-section">
              <h3>🟢 Online Kullanıcılar ({users.length})</h3>
              <div className="users-list">
                {users.map(user => (
                  <div 
                    key={user.id} 
                    className={`user-item ${user.id === currentUser.id ? 'current' : ''}`}
                    onClick={() => selectUser(user)}
                  >
                    <span className="user-avatar">👤</span>
                    <span className="user-name">{user.username}</span>
                    {user.id === currentUser.id && <span className="you-badge">(Sen)</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="chat-content">
            <div className="private-chat">
              {selectedUser ? (
                <>
                  <div className="chat-header-private">
                    <h3>💬 {selectedUser.username} ile sohbet</h3>
                  </div>
                  <div className="message-list">
                    {privateMessages.length === 0 ? (
                      <div className="no-messages">
                        <p>💬 Henüz mesaj yok. İlk mesajı sen gönder!</p>
                      </div>
                    ) : (
                      privateMessages.map((msg) => (
                        <div key={msg.Id} className={`message ${msg.SenderId === currentUser.id ? 'own' : 'other'}`}>
                          <div className="message-bubble">
                            <div className="message-header">
                              <span className="message-username">
                                {msg.SenderId === currentUser.id ? '👤 Sen' : `👤 ${msg.SenderUsername}`}
                              </span>
                              <span className="message-time">{new Date(msg.SentAt).toLocaleTimeString()}</span>
                            </div>
                            <p className="message-content">{msg.Content}</p>
                            {msg.Sentiment && (
                              <div className="sentiment-badge" style={{ backgroundColor: getSentimentColor(msg.Sentiment) }}>
                                {getSentimentEmoji(msg.Sentiment)} {msg.Sentiment}
                                {msg.SentimentConfidence && ` (${(msg.SentimentConfidence * 100).toFixed(0)}%)`}
                              </div>
                            )}
                            <div className="message-status">
                              <span 
                                className="status-icon" 
                                style={{ color: getMessageStatusColor(msg.Status) }}
                              >
                                {getMessageStatusEmoji(msg.Status)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div className="no-selection">
                  <div className="welcome-message">
                    <h2>👋 Hoş Geldin, {currentUser.username}!</h2>
                    <p>Sol taraftan bir kullanıcı seçerek mesajlaşmaya başlayabilirsin.</p>
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
              )}
              
              {selectedUser && (
                <div className="input-group">
                  <input
                    type="text"
                    placeholder={`${selectedUser.username} ile mesajlaş...`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendPrivateMessage()}
                    disabled={loading}
                    className="message-input"
                  />
                  <button onClick={sendPrivateMessage} disabled={loading || !message.trim()} className="send-button">
                    {loading ? '⏳' : '📤'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;