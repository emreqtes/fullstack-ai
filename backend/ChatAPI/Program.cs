using Microsoft.EntityFrameworkCore;
using ChatAPI.Data;
using ChatAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add Entity Framework
builder.Services.AddDbContext<ChatDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add HTTP Client for AI Service
builder.Services.AddHttpClient<IAIService, AIService>();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

// Ensure database is created and seeded
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ChatDbContext>();
    context.Database.EnsureCreated();
    
    // Seed data if empty - Şifre ile
    if (!context.Users.Any())
    {
        // Helper method to hash password
        string HashPassword(string password)
        {
            using (var sha256 = System.Security.Cryptography.SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }
        }

        var users = new List<ChatAPI.Models.User>
        {
            new ChatAPI.Models.User { Username = "admin1", Password = HashPassword("1234"), CreatedAt = DateTime.UtcNow },
            new ChatAPI.Models.User { Username = "alice05", Password = HashPassword("1234"), CreatedAt = DateTime.UtcNow },
            new ChatAPI.Models.User { Username = "bob22", Password = HashPassword("1234"), CreatedAt = DateTime.UtcNow }
        };
        
        context.Users.AddRange(users);
        await context.SaveChangesAsync();
        
        var messages = new List<ChatAPI.Models.Message>
        {
            new ChatAPI.Models.Message 
            { 
                Content = "Merhaba! Bu harika bir chat uygulaması!", 
                UserId = users[0].Id, 
                SentAt = DateTime.Now.AddMinutes(-30),
                Sentiment = "pozitif",
                SentimentConfidence = 0.85,
                SentimentScores = "{\"pozitif\":0.85,\"nötr\":0.10,\"negatif\":0.05}"
            },
            new ChatAPI.Models.Message 
            { 
                Content = "AI duygu analizi gerçekten çalışıyor mu?", 
                UserId = users[1].Id, 
                SentAt = DateTime.Now.AddMinutes(-25),
                Sentiment = "nötr",
                SentimentConfidence = 0.75,
                SentimentScores = "{\"pozitif\":0.15,\"nötr\":0.75,\"negatif\":0.10}"
            },
            new ChatAPI.Models.Message 
            { 
                Content = "Evet, çok etkileyici! Bu proje mükemmel.", 
                UserId = users[2].Id, 
                SentAt = DateTime.Now.AddMinutes(-20),
                Sentiment = "pozitif",
                SentimentConfidence = 0.90,
                SentimentScores = "{\"pozitif\":0.90,\"nötr\":0.05,\"negatif\":0.05}"
            }
        };
        
        context.Messages.AddRange(messages);
        await context.SaveChangesAsync();
    }
}

app.Run();
