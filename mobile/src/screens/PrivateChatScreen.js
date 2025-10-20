import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPrivateMessages, sendMessage } from '../services/api';

const PrivateChatScreen = ({ route, navigation }) => {
  const { otherUserId, otherUserName } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadCurrentUser();
    loadMessages();

    const interval = setInterval(() => {
      loadMessages(true);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const loadCurrentUser = async () => {
    const userId = await AsyncStorage.getItem('userId');
    setCurrentUserId(parseInt(userId));
  };

  const loadMessages = async (silent = false) => {
    if (!silent) setLoading(true);

    try {
      const userId = await AsyncStorage.getItem('userId');
      console.log('loadMessages - userId:', userId, 'otherUserId:', otherUserId);
      
      if (!userId) {
        console.error('User ID bulunamadı');
        setMessages([]);
        return;
      }
      
      // Özel mesajları direkt backend'den çek
      console.log('=== ÖZEL MESAJLAR ÇEKİLİYOR ===');
      const privateMessages = await getPrivateMessages(userId, otherUserId);
      console.log('Backend\'den gelen özel mesajlar:', privateMessages.length);
      console.log('Özel mesajlar:', JSON.stringify(privateMessages, null, 2));
      
      // Mesajları tarihe göre sırala (en eski yukarıda)
      const sortedMessages = privateMessages.sort((a, b) => {
        const dateA = new Date(a.sentAt || a.timestamp || a.createdAt || a.created_at || a.date || a.time || a.created);
        const dateB = new Date(b.sentAt || b.timestamp || b.createdAt || b.created_at || b.date || b.time || b.created);
        return dateA - dateB;
      });
      
      console.log('Sıralanmış mesajlar:', sortedMessages.length);
      setMessages(sortedMessages);
    } catch (error) {
      console.error('Load messages error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      setMessages([]);
      if (!silent) {
        Alert.alert('Hata', 'Mesajlar yüklenemedi: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const userId = await AsyncStorage.getItem('userId');
      console.log('Mesaj gönderiliyor:', { messageText, userId, otherUserId });
      
      await sendMessage(messageText, parseInt(userId), otherUserId);
      console.log('Mesaj başarıyla gönderildi');
      
      // Mesajları yeniden yükle
      await loadMessages(true);
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Send message error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      Alert.alert('Hata', 'Mesaj gönderilemedi: ' + error.message);
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    if (!sentiment) return '#6b7280';
    const s = sentiment.toLowerCase();
    if (s === 'positive' || s === 'pozitif') return '#10b981';
    if (s === 'negative' || s === 'negatif') return '#ef4444';
    return '#6b7280';
  };

  const getSentimentEmoji = (sentiment) => {
    if (!sentiment) return '😐';
    const s = sentiment.toLowerCase();
    if (s === 'positive' || s === 'pozitif') return '😊';
    if (s === 'negative' || s === 'negatif') return '😢';
    return '😐';
  };

  const formatTimestamp = (timestamp) => {
    console.log('formatTimestamp çağrıldı:', timestamp);
    
    if (!timestamp) {
      console.log('Timestamp yok:', timestamp);
      // Eğer hiç tarih yoksa, şu anki zamanı kullan
      const now = new Date();
      return now.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    
    // Farklı tarih formatlarını dene
    let date;
    if (typeof timestamp === 'string') {
      // ISO string formatı
      date = new Date(timestamp);
    } else if (typeof timestamp === 'number') {
      // Unix timestamp
      date = new Date(timestamp * 1000);
    } else {
      date = new Date(timestamp);
    }
    
    if (isNaN(date.getTime())) {
      console.log('Geçersiz tarih:', timestamp, 'Tip:', typeof timestamp);
      // Geçersiz tarih durumunda şu anki zamanı kullan
      const now = new Date();
      return now.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (messageDate.getTime() === today.getTime()) {
      // Bugün
      return date.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      // Başka gün
      return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.userId === currentUserId || item.senderId === currentUserId;
    const sentimentColor = getSentimentColor(item.sentiment);

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessage : styles.otherMessage,
        ]}>
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
          ]}>
          <Text style={[
            styles.messageText,
            isMyMessage && styles.myMessageText
          ]}>
            {item.content}
          </Text>
          
          <View style={styles.messageFooter}>
            <Text style={[
              styles.messageTime,
              isMyMessage && styles.myMessageTime
            ]}>
              {formatTimestamp(item.createdAt || item.timestamp || item.created_at || item.date || item.time || item.created)}
            </Text>
            
            {item.sentiment && (
              <View style={styles.sentimentContainer}>
                <Text style={styles.sentimentEmoji}>
                  {getSentimentEmoji(item.sentiment)}
                </Text>
                <View
                  style={[
                    styles.sentimentDot,
                    { backgroundColor: sentimentColor },
                  ]}
                />
              </View>
            )}

            {isMyMessage && item.isRead !== undefined && (
              <Text style={styles.messageStatus}>
                {item.isRead ? '✓✓' : '✓'}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => {
          // Güvenli key extractor - id yoksa index kullan
          if (item && item.id) {
            return item.id.toString();
          }
          return `private_message_${index}`;
        }}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Henüz mesaj yok. İlk mesajı gönderin! 💬
            </Text>
          </View>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Mesajınızı yazın..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={500}
          editable={!sending}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!newMessage.trim() || sending) && styles.sendButtonDisabled,
          ]}
          onPress={handleSendMessage}
          disabled={!newMessage.trim() || sending}>
          <Text style={styles.sendButtonText}>
            {sending ? '...' : '➤'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  },
  messagesList: {
    padding: 12,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '75%',
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  myMessageBubble: {
    backgroundColor: '#2563eb',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#1f2937',
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  messageTime: {
    fontSize: 11,
    color: '#9ca3af',
  },
  myMessageTime: {
    color: '#e0e7ff',
  },
  sentimentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sentimentEmoji: {
    fontSize: 12,
  },
  sentimentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  messageStatus: {
    fontSize: 12,
    color: '#e0e7ff',
    marginLeft: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default PrivateChatScreen;