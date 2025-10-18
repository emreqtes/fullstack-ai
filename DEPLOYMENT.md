# Deployment Talimatları

Bu dosya, projenin ücretsiz platformlarda deploy edilmesi için gerekli adımları içerir.

## 🚀 Frontend Deployment (Vercel)

### Adım 1: Vercel Hesabı Oluştur
1. https://vercel.com adresine git
2. GitHub hesabınla giriş yap
3. "New Project" butonuna tıkla

### Adım 2: Repository Bağla
1. GitHub repository'sini seç
2. Root Directory: `frontend` olarak ayarla
3. Build Command: `npm run build`
4. Output Directory: `build`

### Adım 3: Environment Variables
```
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
```

### Adım 4: Deploy
1. "Deploy" butonuna tıkla
2. Deploy tamamlandığında URL'i al

## 🔧 Backend Deployment (Render)

### Adım 1: Render Hesabı Oluştur
1. https://render.com adresine git
2. GitHub hesabınla giriş yap
3. "New +" butonuna tıkla
4. "Web Service" seç

### Adım 2: Repository Bağla
1. GitHub repository'sini seç
2. Root Directory: `backend/ChatAPI`
3. Build Command: `dotnet publish -c Release -o out`
4. Start Command: `dotnet out/ChatAPI.dll`

### Adım 3: Environment Variables
```
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=Data Source=chat.db
AIService__Url=https://your-huggingface-space-url
```

### Adım 4: Deploy
1. "Create Web Service" butonuna tıkla
2. Deploy tamamlandığında URL'i al

## 🤖 AI Servisi Deployment (Hugging Face Spaces)

### Adım 1: Hugging Face Hesabı Oluştur
1. https://huggingface.co adresine git
2. Hesap oluştur
3. "New Space" butonuna tıkla

### Adım 2: Space Oluştur
1. Space name: `sentiment-analysis-chat`
2. SDK: `Gradio` seç
3. Visibility: `Public` seç
4. "Create Space" butonuna tıkla

### Adım 3: Dosyaları Yükle
1. `ai-service/app.py` dosyasını yükle
2. `ai-service/requirements.txt` dosyasını yükle
3. Commit message: "Initial AI service deployment"

### Adım 4: Deploy
1. Dosyalar otomatik olarak deploy edilir
2. Space URL'ini al: `https://huggingface.co/spaces/username/sentiment-analysis-chat`

## 🔗 URL'leri Güncelle

### Backend'te AI URL'ini Güncelle
```json
// backend/ChatAPI/appsettings.json
{
  "AIService": {
    "Url": "https://huggingface.co/spaces/username/sentiment-analysis-chat"
  }
}
```

### Frontend'te Backend URL'ini Güncelle
```json
// frontend/vercel.json
{
  "env": {
    "REACT_APP_API_URL": "https://your-backend-url.onrender.com/api"
  }
}
```

## ✅ Test Et

### 1. AI Servisi Test
```bash
curl -X POST https://huggingface.co/spaces/username/sentiment-analysis-chat/api/predict \
  -H "Content-Type: application/json" \
  -d '{"data": ["Bu harika bir gün!"]}'
```

### 2. Backend Test
```bash
curl -X POST https://your-backend-url.onrender.com/api/users \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser"}'
```

### 3. Frontend Test
1. Vercel URL'ine git
2. Kullanıcı adı gir
3. Mesaj gönder
4. Duygu analizi sonucunu kontrol et

## 🐛 Sorun Giderme

### Vercel Sorunları
- **Build Error**: `npm install` ve `npm run build` test et
- **Environment Variables**: Vercel dashboard'da kontrol et
- **CORS Error**: Backend CORS ayarlarını kontrol et

### Render Sorunları
- **Build Error**: `.NET 9.0` runtime'ın desteklendiğini kontrol et
- **Database Error**: SQLite dosya yolu ayarlarını kontrol et
- **AI Service Error**: AI servisi URL'ini kontrol et

### Hugging Face Spaces Sorunları
- **Model Error**: Model'in yüklendiğini kontrol et
- **Memory Error**: Gradio memory limit'ini kontrol et
- **API Error**: Endpoint URL'ini kontrol et

## 📊 Monitoring

### Vercel Analytics
- Vercel dashboard'da traffic ve performance metrikleri
- Error logs ve build logs

### Render Monitoring
- Render dashboard'da CPU ve memory kullanımı
- Application logs ve error tracking

### Hugging Face Spaces
- Space usage ve API calls
- Model performance metrics

## 🔄 Güncelleme

### Frontend Güncelleme
1. GitHub'a push yap
2. Vercel otomatik olarak yeniden deploy eder

### Backend Güncelleme
1. GitHub'a push yap
2. Render otomatik olarak yeniden deploy eder

### AI Servisi Güncelleme
1. Hugging Face Spaces'te dosyaları güncelle
2. Commit yap
3. Otomatik olarak yeniden deploy eder

## 💰 Maliyet

- **Vercel**: Ücretsiz (100GB bandwidth/month)
- **Render**: Ücretsiz (750 saat/month)
- **Hugging Face Spaces**: Ücretsiz (CPU)

## 📈 Performans Optimizasyonu

### Frontend
- Code splitting
- Image optimization
- CDN kullanımı

### Backend
- Connection pooling
- Caching
- Database indexing

### AI Servisi
- Model optimization
- Batch processing
- Caching
