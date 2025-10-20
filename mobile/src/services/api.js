import axios from 'axios';

const API_BASE_URL = 'https://fullstack-ai-klct.onrender.com/api';
const AI_SERVICE_URL = 'https://emreqtes-turkish-sentiment-analysis.hf.space/api/predict';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 saniye timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

export const createUser = async (username) => {
  try {
    const response = await api.post('/users', { username });
    return response.data;
  } catch (error) {
    console.error('Kullanıcı oluşturma hatası:', error);
    throw error;
  }
};

export const loginUser = async (username, password) => {
  try {
    console.log('=== loginUser API Çağrısı ===');
    console.log('URL:', `${API_BASE_URL}/auth/login`);
    console.log('Method: POST');
    console.log('Request Data:', { username, password: password ? '***' : 'yok' });
    
    // Önce AuthController'ın login endpoint'ini dene
    try {
      const response = await api.post('/auth/login', {
        username,
        password
      });
      
      console.log('AuthController Response Status:', response.status);
      console.log('AuthController Response Data:', JSON.stringify(response.data, null, 2));
      
      console.log('Kullanıcı girişi başarılı (AuthController):', response.data.username);
      console.log('=== loginUser Başarılı (AuthController) ===');
      
      return response.data;
    } catch (authError) {
      console.log('AuthController başarısız, UsersController deneniyor...');
      console.log('AuthController Error:', authError.response?.status, authError.message);
      
      // AuthController başarısız olursa, UsersController'ı kullan (fallback)
      console.log('=== Fallback: UsersController Login ===');
      console.log('URL:', `${API_BASE_URL}/users`);
      console.log('Method: GET');
      
      // Tüm kullanıcıları al
      const usersResponse = await api.get('/users');
      console.log('Users Response Status:', usersResponse.status);
      console.log('Users Response Data Length:', usersResponse.data.length);
      
      // Kullanıcıyı bul
      const user = usersResponse.data.find(u => u.username === username);
      if (!user) {
        throw new Error('Kullanıcı adı bulunamadı.');
      }
      
      // Şifre kontrolü (basit kontrol - gerçek uygulamada hash karşılaştırması yapılır)
      if (password && user.password && user.password !== password) {
        throw new Error('Şifre hatalı.');
      }
      
      console.log('Kullanıcı bulundu (UsersController):', user.username);
      console.log('=== loginUser Başarılı (UsersController) ===');
      
      return user;
    }
  } catch (error) {
    console.error('=== loginUser HATASI ===');
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    console.error('Error Status:', error.response?.status);
    console.error('Error Response Data:', error.response?.data);
    console.error('Request URL:', error.config?.url);
    console.error('Request Method:', error.config?.method);
    console.error('Request Headers:', error.config?.headers);
    console.error('Request Data:', { username, password: password ? '***' : 'yok' });
    console.error('===============================');
    
    // Daha spesifik hata mesajları
    if (error.code === 'ECONNABORTED') {
      throw new Error('Bağlantı zaman aşımına uğradı. İnternet bağlantınızı kontrol edin.');
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      throw new Error('İnternet bağlantısı hatası. Bağlantınızı kontrol edin.');
    } else if (error.response?.status >= 500) {
      throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
    } else if (error.response?.status === 404) {
      throw new Error('API servisi bulunamadı. Lütfen daha sonra tekrar deneyin.');
    } else {
      throw new Error(error.message || `Giriş hatası: ${error.message}`);
    }
  }
};

