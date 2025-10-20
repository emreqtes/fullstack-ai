# AI Destekli Duygu Analizi Chat Uygulaması

Bu proje, kullanıcıların mesajlaşarak sohbet edebildiği ve yazışmaların AI tarafından duygu analizi yapılarak canlı olarak gösterildiği bir web + mobil uygulamadır.

## 🎯 Proje Özeti

Kullanıcıların mesajlaşarak sohbet edebildiği, yazışmaların AI tarafından duygu analizi yapılarak canlı olarak gösterildiği basit bir web + mobil uygulama. Backend, frontend ve AI servisinin tamamı ücretsiz platformlarda deploy edilmiştir.
<img width="1901" height="987" alt="Ekran görüntüsü 2025-10-19 210401" src="https://github.com/user-attachments/assets/fddf9ac0-e99a-411e-bfe7-cf5aacbcd1f8" />
<img width="1897" height="980" alt="Ekran görüntüsü 2025-10-19 210417" src="https://github.com/user-attachments/assets/59d3db01-e53c-42a4-ab27-92a6d82f034d" />
<img width="1915" height="986" alt="Ekran görüntüsü 2025-10-19 210429" src="https://github.com/user-attachments/assets/f4736fab-affb-415a-ae59-fb0878084347" />



## 🔐 Demo Kullanıcıları

Sistemde önceden oluşturulmuş demo kullanıcıları:

| Kullanıcı Adı | Şifre | Açıklama |
|---------------|-------|----------|
| `admin1` | `1234` | Yönetici kullanıcısı |
| `alice05` | `1234` | Alice kullanıcısı |
| `bob22` | `1234` | Bob kullanıcısı |

**Not**: Demo kullanıcılarının şifresi `1234` olarak ayarlanmıştır. Uygulamada bu kullanıcılar tek tıkla giriş yapabilirsiniz.

## 🌐 Canlı Demo Linkleri

