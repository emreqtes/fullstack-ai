# Chat API Backend

Bu proje, AI destekli duygu analizi chat uygulamasının backend API'sidir.

## Teknoloji Stack

- **Framework**: .NET 9.0
- **Database**: SQLite
- **ORM**: Entity Framework Core
- **API**: ASP.NET Core Web API
- **AI Integration**: HTTP Client ile Hugging Face Spaces

## Özellikler

- ✅ Kullanıcı kaydı (sadece rumuz)
- ✅ Mesaj gönderme ve kaydetme
- ✅ AI destekli duygu analizi entegrasyonu
- ✅ RESTful API endpoints
- ✅ SQLite veritabanı
- ✅ CORS desteği

## API Endpoints

### Users
- `POST /api/users` - Yeni kullanıcı oluştur
- `GET /api/users` - Tüm kullanıcıları listele
- `GET /api/users/{id}` - Belirli kullanıcıyı getir

### Messages
- `POST /api/messages` - Yeni mesaj gönder (AI analizi ile)
- `GET /api/messages` - Son 50 mesajı getir
- `GET /api/messages/{id}` - Belirli mesajı getir
- `GET /api/messages/user/{userId}` - Kullanıcının son 20 mesajını getir

## Kurulum

### Gereksinimler
- .NET 9.0 SDK
- Visual Studio Code veya Visual Studio

### Adımlar

1. **Paketleri yükle**
```bash
dotnet restore
```

2. **Veritabanını oluştur**
```bash
dotnet run
```
(İlk çalıştırmada SQLite veritabanı otomatik oluşturulur)

3. **API'yi test et**
```bash
dotnet run
```
API `https://localhost:7000` adresinde çalışacak.

## Veritabanı Yapısı

### Users Tablosu
- `Id` (Primary Key)
- `Username` (Unique, Max 50 karakter)
- `CreatedAt` (DateTime)

### Messages Tablosu
- `Id` (Primary Key)
- `Content` (Text)
- `SentAt` (DateTime)
- `UserId` (Foreign Key)
- `Sentiment` (AI analiz sonucu)
- `SentimentConfidence` (Güven skoru)
- `SentimentScores` (Detaylı skorlar JSON)

## AI Servisi Entegrasyonu

Backend, Hugging Face Spaces'te çalışan Python AI servisine HTTP istekleri gönderir:

```csharp
// AI servisi çağrısı
var sentimentResult = await _aiService.AnalyzeSentimentAsync(messageContent);
```

## Konfigürasyon

`appsettings.json` dosyasında:
- `ConnectionStrings.DefaultConnection`: SQLite veritabanı yolu
- `AIService.Url`: Hugging Face Spaces URL'i

## Deployment

### Render (Free Web Service)
1. GitHub repository'sini Render'a bağla
2. Build Command: `dotnet publish -c Release -o out`
3. Start Command: `dotnet out/ChatAPI.dll`
4. Environment Variables:
   - `ASPNETCORE_ENVIRONMENT`: Production
   - `ConnectionStrings__DefaultConnection`: SQLite dosya yolu

## Manuel Kod Yazımı

Aşağıdaki bölümler AI'ye bırakılmadan elle yazılmıştır:
- Entity Framework model konfigürasyonları
- API controller'larındaki hata yakalama
- Veritabanı sorguları
- HTTP client konfigürasyonu

## Hata Ayıklama

- Loglar `Information` seviyesinde tutulur
- AI servisi hataları yakalanır ve loglanır
- Veritabanı hataları kullanıcıya uygun mesajlarla döndürülür