export const registerUser = async (username, password) => {
  try {
    console.log('=== registerUser API Çağrısı ===');
    console.log('URL:', `${API_BASE_URL}/auth/register`);
    console.log('Method: POST');
    console.log('Request Data:', { username, password: '***' });
    
    // Önce AuthController'ın register endpoint'ini dene
    try {
      const response = await api.post('/auth/register', {
        username,
        password
      });
      
      console.log('AuthController Response Status:', response.status);
      console.log('AuthController Response Data:', JSON.stringify(response.data, null, 2));
      
      console.log('Kullanıcı kaydı başarılı (AuthController):', response.data.username);
      console.log('=== registerUser Başarılı (AuthController) ===');
      
      return response.data;
    } catch (authError) {
      console.log('AuthController başarısız, UsersController deneniyor...');
      console.log('AuthController Error:', authError.response?.status, authError.message);
      
      // AuthController başarısız olursa, UsersController'ı kullan (fallback)
      console.log('=== Fallback: UsersController Register ===');
      console.log('URL:', `${API_BASE_URL}/users`);
      console.log('Method: GET + POST');
      
      // Önce kullanıcı adının mevcut olup olmadığını kontrol et
      const usersResponse = await api.get('/users');
      const existingUser = usersResponse.data.find(u => u.username === username);
      
      if (existingUser) {
        throw new Error('Bu kullanıcı adı zaten kullanılıyor.');
      }
      
      // Yeni kullanıcı oluştur (eski createUser fonksiyonunu kullan)
      const newUser = await createUser(username);
      
      console.log('Kullanıcı kaydı başarılı (UsersController):', newUser.username);
      console.log('=== registerUser Başarılı (UsersController) ===');
      
      return newUser;
    }
  } catch (error) {
    console.error('=== registerUser HATASI ===');
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    console.error('Error Status:', error.response?.status);
    console.error('Error Response Data:', error.response?.data);
    console.error('Request URL:', error.config?.url);
    console.error('Request Method:', error.config?.method);
    console.error('Request Headers:', error.config?.headers);
    console.error('Request Data:', { username, password: '***' });
    console.error('===============================');
    
    // Daha spesifik hata mesajları
    if (error.code === 'ECONNABORTED') {
      throw new Error('Bağlantı zaman aşımına uğradı. İnternet bağlantınızı kontrol edin.');
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      throw new Error('İnternet bağlantısı hatası. Bağlantınızı kontrol edin.');
    } else if (error.response?.status >= 500) {
      throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
    } else if (error.response?.status === 404) {
      throw new Error('API servisi bulunamadı. Lütfen daha sonra tekrar deneyin.');
    } else {
      throw new Error(error.message || `Kayıt hatası: ${error.message}`);
    }
  }
};

export const getAllUsers = async () => {
  try {
    console.log('=== getAllUsers API Çağrısı ===');
    console.log('URL:', `${API_BASE_URL}/users`);
    console.log('Method: GET');
    
    const response = await api.get('/users');
    
    console.log('Response Status:', response.status);
    console.log('Response Headers:', response.headers);
    console.log('Response Data Type:', typeof response.data);
    console.log('Response Data Length:', Array.isArray(response.data) ? response.data.length : 'Not an array');
    
    if (Array.isArray(response.data) && response.data.length > 0) {
      console.log('İlk kullanıcı örneği:', JSON.stringify(response.data[0], null, 2));
    }
    
    console.log('=== getAllUsers Başarılı ===');
    return response.data;
  } catch (error) {
    console.error('=== getAllUsers HATASI ===');
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    console.error('Error Status:', error.response?.status);
    console.error('Error Response Data:', error.response?.data);
    console.error('Request URL:', error.config?.url);
    console.error('Request Method:', error.config?.method);
    console.error('Request Headers:', error.config?.headers);
    console.error('===============================');
    throw error;
  }
};

export const sendMessage = async (content, userId, receiverId = null) => {
  try {
    console.log('=== sendMessage API Çağrısı ===');
    console.log('ReceiverId:', receiverId ? `Özel mesaj (${receiverId})` : 'Genel mesaj');
    
    if (receiverId) {
      // Özel mesaj - PrivateMessage endpoint'ini kullan
      console.log('=== ÖZEL MESAJ GÖNDERİLİYOR ===');
      console.log('URL:', `${API_BASE_URL}/privatemessages`);
      console.log('Method: POST');
      
      const privateMessageData = {
        content: content,
        senderId: parseInt(userId),
        receiverId: parseInt(receiverId)
      };
      
      console.log('Private Message Data:', JSON.stringify(privateMessageData, null, 2));
      
      const response = await api.post('/privatemessages', privateMessageData);
      
      console.log('Response Status:', response.status);
      console.log('Response Data:', JSON.stringify(response.data, null, 2));
      
      console.log('=== Özel Mesaj Başarılı ===');
      return response.data;
    } else {
      // Genel mesaj - Message endpoint'ini kullan
      console.log('=== GENEL MESAJ GÖNDERİLİYOR ===');
      console.log('URL:', `${API_BASE_URL}/messages`);
      console.log('Method: POST');
      
      const messageData = {
        content: content,
        userId: parseInt(userId)
      };
      
      console.log('Message Data:', JSON.stringify(messageData, null, 2));
      
      const response = await api.post('/messages', messageData);
      
      console.log('Response Status:', response.status);
      console.log('Response Data:', JSON.stringify(response.data, null, 2));
      
      console.log('=== Genel Mesaj Başarılı ===');
      return response.data;
    }
  } catch (error) {
    console.error('=== sendMessage HATASI ===');
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    console.error('Error Status:', error.response?.status);
    console.error('Error Response Data:', error.response?.data);
    console.error('Request URL:', error.config?.url);
    console.error('Request Method:', error.config?.method);
    console.error('Request Headers:', error.config?.headers);
    console.error('Request Data:', { content, userId: parseInt(userId), receiverId: receiverId ? parseInt(receiverId) : null });
    console.error('===============================');
    throw error;
  }
};