- **Web Chat**: https://fullstack-ai-beta.vercel.app/
- **AI Servisi**: https://huggingface.co/spaces/emreqtes/turkish-sentiment-analysis
- **Backend API**: https://fullstack-ai-klct.onrender.com
- **GitHub Repository**: [https://github.com/emreqtes/fullstack-ai](https://github.com/emreqtes/fullstack-ai)

## 🚀 Temel Özellikler (MVP)

- ✅ **React Web**: Basit chat ekranı, kullanıcı metin yazar → mesaj listesi + anlık duygu skoru
- ✅ **Kullanıcılar Arası Sohbet**: Birden fazla kullanıcı aynı anda sohbet edebilir
- ✅ **WhatsApp Tarzı Özel Mesajlaşma**: Kullanıcıdan kullanıcıya özel mesajlaşma
- ✅ **Alıcı Seçme**: Kullanıcılar arasından alıcı seçerek mesaj gönderme
- ✅ **Real-time Updates**: Mesajlar 3 saniyede bir otomatik güncellenir
- ✅ **Konuşma Listesi**: Özel mesajlaşma geçmişi ve okunmamış mesaj sayısı
- ✅ **React Native CLI**: Mobilde aynı chat ekranı (React Native CLI ile geliştirme)
- ✅ **.NET Core API**: Kullanıcı kaydı (sadece rumuz) ve mesajların veritabanına kaydı
- ✅ **Python AI Servisi**: Hugging Face Spaces'de çalışan duygu analizi (pozitif/nötr/negatif)
- ✅ **Gerçek Zamanlı**: Mesaj gönderildiğinde backend Python servisine istek atar, analiz sonucu frontend'de görünür

## Proje Yapısı

```
├── frontend/          # React Web Uygulaması
├── backend/           # .NET Core API
├── ai-service/        # Python AI Servisi (Hugging Face Spaces)
└── README.md          # Bu dosya
```

## Teknoloji Stack

- **Frontend**: React (Web) / React Native CLI (Mobil)
- **Backend**: .NET Core + SQLite
- **AI Servisi**: Python + Gradio API
- **Hosting**: 
  - Frontend: Vercel
  - Backend: Render (Free Web Service)
  - AI: Hugging Face Spaces

## Temel Özellikler (MVP)

- ✅ Basit chat ekranı
- ✅ Kullanıcı metin yazma ve mesaj listesi
- ✅ Anlık duygu skoru (pozitif/nötr/negatif)
- ✅ Gerçek zamanlı mesajlaşma
- ✅ AI destekli duygu analizi

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
**Giriş yapmak için**: Yukarıdaki demo kullanıcılarından birini kullanın veya yeni hesap oluşturun

### 3. AI Servisi (Python)
```bash
cd ai-service
pip install -r requirements.txt
python app.py
```



### Frontend Dosyaları
- ✅ package.json (dependencies)
- ✅ src/App.js (ana chat bileşeni)
- ✅ src/App.css (modern CSS stilleri)
- ✅ public/index.html (HTML template)
- ✅ vercel.json (deployment config)
- ✅ test.html (test sayfası)

## Eksik Özellikler Tamamlandı ✅

### Test Sayfası
- **Dosya**: `frontend/test.html`
- **Özellikler**: Backend bağlantı testi, kullanıcı oluşturma, mesaj gönderme, AI analizi testi
- **Durum**: ✅ Çalışıyor

### Swagger UI
- **URL**: `http://localhost:5000/swagger`
- **Durum**: ✅ API dokümantasyonu aktif

### AI Servisi
- **Dosya**: `ai-service/app.py`
- **Durum**: ✅ Gradio arayüzü çalışıyor

### Error Handling
- **Test Sonuçları**: ✅ Duplicate kullanıcı, var olmayan kullanıcı kontrolü
- **Durum**: ✅ Çalışıyor

### Veritabanı
- **Seed Data**: ✅ Program.cs'e entegre edildi
- **Durum**: ✅ SQLite veritabanı hazır

## Geliştirme Planı

### 1. Gün ✅
- [x] GitHub repository oluştur
- [x] Hugging Face'te duygu analizi modeli API'si hazırla
- [x] .NET backend ile mesaj kayıt API'si kur
- [x] SQLite veritabanı kurulumu ve kullanıcı/mesaj tabloları

### 2. Gün ✅
- [x] React web chat ekranını tamamla
- [x] Backend + AI entegrasyonunu sağla
- [x] Vercel deploy'u yap
- [x] Tüm servislerin test edilmesi
- [x] API endpoint'lerinin çalışır durumda olması

### 3. Gün 🔄
- [ ] React Native CLI mobil ekranını geliştir
- [ ] API ve AI servislerini entegre et
- [ ] README dokümantasyonu ve kod açıklamalarını ekle



### Frontend (Vercel)
1. GitHub repository'sini Vercel'e bağla
2. Build Command: `npm run build`
3. Output Directory: `build`
4. Environment Variables:
   - `REACT_APP_API_URL`: Backend API URL'i

### Backend (Render)
1. GitHub repository'sini Render'a bağla
2. Build Command: `dotnet publish -c Release -o out`
3. Start Command: `dotnet out/ChatAPI.dll`
4. Environment Variables:
   - `ASPNETCORE_ENVIRONMENT`: Production
   - `ConnectionStrings__DefaultConnection`: SQLite dosya yolu

### AI Servisi (Hugging Face Spaces)
1. https://huggingface.co/new-space adresine git
2. Space adı: `sentiment-analysis-chat`
3. SDK: Gradio seç
4. `app.py` ve `requirements.txt` dosyalarını yükle
5. Deploy et ve URL'i al

## 🤖 AI Araçları Kullanımı

Bu projede AI araçları şu alanlarda kullanılmıştır:

### Hugging Face Spaces
- **Model**: `cardiffnlp/twitter-roberta-base-sentiment-latest`
- **Kullanım**: Duygu analizi (pozitif/nötr/negatif)
- **Teknoloji**: Python + Gradio API
- **Dil Desteği**: Türkçe ve İngilizce

### AI Destekli Kod Geliştirme
- **Kod Optimizasyonu**: AI ile kod iyileştirme
- **Hata Düzeltme**: AI ile bug fixing
- **API Tasarımı**: AI ile endpoint tasarımı
- **Dokümantasyon**: AI ile README yazımı

### Manuel Kod Yazımı (AI Dışı)
Aşağıdaki bölümler AI'ye bırakılmadan elle yazılmıştır:
- **Backend API Controller'ları**: UsersController.cs, MessagesController.cs
- **Mock AI Servisi**: Türkçe kelime bazlı sentiment analizi

## 📁 Dosya Yapısı ve İşlevleri

### Frontend (React Web)
```
frontend/
├── src/
│   ├── App.js          # Ana chat bileşeni, state yönetimi, API çağrıları
│   ├── App.css         # Modern CSS stilleri, responsive tasarım, animasyonlar
│   ├── index.js        # React entry point, DOM rendering
│   └── index.css       # Global CSS stilleri, font ayarları
├── public/
│   ├── index.html      # HTML template, meta tags
│   └── favicon.ico     # Site ikonu
├── package.json        # Dependencies, scripts, build konfigürasyonu
├── vercel.json         # Vercel deployment konfigürasyonu
└── test.html          # Frontend test sayfası, API testleri
```

### Backend (.NET Core API)
```
backend/ChatAPI/
├── Controllers/
│   ├── UsersController.cs    # Kullanıcı CRUD işlemleri, validation
│   └── MessagesController.cs  # Mesaj CRUD, AI servisi entegrasyonu
├── Models/
│   ├── User.cs               # Kullanıcı entity, validation attributes
│   └── Message.cs            # Mesaj entity, AI analiz alanları
├── DTOs/
│   ├── UserDto.cs            # Kullanıcı data transfer objects
│   └── MessageDto.cs         # Mesaj DTOs, AI analiz sonuçları
├── Data/
│   └── ChatDbContext.cs     # Entity Framework context, veritabanı konfigürasyonu
├── Services/
│   └── AIService.cs          # AI servisi entegrasyonu, mock sentiment analizi
├── Program.cs                # Uygulama konfigürasyonu, dependency injection
├── appsettings.json          # Konfigürasyon ayarları, connection strings
└── ChatAPI.csproj           # Proje dosyası, dependencies
```

### AI Servisi (Python)
```
ai-service/
├── app.py                    # Gradio web arayüzü, Hugging Face model entegrasyonu
├── requirements.txt          # Python dependencies
├── test_ai_service.py        # AI servisi test scripti
└── README.md                 # AI servisi dokümantasyonu
```
- CSS animasyonları ve responsive tasarım
- Mock AI servisi implementasyonu

## Test Senaryoları

### Backend Test
```bash
# Kullanıcı oluştur
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser"}'

# Mesaj gönder
curl -X POST http://localhost:5000/api/messages \
  -H "Content-Type: application/json" \
  -d '{"content": "Bu harika bir gün!", "userId": 1}'
```

### Frontend Test
1. http://localhost:3000 adresine git
2. Kullanıcı adı gir ve "Katıl" butonuna bas
3. Mesaj yaz ve "Gönder" butonuna bas
4. Duygu analizi sonucunu kontrol et

## Sorun Giderme

### Backend Sorunları
- Port çakışması: `dotnet run --urls "http://localhost:5001"`
- Veritabanı hatası: `rm chat.db` ve tekrar çalıştır
- AI servisi hatası: Mock servisi kullanılır

### Frontend Sorunları
- CORS hatası: Backend'te CORS ayarları kontrol et
- API bağlantı hatası: Backend'in çalıştığını kontrol et
- Build hatası: `npm install` ve `npm run build`

## Lisans

MIT License
