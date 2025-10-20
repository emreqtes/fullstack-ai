import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllMessages } from '../services/api';

export default function HomeScreen({ navigation, route }) {
  const { user } = route.params;

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış',
          onPress: async () => {
            await AsyncStorage.removeItem('user');
            navigation.replace('Login');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleDebugWebMessages = async () => {
    try {
      console.log('=== WEB MESAJLARI DEBUG BAŞLADI ===');
      const messages = await getAllMessages();
      console.log('Toplam mesaj sayısı:', messages.length);
      
      if (messages.length > 0) {
        console.log('İlk 3 mesajın yapısı:');
        messages.slice(0, 3).forEach((message, index) => {
          console.log(`Mesaj ${index + 1}:`, JSON.stringify(message, null, 2));
          console.log('Mesaj alanları:', Object.keys(message));
          console.log('receiverId var mı?', 'receiverId' in message);
          console.log('receiverId değeri:', message.receiverId);
        });
        
        // receiverId olan mesajları say
        const privateMessages = messages.filter(msg => msg.receiverId);
        console.log('receiverId olan mesaj sayısı:', privateMessages.length);
        
        Alert.alert(
          'Debug Sonucu',
          `Toplam mesaj: ${messages.length}\nreceiverId olan: ${privateMessages.length}\nDetaylar console'da`
        );
      } else {
        Alert.alert('Debug Sonucu', 'Hiç mesaj yok');
      }
    } catch (error) {
      console.error('Debug hatası:', error);
      Alert.alert('Debug Hatası', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user.username || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.username}>{user.username}</Text>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Çevrimiçi</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Mesajlaşma</Text>

        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => navigation.navigate('Chat', { user })}>
          <View style={styles.menuIcon}>
            <Text style={styles.menuEmoji}>💬</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Genel Sohbet</Text>
            <Text style={styles.menuDescription}>
              Tüm kullanıcılarla genel sohbet
            </Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => navigation.navigate('PrivateChats', { user })}>
          <View style={styles.menuIcon}>
            <Text style={styles.menuEmoji}>🔒</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Özel Mesajlar</Text>
            <Text style={styles.menuDescription}>
              Birebir özel konuşmalar
            </Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>✨ Duygu Analizi</Text>
          <Text style={styles.featureText}>
            Mesajlarınız AI tarafından analiz edilir ve duygu durumu
            gerçek zamanlı olarak gösterilir.
          </Text>
          <View style={styles.sentimentBadges}>
            <View style={[styles.sentimentBadge, styles.positive]}>
              <Text style={styles.sentimentText}>😊 Pozitif</Text>
            </View>
            <View style={[styles.sentimentBadge, styles.neutral]}>
              <Text style={styles.sentimentText}>😐 Nötr</Text>
            </View>
            <View style={[styles.sentimentBadge, styles.negative]}>
              <Text style={styles.sentimentText}>😔 Negatif</Text>
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.debugButton} onPress={handleDebugWebMessages}>
        <Text style={styles.debugText}>🔍 Web Mesajlarını Debug Et</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  header: {
    backgroundColor: '#2563eb',
    paddingTop: 20,
    paddingBottom: 80,
    paddingHorizontal: 20,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1e40af',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfo: {
    marginLeft: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  statusText: {
    color: '#dbeafe',
    fontSize: 14,
  },
  content: {
    marginTop: -60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 16,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuEmoji: {
    fontSize: 24,
  },
  menuContent: {
    flex: 1,
    marginLeft: 16,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  menuArrow: {
    fontSize: 32,
    color: '#cbd5e1',
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 16,
  },
  sentimentBadges: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sentimentBadge: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  positive: {
    backgroundColor: '#d1fae5',
  },
  neutral: {
    backgroundColor: '#e0e7ff',
  },
  negative: {
    backgroundColor: '#fee2e2',
  },
  sentimentText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  debugButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    alignItems: 'center',
  },
  debugText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
});