// Özel mesajları çekmek için yeni fonksiyonlar
export const getPrivateMessages = async (userId, otherUserId) => {
  try {
    console.log('=== getPrivateMessages API Çağrısı ===');
    console.log('URL:', `${API_BASE_URL}/privatemessages/${userId}/${otherUserId}`);
    console.log('Method: GET');
    console.log('Request Data:', { userId, otherUserId });
    
    const response = await api.get(`/privatemessages/${userId}/${otherUserId}`);
    
    console.log('Response Status:', response.status);
    console.log('Response Data Length:', Array.isArray(response.data) ? response.data.length : 'Not an array');
    
    if (Array.isArray(response.data) && response.data.length > 0) {
      console.log('İlk özel mesaj örneği:', JSON.stringify(response.data[0], null, 2));
    }
    
    console.log('=== getPrivateMessages Başarılı ===');
    return response.data;
  } catch (error) {
    console.error('=== getPrivateMessages HATASI ===');
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    console.error('Error Status:', error.response?.status);
    console.error('Error Response Data:', error.response?.data);
    console.error('Request URL:', error.config?.url);
    console.error('Request Method:', error.config?.method);
    console.error('Request Headers:', error.config?.headers);
    console.error('Request Data:', { userId, otherUserId });
    console.error('===============================');
    throw error;
  }
};

export const getUserPrivateMessages = async (userId) => {
  try {
    console.log('=== getUserPrivateMessages API Çağrısı ===');
    console.log('URL:', `${API_BASE_URL}/privatemessages/conversations/${userId}`);
    console.log('Method: GET');
    console.log('Request Data:', { userId });
    
    const response = await api.get(`/privatemessages/conversations/${userId}`);
    
    console.log('Response Status:', response.status);
    console.log('Response Data Length:', Array.isArray(response.data) ? response.data.length : 'Not an array');
    
    if (Array.isArray(response.data) && response.data.length > 0) {
      console.log('İlk konuşma örneği:', JSON.stringify(response.data[0], null, 2));
    }
    
    console.log('=== getUserPrivateMessages Başarılı ===');
    return response.data;
  } catch (error) {
    console.error('=== getUserPrivateMessages HATASI ===');
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    console.error('Error Status:', error.response?.status);
    console.error('Error Response Data:', error.response?.data);
    console.error('Request URL:', error.config?.url);
    console.error('Request Method:', error.config?.method);
    console.error('Request Headers:', error.config?.headers);
    console.error('Request Data:', { userId });
    console.error('===============================');
    throw error;
  }
};

export const getAllMessages = async () => {
  try {
    console.log('=== getAllMessages API Çağrısı ===');
    console.log('URL:', `${API_BASE_URL}/messages`);
    console.log('Method: GET');
    
    const response = await api.get('/messages');
    
    console.log('Response Status:', response.status);
    console.log('Response Headers:', response.headers);
    console.log('Response Data Type:', typeof response.data);
    console.log('Response Data Length:', Array.isArray(response.data) ? response.data.length : 'Not an array');
    
    if (Array.isArray(response.data) && response.data.length > 0) {
      console.log('İlk mesaj örneği:', JSON.stringify(response.data[0], null, 2));
    }
    
    console.log('=== getAllMessages Başarılı ===');
    return response.data;
  } catch (error) {
    console.error('=== getAllMessages HATASI ===');
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    console.error('Error Status:', error.response?.status);
    console.error('Error Response Data:', error.response?.data);
    console.error('Request URL:', error.config?.url);
    console.error('Request Method:', error.config?.method);
    console.error('Request Headers:', error.config?.headers);
    console.error('===============================');
    throw error;
  }
};

