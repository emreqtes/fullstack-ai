import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { loginUser, registerUser } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEMO_USERS = [
  { username: 'admin1', password: 'admin123', label: 'Admin' },
  { username: 'alice05', password: 'alice123', label: 'Alice' },
  { username: 'bob22', password: 'bob123', label: 'Bob' },
];

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'

  const handleLogin = async (username, password) => {
    setLoading(true);
    try {
      console.log('Giriş işlemi başlatılıyor:', { username, password: password ? '***' : 'yok' });
      const userData = await loginUser(username, password);
      console.log('Giriş başarılı:', userData);
      
      await AsyncStorage.setItem('userId', userData.id.toString());
      await AsyncStorage.setItem('username', userData.username);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      navigation.replace('Home', { user: userData });
    } catch (error) {
      console.error('Login error:', error);
      
      // Hata mesajını kullanıcıya göster
      const errorMessage = error.message || 'Giriş yapılırken bir hata oluştu';
      Alert.alert(
        'Giriş Hatası', 
        errorMessage,
        [
          {
            text: 'Tamam',
            style: 'cancel'
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoUser) => {
    handleLogin(demoUser.username, demoUser.password);
  };

  const handleCustomLogin = () => {
    if (!username.trim()) {
      Alert.alert('Uyarı', 'Lütfen kullanıcı adı girin');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Uyarı', 'Lütfen şifre girin');
      return;
    }
    handleLogin(username.trim(), password.trim());
  };

  const handleRegister = async () => {
    if (!username.trim()) {
      Alert.alert('Uyarı', 'Lütfen kullanıcı adı girin');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Uyarı', 'Lütfen şifre girin');
      return;
    }
    if (password.trim().length < 6) {
      Alert.alert('Uyarı', 'Şifre en az 6 karakter olmalıdır');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Kayıt işlemi başlatılıyor:', { username: username.trim(), password: '***' });
      const userData = await registerUser(username.trim(), password.trim());
      console.log('Kayıt başarılı:', userData);
      
      await AsyncStorage.setItem('userId', userData.id.toString());
      await AsyncStorage.setItem('username', userData.username);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      Alert.alert(
        'Başarılı', 
        'Hesabınız başarıyla oluşturuldu!',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.replace('Home', { user: userData })
          }
        ]
      );
    } catch (error) {
      console.error('Register error:', error);
      
      const errorMessage = error.message || 'Kayıt olurken bir hata oluştu';
      Alert.alert(
        'Kayıt Hatası', 
        errorMessage,
        [
          {
            text: 'Tamam',
            style: 'cancel'
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>🤖</Text>
          </View>
          <Text style={styles.title}>AI Destekli Chat</Text>
          <Text style={styles.subtitle}>Giriş yap veya yeni bir hesap oluştur</Text>
        </View>

        <View style={styles.content}>
          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'login' && styles.activeTab]}
              onPress={() => setActiveTab('login')}>
              <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>
                Giriş Yap
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'register' && styles.activeTab]}
              onPress={() => setActiveTab('register')}>
              <Text style={[styles.tabText, activeTab === 'register' && styles.activeTabText]}>
                Kayıt Ol
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            <Text style={styles.label}>Kullanıcı Adı</Text>
            <TextInput
              style={styles.input}
              placeholder="Kullanıcı adınızı girin"
              placeholderTextColor="#94a3b8"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              editable={!loading}
            />

            <Text style={styles.label}>Şifre</Text>
            <TextInput
              style={styles.input}
              placeholder={activeTab === 'login' ? "Şifrenizi girin" : "Yeni şifre oluşturun (min 6 karakter)"}
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={activeTab === 'login' ? handleCustomLogin : handleRegister}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>
                  {activeTab === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
                </Text>
              )}
            </TouchableOpacity>

            <Text style={styles.demoSectionTitle}>Demo Kullanıcıları</Text>
            <View style={styles.demoUsers}>
              {DEMO_USERS.map((user) => (
                <TouchableOpacity
                  key={user.username}
                  style={styles.demoUserButton}
                  onPress={() => handleQuickLogin(user)}
                  disabled={loading}>
                  <Text style={styles.demoUserButtonText}>{user.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8b5cf6', // Purple background
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    textAlign: 'center',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#8b5cf6',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#fff',
  },
  formContainer: {
    gap: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1f2937',
  },
  loginButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  demoSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  demoUsers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  demoUserButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#8b5cf6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  demoUserButtonText: {
    color: '#8b5cf6',
    fontSize: 14,
    fontWeight: '600',
  },
});