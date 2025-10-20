# Backend Düzeltme Talimatları

## Sorun
Telefondan özel mesaj atıldığında `receiverId` backend'e gönderiliyor ama backend'de işlenmiyor. Bu yüzden özel mesajlar genel sohbetler kısmına gidiyor.

## Çözüm

### 1. CreateMessageDto'yu güncelleyin

`ChatAPI.DTOs` klasöründeki `CreateMessageDto.cs` dosyasını şu şekilde güncelleyin:

```csharp
public class CreateMessageDto
{
    public string Content { get; set; }
    public int UserId { get; set; }
    public int? ReceiverId { get; set; } // Özel mesajlar için (nullable)
}
```

### 2. MessagesController'ı güncelleyin

`MessagesController.cs` dosyasındaki `CreateMessage` metodunu şu şekilde güncelleyin:

```csharp
[HttpPost]
public async Task<ActionResult<MessageDto>> CreateMessage(CreateMessageDto createMessageDto)
{
    try
    {
        // Check if user exists
        var user = await _context.Users.FindAsync(createMessageDto.UserId);
        if (user == null)
        {
            return BadRequest("Kullanıcı bulunamadı.");
        }
        
        // Create message
        var message = new Message
        {
            Content = createMessageDto.Content,
            UserId = createMessageDto.UserId,
            SentAt = DateTime.Now,
            // receiverId alanını ekleyin (Message modelinde varsa)
            ReceiverId = createMessageDto.ReceiverId
        };
        
        _context.Messages.Add(message);
        await _context.SaveChangesAsync();
        
        // Analyze sentiment using AI service
        var sentimentResult = await _aiService.AnalyzeSentimentAsync(createMessageDto.Content);
        
        if (sentimentResult != null)
        {
            message.Sentiment = sentimentResult.Sentiment;
            message.SentimentConfidence = sentimentResult.Confidence;
            message.SentimentScores = JsonSerializer.Serialize(sentimentResult.Scores);
            
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Sentiment analysis completed for message {message.Id}: {sentimentResult.Sentiment}");
        }
        else
        {
            _logger.LogWarning($"Sentiment analysis failed for message {message.Id}");
        }
        
        // Return message with sentiment data
        var messageDto = new MessageDto
        {
            Id = message.Id,
            Content = message.Content,
            SentAt = message.SentAt,
            UserId = message.UserId,
            Username = user.Username,
            ReceiverId = message.ReceiverId, // Bu alanı da ekleyin
            Sentiment = message.Sentiment,
            SentimentConfidence = message.SentimentConfidence,
            SentimentScores = message.SentimentScores
        };
        
        _logger.LogInformation($"New message created by {user.Username}: {message.Content}");
        return CreatedAtAction(nameof(GetMessage), new { id = message.Id }, messageDto);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error creating message");
        return StatusCode(500, "Sunucu hatası");
    }
}
```

### 3. Message modelini güncelleyin

`Message.cs` modeline `ReceiverId` alanını ekleyin:

```csharp
public class Message
{
    public int Id { get; set; }
    
    [Required]
    public string Content { get; set; } = string.Empty;
    
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
    
    // Foreign key
    public int UserId { get; set; }
    
    // Navigation property
    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;
    
    // Özel mesajlar için alıcı ID'si (nullable)
    public int? ReceiverId { get; set; }
    
    // AI Analysis fields
    public string? Sentiment { get; set; }
    public double? SentimentConfidence { get; set; }
    public string? SentimentScores { get; set; } // JSON string for detailed scores
}
```

### 4. MessageDto'yu güncelleyin

`MessageDto.cs` dosyasına da `ReceiverId` alanını ekleyin:

```csharp
public class MessageDto
{
    public int Id { get; set; }
    public string Content { get; set; }
    public DateTime SentAt { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; }
    public int? ReceiverId { get; set; } // Bu alanı ekleyin
    public string? Sentiment { get; set; }
    public double? SentimentConfidence { get; set; }
    public string? SentimentScores { get; set; }
}
```

### 5. Database migration oluşturun

Terminal'de şu komutları çalıştırın:

```bash
dotnet ef migrations add AddReceiverIdToMessage
dotnet ef database update
```

## Alternatif Çözüm (Backend değiştirmek istemiyorsanız)

Eğer backend'i değiştirmek istemiyorsanız, frontend'de farklı bir yaklaşım kullanabiliriz:

1. Özel mesajları farklı bir endpoint'e gönderebiliriz
2. Veya mesaj içeriğine özel bir işaret ekleyebiliriz
3. Veya farklı bir veritabanı tablosu kullanabiliriz

Hangi yaklaşımı tercih edersiniz?