export const getConversation = async (userId, otherUserId) => {
  try {
    console.log('=== getConversation API Çağrısı ===');
    console.log('URL:', `${API_BASE_URL}/messages/conversation/${userId}/${otherUserId}`);
    console.log('Method: GET');
    console.log('Parameters:', { userId, otherUserId });
    
    // Önce mevcut endpoint'i dene
    let response;
    try {
      response = await api.get(`/messages/conversation/${userId}/${otherUserId}`);
    } catch (firstError) {
      console.log('İlk endpoint başarısız, alternatif endpoint deneniyor...');
      console.log('İlk hata:', firstError.response?.status, firstError.response?.data);
      
      // Alternatif endpoint'ler dene
      const alternativeEndpoints = [
        `/messages/private/${userId}/${otherUserId}`,
        `/messages/direct/${userId}/${otherUserId}`,
        `/conversations/${userId}/${otherUserId}`,
        `/messages?userId=${userId}&otherUserId=${otherUserId}`,
        `/messages?senderId=${userId}&receiverId=${otherUserId}`,
        `/messages?userId=${userId}&receiverId=${otherUserId}`
      ];
      
      for (const endpoint of alternativeEndpoints) {
        try {
          console.log(`Alternatif endpoint deneniyor: ${endpoint}`);
          response = await api.get(endpoint);
          console.log(`Başarılı endpoint bulundu: ${endpoint}`);
          break;
        } catch (altError) {
          console.log(`Endpoint başarısız: ${endpoint} - Status: ${altError.response?.status}`);
          continue;
        }
      }
      
      if (!response) {
        throw firstError; // İlk hatayı fırlat
      }
    }
    
    console.log('Response Status:', response.status);
    console.log('Response Headers:', response.headers);
    console.log('Response Data Type:', typeof response.data);
    console.log('Response Data Length:', Array.isArray(response.data) ? response.data.length : 'Not an array');
    
    if (Array.isArray(response.data) && response.data.length > 0) {
      console.log('İlk özel mesaj örneği:', JSON.stringify(response.data[0], null, 2));
    }
    
    console.log('=== getConversation Başarılı ===');
    return response.data;
  } catch (error) {
    console.error('=== getConversation HATASI ===');
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    console.error('Error Status:', error.response?.status);
    console.error('Error Response Data:', error.response?.data);
    console.error('Request URL:', error.config?.url);
    console.error('Request Method:', error.config?.method);
    console.error('Request Headers:', error.config?.headers);
    console.error('Parameters:', { userId, otherUserId });
    console.error('===============================');
    throw error;
  }
};

export const getConversationsList = async (userId) => {
  try {
    console.log('=== getConversationsList API Çağrısı ===');
    console.log('URL:', `${API_BASE_URL}/messages/conversations/${userId}`);
    console.log('Method: GET');
    console.log('Parameters:', { userId });
    
    // Önce mevcut endpoint'i dene
    let response;
    try {
      response = await api.get(`/messages/conversations/${userId}`);
    } catch (firstError) {
      console.log('İlk endpoint başarısız, alternatif endpoint deneniyor...');
      console.log('İlk hata:', firstError.response?.status, firstError.response?.data);
      
      // Alternatif endpoint'ler dene
      const alternativeEndpoints = [
        `/conversations/${userId}`,
        `/messages/conversation-list/${userId}`,
        `/messages/private-conversations/${userId}`,
        `/messages?userId=${userId}&type=private`,
        `/conversations?userId=${userId}`,
        `/messages/conversations?userId=${userId}`
      ];
      
      for (const endpoint of alternativeEndpoints) {
        try {
          console.log(`Alternatif endpoint deneniyor: ${endpoint}`);
          response = await api.get(endpoint);
          console.log(`Başarılı endpoint bulundu: ${endpoint}`);
          break;
        } catch (altError) {
          console.log(`Endpoint başarısız: ${endpoint} - Status: ${altError.response?.status}`);
          continue;
        }
      }
      
      if (!response) {
        throw firstError; // İlk hatayı fırlat
      }
    }
    
    console.log('Response Status:', response.status);
    console.log('Response Headers:', response.headers);
    console.log('Response Data Type:', typeof response.data);
    console.log('Response Data Length:', Array.isArray(response.data) ? response.data.length : 'Not an array');
    
    if (Array.isArray(response.data) && response.data.length > 0) {
      console.log('İlk konuşma örneği:', JSON.stringify(response.data[0], null, 2));
    }
    
    console.log('=== getConversationsList Başarılı ===');
    return response.data;
  } catch (error) {
    console.error('=== getConversationsList HATASI ===');
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    console.error('Error Status:', error.response?.status);
    console.error('Error Response Data:', error.response?.data);
    console.error('Request URL:', error.config?.url);
    console.error('Request Method:', error.config?.method);
    console.error('Request Headers:', error.config?.headers);
    console.error('Parameters:', { userId });
    console.error('===============================');
    throw error;
  }
};

