
📱 Mobil Uygulama (React Native CLI)

Mobil uygulama, web tarafındaki fonksiyonları temel alarak React Native CLI ile geliştirilmiştir.
Aşağıdaki modüller tamamlanmıştır:

✅ Kullanıcı kaydı (rumuz ile)
✅ Giriş yapma ve kullanıcı doğrulama
✅ Genel sohbet odasında mesaj gönderme ve listeleme
✅ Duygu analizi entegrasyonu (pozitif / nötr / negatif)
✅ Backend (.NET Core) ve AI servisi (Hugging Face Spaces) ile tam entegrasyon

⚙️ Geliştirme Durumu

“Özel mesajlaşma” modülünde kullanıcılar arası birebir mesajlaşma yapısı kurulmuş olsa da bazı hata ve senkronizasyon problemleri nedeniyle bu kısım tam olarak stabilize edilememiştir.

Genel sohbet ve duygu analizi fonksiyonları ise sorunsuz ve anlık çalışmaktadır.

Özel mesaj özelliği backend tarafında hazır endpoint’lere sahiptir; mobil tarafta gerekli bağlantılar büyük ölçüde tamamlanmıştır.

Geliştirme süresi sınırlı olduğundan bu bölüm “geliştirme sonrası iyileştirme planı”na alınmıştır.

🔗 APK Dosyası

Uygulamanın Android build çıktısı aşağıdaki bağlantı üzerinden erişilebilir:
📦 Mobil APK : https://drive.google.com/drive/folders/1X1z1FNQn_H-yR1JxLbnD2LMitBh1954s?usp=drive_link

🧠 Not

Projede amaçlanan tüm uçtan uca veri akışı (React → .NET → Python AI) başarıyla tamamlanmış, mobil ve web tarafları aynı altyapıyı kullanacak şekilde tasarlanmıştır.
Eksik kalan modül, sistemin genel çalışmasına engel teşkil etmemektedir.
# Temel Özellikler (MVP)

- ✅ **React Web**: Basit chat ekranı, kullanıcı metin yazar → mesaj listesi + anlık duygu skoru
- ✅ **React Native Mobile**: Android ve iOS için mobil uygulama
- ✅ **Web-Mobil Entegrasyonu**: Web kullanıcıları ile mobil kullanıcılar arasında mesajlaşma
- ✅ **Genel Sohbet**: Tüm kullanıcıların görebileceği genel mesajlar
- ✅ **Kullanıcı Arama**: Özel mesajlar için kullanıcı arama
- ✅ **Real-time Updates**: Mesajlar otomatik güncellenir
- ✅ **AI Destekli Duygu Analizi**: Pozitif/nötr/negatif duygu skorları
![1000031449](https://github.com/user-attachments/assets/db88deef-3997-4cd1-917d-c02f69d3d732)
![1000031453](https://github.com/user-attachments/assets/b001b898-14ee-4910-84a7-071930572292)
![1000031450](https://github.com/user-attachments/assets/ccb75743-9efb-4216-b91a-eda1da7a07c7)
![1000031451](https://github.com/user-attachments/assets/d3f0e59a-378b-4515-b1ff-70c71cdf0885)


## Proje Yapısı

```
├── frontend/          # React Web Uygulaması
├── backend/           # .NET Core API
├── mobile/            # React Native Mobil Uygulaması
├── ai-service/        # Python AI Servisi (Hugging Face Spaces)
└── README.md          # Bu dosya
```

## Teknoloji Stack

- **Frontend**: React (Web)
- **Mobile**: React Native CLI (Android & iOS)
- **Backend**: .NET Core + SQLite
- **AI Servisi**: Python + Gradio API
- **Hosting**: 
  - Frontend: Vercel
  - Backend: Render (Free Web Service)
  - AI: Hugging Face Spaces

## Kurulum Adımları

### 1. Backend (.NET Core API)
```bash
cd backend/ChatAPI
dotnet restore
dotnet run
```

### 2. Frontend (React Web)
```bash
cd frontend
npm install
npm start
```

### 3. Mobile (React Native)
```bash
cd mobile
npm install
# Android için
npx react-native run-android
# iOS için
npx react-native run-ios
```

### 4. AI Servisi (Python)
```bash
cd ai-service
pip install -r requirements.txt
python app.py
```

## 📱 Mobil Uygulama Özellikleri

### Özellikler
- ✅ **Cross-Platform**: Android ve iOS desteği
- ✅ **Web-Mobil Entegrasyonu**: Web kullanıcıları ile mobil kullanıcılar arasında mesajlaşma
- ✅ **Genel Sohbet**: Tüm kullanıcıların görebileceği genel mesajlar
- ✅ **Özel Mesajlaşma**: Kullanıcıdan kullanıcıya özel mesajlaşma
- ✅ **Kullanıcı Arama**: Özel mesajlar için kullanıcı arama
- ✅ **Real-time Updates**: Mesajlar otomatik güncellenir
- ✅ **Duygu Analizi**: AI destekli duygu analizi (pozitif/nötr/negatif)
- ✅ **Modern UI**: Modern ve kullanıcı dostu arayüz

### Mobil Uygulama Yapısı
```
mobile/
├── src/
│   ├── screens/
│   │   ├── LoginScreen.js        # Giriş ve kayıt ekranı
│   │   ├── HomeScreen.js         # Ana menü ekranı
│   │   ├── ChatScreen.js         # Genel sohbet ekranı
│   │   ├── PrivateChatsScreen.js # Özel mesajlar listesi
│   │   └── PrivateChatScreen.js  # Özel mesajlaşma ekranı
│   └── services/
│       └── api.js                # API servisleri
├── android/                      # Android projesi
├── ios/                          # iOS projesi
├── package.json                  # Dependencies
└── README.md                     # Mobil uygulama dokümantasyonu
```

### APK Build
```bash
cd mobile/android
./gradlew assembleDebug
# APK dosyası: android/app/build/outputs/apk/debug/app-debug.apk
```

### API Entegrasyonu
Mobil uygulama backend API'si ile tam entegre çalışır:

- **Genel Mesajlar**: `/api/messages` endpoint'i
- **Özel Mesajlar**: `/api/privatemessages` endpoint'i
- **Kullanıcı İşlemleri**: `/api/users` ve `/api/auth` endpoint'leri
- **Duygu Analizi**: Backend üzerinden AI servisi entegrasyonu

## Test Senaryoları

### Mobil Uygulama Test
1. APK'yı telefona yükle
2. Uygulamayı aç ve giriş yap
3. Genel sohbetlerde mesaj gönder
4. Özel mesajlar bölümünden kullanıcı ara
5. Özel mesaj gönder
6. Web'den gönderilen mesajların mobilde göründüğünü kontrol et

## Sorun Giderme

### Mobil Sorunları
- Metro bundler hatası: `npx react-native start --reset-cache`
- Android build hatası: `cd android && ./gradlew clean && ./gradlew assembleDebug`
- iOS build hatası: `cd ios && pod install`
- API bağlantı hatası: Backend'in çalıştığını ve IP adresini kontrol et
- Özel mesajlar görünmüyor: Backend'de PrivateMessagesController'ın çalıştığını kontrol et

## Lisans

MIT License
