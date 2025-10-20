import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { getAllMessages, sendMessage } from '../services/api';

export default function ChatScreen({ route }) {
  const { user } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await getAllMessages();
      console.log('=== API\'den gelen mesaj verileri ===');
      console.log('Toplam mesaj sayısı:', data.length);
      if (data.length > 0) {
        console.log('İlk mesaj örneği:', JSON.stringify(data[0], null, 2));
        console.log('Mesaj alanları:', Object.keys(data[0]));
        console.log('Tarih alanları kontrolü:');
        console.log('- timestamp:', data[0].timestamp);
        console.log('- createdAt:', data[0].createdAt);
        console.log('- created_at:', data[0].created_at);
        console.log('- date:', data[0].date);
        console.log('- time:', data[0].time);
        console.log('- created:', data[0].created);
      }
      console.log('=====================================');
      
      const publicMessages = data.filter(msg => {
        // receiverId yoksa genel mesaj
        const hasReceiverId = msg.receiverId && !isNaN(msg.receiverId);
        return !hasReceiverId;
      });
      // Mesajları tarihe göre sırala (en eski yukarıda)
      const sortedMessages = publicMessages.sort((a, b) => {
        const dateA = new Date(a.timestamp || a.createdAt || a.created_at || a.date || a.time || a.created);
        const dateB = new Date(b.timestamp || b.createdAt || b.created_at || b.date || b.time || b.created);
        return dateA - dateB;
      });
      setMessages(sortedMessages);
    } catch (error) {
      console.error('Mesajlar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(newMessage.trim(), user.id);
      setNewMessage('');
      await loadMessages();
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Mesaj gönderilemedi:', error);
    } finally {
      setSending(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'pozitif':
      case 'positive':
        return '#10b981';
      case 'negatif':
      case 'negative':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getSentimentEmoji = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'pozitif':
      case 'positive':
        return '😊';
      case 'negatif':
      case 'negative':
        return '😔';
      default:
        return '😐';
    }
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
    const isMyMessage = item.userId === user.id;
    const sentimentColor = getSentimentColor(item.sentiment);
    const sentimentEmoji = getSentimentEmoji(item.sentiment);
    
    // Kullanıcı adını güvenli şekilde al
    const senderName = item.user?.username || item.username || 'Bilinmeyen Kullanıcı';
    console.log('Mesaj detayları:', {
      item: item,
      senderName: senderName,
      timestamp: item.timestamp || item.createdAt
    });

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessage : styles.otherMessage,
        ]}>
        {!isMyMessage && (
          <Text style={styles.senderName}>{senderName}</Text>
        )}
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
          ]}>
          <Text
            style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.otherMessageText,
            ]}>
            {item.content}
          </Text>
          {item.sentiment && (
            <View style={[styles.sentimentBadge, { backgroundColor: sentimentColor + '20' }]}>
              <Text style={styles.sentimentEmoji}>{sentimentEmoji}</Text>
              <Text style={[styles.sentimentLabel, { color: sentimentColor }]}>
                {item.sentiment}
              </Text>
              {item.sentimentConfidence && (
                <Text style={[styles.confidence, { color: sentimentColor }]}>
                  {Math.round(item.sentimentConfidence * 100)}%
                </Text>
              )}
            </View>
          )}
        </View>
        <Text style={styles.timestamp}>
          {formatTimestamp(item.timestamp || item.createdAt || item.created_at || item.date || item.time || item.created)}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={90}>
      {loading && messages.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Mesajlar yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => {
            // Güvenli key extractor - id yoksa index kullan
            if (item && item.id) {
              return item.id.toString();
            }
            return `message_${index}`;
          }}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Mesajınızı yazın..."
          placeholderTextColor="#94a3b8"
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, sending && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={sending || !newMessage.trim()}>
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>➤</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 16,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
    marginLeft: 8,
    fontWeight: '600',
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    fontSize: 16,
    lineHeight: 22,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#1e293b',
  },
  sentimentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  sentimentEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  sentimentLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  confidence: {
    fontSize: 11,
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
    marginHorizontal: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
    color: '#1e293b',
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
    backgroundColor: '#94a3b8',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});