export const analyzeSentiment = async (text) => {
  try {
    const response = await axios.post(AI_SERVICE_URL, {
      data: [text]
    });
    
    if (response.data && response.data.data && response.data.data[0]) {
      const result = response.data.data[0];
      return {
        sentiment: result.label || 'nötr',
        confidence: result.confidences?.[0]?.confidence || 0.5
      };
    }
    
    return { sentiment: 'nötr', confidence: 0.5 };
  } catch (error) {
    console.error('Duygu analizi hatası:', error);
    const lowerText = text.toLowerCase();
    if (lowerText.includes('harika') || lowerText.includes('güzel') || lowerText.includes('seviyorum')) {
      return { sentiment: 'pozitif', confidence: 0.7 };
    } else if (lowerText.includes('kötü') || lowerText.includes('berbat') || lowerText.includes('üzgün')) {
      return { sentiment: 'negatif', confidence: 0.7 };
    }
    return { sentiment: 'nötr', confidence: 0.5 };
  }
};

// Database temizleme fonksiyonu
export const clearAllMessages = async () => {
  try {
    console.log('=== clearAllMessages API Çağrısı ===');
    console.log('URL:', `${API_BASE_URL}/messages`);
    console.log('Method: DELETE');
    
    const response = await api.delete('/messages');
    
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    console.log('=== clearAllMessages Başarılı ===');
    
    return response.data;
  } catch (error) {
    console.error('=== clearAllMessages HATASI ===');
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    console.error('Error Status:', error.response?.status);
    console.error('Error Response Data:', error.response?.data);
    console.error('Request URL:', error.config?.url);
    console.error('Request Method:', error.config?.method);
    console.error('===============================');
    throw error;
  }
};

