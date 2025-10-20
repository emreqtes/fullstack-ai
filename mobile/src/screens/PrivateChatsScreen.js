import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserPrivateMessages, getAllUsers } from '../services/api';

const PrivateChatsScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    loadCurrentUser();
    loadConversations();
    loadAllUsers();
    
    const interval = setInterval(() => {
      loadConversations(true);
    }, 3000);

    const unsubscribe = navigation.addListener('focus', () => {
      loadConversations();
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [navigation]);

  const loadCurrentUser = async () => {
    const userId = await AsyncStorage.getItem('userId');
    setCurrentUserId(parseInt(userId));
  };

  const loadAllUsers = async () => {
    try {
      console.log('loadAllUsers çağrıldı');
      const users = await getAllUsers();
      console.log('Tüm kullanıcılar:', users);
      setAllUsers(users || []);
    } catch (error) {
      console.error('Kullanıcılar yüklenemedi:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      setAllUsers([]);
    }
  };

  const loadConversations = async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setRefreshing(true);
    }

    try {
      const userId = await AsyncStorage.getItem('userId');
      console.log('loadConversations - userId:', userId);
      
      if (!userId) {
        console.error('User ID bulunamadı');
        setConversations([]);
        return;
      }
      
      // Backend'den direkt özel mesajları çek
      console.log('=== BACKEND ÖZEL MESAJLAR ÇEKİLİYOR ===');
      const privateMessages = await getUserPrivateMessages(userId);
      console.log('Backend\'den gelen özel mesajlar:', privateMessages.length);
      console.log('Özel mesajlar:', JSON.stringify(privateMessages, null, 2));
      
      // Backend'den gelen veri zaten gruplandırılmış ConversationDto formatında
      console.log('Backend\'den gelen konuşmalar:', privateMessages.length);
      console.log('Konuşmalar:', JSON.stringify(privateMessages, null, 2));
      
      // Backend'den gelen ConversationDto'yu mobil formatına çevir
      const formattedConversations = privateMessages.map(conversation => ({
        otherUserId: conversation.otherUserId,
        otherUserName: conversation.otherUsername,
        lastMessageContent: conversation.lastMessageContent,
        lastMessageTime: new Date(conversation.lastMessageAt),
        unreadCount: conversation.unreadCount,
        messages: [] // Backend'den sadece konuşma listesi geliyor, mesajlar ayrı çekilecek
      }));
      
      console.log('Formatlanmış konuşmalar:', formattedConversations);
      setConversations(formattedConversations);
    } catch (error) {
      console.error('Load conversations error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      setConversations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Mesajları kullanıcı bazında gruplandır
  const groupConversationsByUser = (messages, currentUserId) => {
    const conversationMap = new Map();
    
    console.log('groupConversationsByUser başladı:', { messagesCount: messages.length, currentUserId });
    
    messages.forEach((message, index) => {
      console.log(`Mesaj ${index}:`, JSON.stringify(message, null, 2));
      
      // Özel mesajlar için senderId ve receiverId kullan
      const senderId = parseInt(message.senderId || message.userId || message.user?.id);
      const receiverId = parseInt(message.receiverId || message.otherUserId || message.toUserId);
      const currentUserIdInt = parseInt(currentUserId);
      
      console.log('Özel mesaj ID\'leri:', { senderId, receiverId, currentUserIdInt });
      
      // receiverId yoksa bu genel mesaj, atla
      if (!receiverId || isNaN(receiverId)) {
        console.log('Genel mesaj atlandı (receiverId yok):', message);
        return;
      }
      
      // Karşı tarafın ID'sini bul
      const otherUserId = senderId === currentUserIdInt ? receiverId : senderId;
      
      if (!otherUserId || otherUserId === currentUserIdInt) {
        console.log('Mesaj atlandı:', { otherUserId, currentUserIdInt });
        return;
      }
      
      const conversationKey = otherUserId;
      
      if (!conversationMap.has(conversationKey)) {
        // Kullanıcı adını belirle
        let otherUserName = 'Bilinmeyen';
        if (senderId === currentUserIdInt) {
          otherUserName = message.receiverName || message.otherUserName || message.receiver?.username || 'Bilinmeyen';
        } else {
          otherUserName = message.senderName || message.user?.username || message.username || message.sender?.username || 'Bilinmeyen';
        }
        
        conversationMap.set(conversationKey, {
          otherUserId: otherUserId,
          otherUserName: otherUserName,
          lastMessageContent: '',
          lastMessageTime: null,
          unreadCount: 0,
          messages: []
        });
        
        console.log('Yeni konuşma oluşturuldu:', { otherUserId, otherUserName });
      }
      
      const conversation = conversationMap.get(conversationKey);
      conversation.messages.push(message);
      
      // En son mesajı güncelle - tarih tanımlarını genişlet
      const possibleDates = [
        message.timestamp,
        message.createdAt,
        message.created_at,
        message.date,
        message.time,
        message.created,
        message.updatedAt,
        message.updated_at,
        message.sentAt,
        message.sent_at
      ];
      
      let messageTime = null;
      for (const dateField of possibleDates) {
        if (dateField) {
          const testDate = new Date(dateField);
          if (!isNaN(testDate.getTime())) {
            messageTime = testDate;
            break;
          }
        }
      }
      
      // Eğer hiçbir tarih bulunamazsa, şu anki zamanı kullan
      if (!messageTime) {
        messageTime = new Date();
        console.log('Tarih bulunamadı, şu anki zaman kullanılıyor:', message);
      }
      
      if (!conversation.lastMessageTime || messageTime > conversation.lastMessageTime) {
        conversation.lastMessageContent = message.content || message.message || message.text || 'Mesaj';
        conversation.lastMessageTime = messageTime;
        console.log('En son mesaj güncellendi:', { content: conversation.lastMessageContent, time: messageTime });
      }
    });
    
    // Map'i array'e çevir ve tarihe göre sırala
    const result = Array.from(conversationMap.values())
      .sort((a, b) => (b.lastMessageTime || new Date(0)) - (a.lastMessageTime || new Date(0)));
    
    console.log('Gruplandırma tamamlandı:', result.length, 'konuşma');
    return result;
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadConversations().finally(() => setRefreshing(false));
  };

  const formatTime = (dateString) => {
    console.log('formatTime çağrıldı:', dateString);
    
    if (!dateString) {
      console.log('dateString yok:', dateString);
      return 'Tarih yok';
    }
    
    // Date objesi oluştur
    let date;
    if (typeof dateString === 'string') {
      date = new Date(dateString);
    } else if (dateString instanceof Date) {
      date = dateString;
    } else {
      console.log('Geçersiz tarih formatı:', dateString);
      return 'Geçersiz tarih';
    }
    
    // Tarih geçerli mi kontrol et
    if (isNaN(date.getTime())) {
      console.log('Geçersiz tarih:', dateString);
      return 'Geçersiz tarih';
    }
    
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Şimdi';
    if (minutes < 60) return `${minutes}dk`;
    if (hours < 24) return `${hours}s`;
    if (days < 7) return `${days}g`;
    
    // Daha eski tarihler için tam tarih göster
    return date.toLocaleDateString('tr-TR', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStartChat = (user) => {
    navigation.navigate('PrivateChat', {
      otherUserId: user.id,
      otherUserName: user.username
    });
  };

  const filteredUsers = allUsers.filter(user => {
    const matches = user.id !== currentUserId && 
                   user.username.toLowerCase().includes(searchQuery.toLowerCase());
    console.log('Kullanıcı filtresi:', { 
      userId: user.id, 
      username: user.username, 
      currentUserId, 
      searchQuery, 
      matches 
    });
    return matches;
  });

  console.log('Arama sonuçları:', { 
    allUsersCount: allUsers.length, 
    filteredUsersCount: filteredUsers.length, 
    searchQuery,
    currentUserId 
  });

  const renderUserItem = ({ item }) => {
    console.log('renderUserItem çağrıldı:', item);
    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => handleStartChat(item)}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(item.username || 'U').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.username || 'Bilinmeyen'}</Text>
          <Text style={styles.userId}>ID: {item.id}</Text>
        </View>
        <Text style={styles.startChatText}>Mesaj Gönder</Text>
      </TouchableOpacity>
    );
  };

  const renderConversationItem = ({ item }) => {
    console.log('renderConversationItem çağrıldı:', JSON.stringify(item, null, 2));
    
    const unreadCount = item.unreadCount || 0;
    const otherUserName = item.otherUserName || item.username || 'Bilinmeyen Kullanıcı';
    const lastMessageContent = item.lastMessageContent || item.content || 'Mesaj yok';
    const lastMessageTime = item.lastMessageTime || item.timestamp || item.createdAt || item.created_at || item.date || item.time || item.created;
    
    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => navigation.navigate('PrivateChat', {
          otherUserId: item.otherUserId || item.id,
          otherUserName: otherUserName
        })}>
        
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {otherUserName.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text style={styles.userName}>{otherUserName}</Text>
            <Text style={styles.time}>{formatTime(lastMessageTime)}</Text>
          </View>
          
          <View style={styles.messagePreview}>
            <Text 
              style={[
                styles.lastMessage,
                unreadCount > 0 && styles.unreadMessage
              ]} 
              numberOfLines={1}>
              {lastMessageContent}
            </Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && conversations.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // Empty state'i kaldırdık - arama butonu her zaman görünsün

  return (
    <View style={styles.container}>
      {/* Arama Butonu */}
      <TouchableOpacity
        style={styles.searchButton}
        onPress={() => setShowSearch(!showSearch)}>
        <Text style={styles.searchButtonText}>
          {showSearch ? 'Konuşmalar' : 'Kullanıcı Ara'}
        </Text>
      </TouchableOpacity>

      {/* Arama Alanı */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Kullanıcı adı ara..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      )}

      {/* İçerik */}
      {showSearch ? (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item, index) => {
            // Güvenli key extractor - id yoksa index kullan
            if (item && item.id) {
              return item.id.toString();
            }
            return `user_${index}`;
          }}
          renderItem={renderUserItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadAllUsers().finally(() => setRefreshing(false));
              }}
            />
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'Kullanıcı bulunamadı' : 'Kullanıcı yok'}
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item, index) => {
            // Güvenli key extractor - otherUserId yoksa index kullan
            if (item && item.otherUserId) {
              return item.otherUserId.toString();
            }
            return `conversation_${index}`;
          }}
          renderItem={renderConversationItem}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={() => {
                setRefreshing(true);
                loadConversations().finally(() => setRefreshing(false));
              }} 
            />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>Henüz özel mesajınız yok</Text>
              <Text style={styles.emptySubtext}>Yukarıdaki "Kullanıcı Ara" butonunu kullanarak mesaj gönderin</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContent: {
    paddingVertical: 8,
  },
  conversationItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  time: {
    fontSize: 12,
    color: '#9ca3af',
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#1f2937',
  },
  unreadBadge: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  searchButton: {
    backgroundColor: '#8b5cf6',
    margin: 12,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userId: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  startChatText: {
    color: '#8b5cf6',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PrivateChatsScreen;