// Web API'sinin mevcut endpoint'lerini kontrol et
export const checkWebAPIEndpoints = async () => {
  try {
    console.log('=== WEB API ENDPOINT KONTROLÜ ===');
    
    // Mevcut endpoint'leri test et
    const endpoints = [
      '/messages',
      '/messages/private',
      '/messages/private/user',
      '/users',
      '/conversations',
      '/conversations/private'
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Testing endpoint: ${endpoint}`);
        const response = await api.get(endpoint);
        console.log(`✅ ${endpoint} - Status: ${response.status}, Data length: ${Array.isArray(response.data) ? response.data.length : 'Not array'}`);
        if (Array.isArray(response.data) && response.data.length > 0) {
          console.log(`Sample data from ${endpoint}:`, JSON.stringify(response.data[0], null, 2));
        }
      } catch (error) {
        console.log(`❌ ${endpoint} - Error: ${error.response?.status} - ${error.message}`);
      }
    }
    
    console.log('=== WEB API ENDPOINT KONTROLÜ TAMAMLANDI ===');
  } catch (error) {
    console.error('Endpoint kontrol hatası:', error);
  }
};
// Web API'sinde özel mesaj endpoint'i yok, genel mesajlardan simüle et
export const getPrivateMessagesFromWebAPI = async (userId, otherUserId) => {
  try {
    console.log('=== getPrivateMessagesFromWebAPI API Çağrısı ===');
    console.log('URL:', `${API_BASE_URL}/messages`);
    console.log('Method: GET');
    console.log('Request Data:', { userId, otherUserId });
    console.log('Not: Web API\'sinde özel mesaj endpoint\'i yok, genel mesajlardan simüle ediliyor');
    
    // Web API'sinden tüm mesajları al
    const response = await api.get('/messages');
    
    console.log('Response Status:', response.status);
    console.log('Response Data Length:', Array.isArray(response.data) ? response.data.length : 'Not an array');
    
    if (Array.isArray(response.data) && response.data.length > 0) {
      console.log('İlk mesaj örneği:', JSON.stringify(response.data[0], null, 2));
    }
    
    // Özel mesajları simüle et: bu iki kullanıcının mesajlarını göster
    const privateMessages = response.data.filter(message => {
      const senderId = parseInt(message.userId || message.senderId || message.user?.id || message.sender?.id);
      const receiverId = parseInt(message.receiverId || message.otherUserId || message.toUserId);
      const currentUserIdInt = parseInt(userId);
      const otherUserIdInt = parseInt(otherUserId);
      
      console.log('Özel mesaj simülasyonu:', { 
        messageId: message.id, 
        senderId, 
        receiverId,
        currentUserIdInt,
        otherUserIdInt,
        content: message.content,
        messageFields: Object.keys(message)
      });
      
      // Mesaj içeriğinde özel mesaj işareti var mı kontrol et
      const hasPrivateMarker = message.content && message.content.includes('[PRIVATE_TO_');
      
      // receiverId varsa özel mesaj, yoksa genel mesaj
      const hasReceiverId = receiverId && !isNaN(receiverId);
      
      // Bu iki kullanıcının mesajlarını özel mesaj olarak simüle et
      const isBetweenUsers = (senderId === currentUserIdInt && receiverId === otherUserIdInt) || 
                            (senderId === otherUserIdInt && receiverId === currentUserIdInt);
      
      // Özel mesaj işareti varsa veya receiverId varsa özel mesaj
      const isSimulatedPrivateMessage = (hasPrivateMarker || hasReceiverId) && isBetweenUsers;
      
      console.log('Özel mesaj kontrolü:', { 
        hasPrivateMarker,
        hasReceiverId, 
        isBetweenUsers, 
        isSimulatedPrivateMessage 
      });
      
      return isSimulatedPrivateMessage;
    });
    
    console.log('Simüle edilmiş özel mesajlar:', privateMessages.length);
    console.log('=== getPrivateMessagesFromWebAPI Başarılı ===');
    return privateMessages;
  } catch (error) {
    console.error('=== getPrivateMessagesFromWebAPI HATASI ===');
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    console.error('Error Status:', error.response?.status);
    console.error('Error Response Data:', error.response?.data);
    console.error('Request URL:', error.config?.url);
    console.error('Request Method:', error.config?.method);
    console.error('Request Headers:', error.config?.headers);
    console.error('Request Data:', { userId, otherUserId });
    console.error('===============================');
    throw error;
  }
};

// Web API'sinde özel mesaj endpoint'i yok, genel mesajlardan simüle et
export const getUserPrivateMessagesFromWeb = async (userId) => {
  try {
    console.log('=== getUserPrivateMessagesFromWeb API Çağrısı ===');
    console.log('URL:', `${API_BASE_URL}/messages`);
    console.log('Method: GET');
    console.log('Request Data:', { userId });
    console.log('Not: Web API\'sinde özel mesaj endpoint\'i yok, genel mesajlardan simüle ediliyor');
    
    // Web API'sinden tüm mesajları al
    const response = await api.get('/messages');
    
    console.log('Response Status:', response.status);
    console.log('Response Data Length:', Array.isArray(response.data) ? response.data.length : 'Not an array');
    
    if (Array.isArray(response.data) && response.data.length > 0) {
      console.log('İlk mesaj örneği:', JSON.stringify(response.data[0], null, 2));
    }
    
    // Kullanıcının özel mesajlarını simüle et
    // Hem gönderdiği hem de aldığı mesajları dahil et
    const privateMessages = response.data.filter(message => {
      const senderId = parseInt(message.userId || message.senderId || message.user?.id || message.sender?.id);
      const receiverId = parseInt(message.receiverId || message.otherUserId || message.toUserId);
      const currentUserIdInt = parseInt(userId);
      
      console.log('Özel mesaj simülasyonu:', { 
        messageId: message.id, 
        senderId, 
        receiverId,
        currentUserIdInt,
        content: message.content,
        messageFields: Object.keys(message)
      });
      
      // Mesaj içeriğinde özel mesaj işareti var mı kontrol et
      const hasPrivateMarker = message.content && message.content.includes('[PRIVATE_TO_');
      
      // receiverId varsa özel mesaj, yoksa genel mesaj
      const hasReceiverId = receiverId && !isNaN(receiverId);
      
      // Kullanıcının gönderdiği veya aldığı mesajları özel mesaj olarak simüle et
      const isUserInvolved = (senderId === currentUserIdInt) || (receiverId === currentUserIdInt);
      
      // Özel mesaj işareti varsa veya receiverId varsa özel mesaj
      const isSimulatedPrivateMessage = (hasPrivateMarker || hasReceiverId) && isUserInvolved;
      
      console.log('Özel mesaj kontrolü:', { 
        hasPrivateMarker,
        hasReceiverId, 
        isUserInvolved, 
        isSimulatedPrivateMessage 
      });
      
      return isSimulatedPrivateMessage;
    });
    
    console.log('Simüle edilmiş özel mesajlar:', privateMessages.length);
    console.log('=== getUserPrivateMessagesFromWeb Başarılı ===');
    return privateMessages;
  } catch (error) {
    console.error('=== getUserPrivateMessagesFromWeb HATASI ===');
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    console.error('Error Status:', error.response?.status);
    console.error('Error Response Data:', error.response?.data);
    console.error('Request URL:', error.config?.url);
    console.error('Request Method:', error.config?.method);
    console.error('Request Headers:', error.config?.headers);
    console.error('Request Data:', { userId });
    console.error('===============================');
    throw error;
  }
};

// Web API'sini test etmek için debug fonksiyonu
export const debugWebAPI = async () => {
  try {
    console.log('=== WEB API DEBUG BAŞLADI ===');
    
    // 1. Tüm mesajları çek
    console.log('1. Tüm mesajları çekiyorum...');
    const messagesResponse = await api.get('/messages');
    console.log('Messages Response:', messagesResponse.status);
    console.log('Messages Data:', JSON.stringify(messagesResponse.data, null, 2));
    
    // 2. Tüm kullanıcıları çek
    console.log('2. Tüm kullanıcıları çekiyorum...');
    const usersResponse = await api.get('/users');
    console.log('Users Response:', usersResponse.status);
    console.log('Users Data:', JSON.stringify(usersResponse.data, null, 2));
    
    // 3. Mesaj yapısını analiz et
    if (messagesResponse.data && messagesResponse.data.length > 0) {
      console.log('3. İlk mesajın yapısı:');
      const firstMessage = messagesResponse.data[0];
      console.log('Message Fields:', Object.keys(firstMessage));
      console.log('Message Values:', firstMessage);
      
      // Hangi alanlar var kontrol et
      console.log('Has userId?', 'userId' in firstMessage);
      console.log('Has receiverId?', 'receiverId' in firstMessage);
      console.log('Has senderId?', 'senderId' in firstMessage);
      console.log('Has user?', 'user' in firstMessage);
      console.log('Has sender?', 'sender' in firstMessage);
    }
    
    console.log('=== WEB API DEBUG TAMAMLANDI ===');
    return {
      messages: messagesResponse.data,
      users: usersResponse.data
    };
  } catch (error) {
    console.error('=== WEB API DEBUG HATASI ===');
    console.error('Error:', error);
    throw error;
  }
};

export const clearTestMessages = async () => {
  try {
    console.log('=== clearTestMessages API Çağrısı ===');
    
    // Önce tüm mesajları al
    const messagesResponse = await api.get('/messages');
    const allMessages = messagesResponse.data;
    
    console.log('Toplam mesaj sayısı:', allMessages.length);
    
    // Test mesajlarını filtrele (fake/test içeren mesajlar)
    const testMessages = allMessages.filter(message => {
      const content = (message.content || message.message || '').toLowerCase();
      return content.includes('test') || 
             content.includes('fake') || 
             content.includes('demo') ||
             content.includes('örnek') ||
             content.includes('deneme');
    });
    
    console.log('Test mesaj sayısı:', testMessages.length);
    
    // Test mesajlarını sil
    for (const message of testMessages) {
      try {
        await api.delete(`/messages/${message.id}`);
        console.log('Test mesaj silindi:', message.id);
      } catch (deleteError) {
        console.error('Mesaj silinemedi:', message.id, deleteError.message);
      }
    }
    
    console.log('=== clearTestMessages Tamamlandı ===');
    return { deletedCount: testMessages.length };
  } catch (error) {
    console.error('=== clearTestMessages HATASI ===');
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    console.error('Error Status:', error.response?.status);
    console.error('Error Response Data:', error.response?.data);
    console.error('===============================');
    throw error;
  }
};

export default api;