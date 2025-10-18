using System.Text;
using System.Text.Json;
using ChatAPI.DTOs;

namespace ChatAPI.Services
{
    public interface IAIService
    {
        Task<SentimentAnalysisDto?> AnalyzeSentimentAsync(string text);
    }
    
    public class AIService : IAIService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<AIService> _logger;
        private readonly string _aiServiceUrl;
        
        public AIService(HttpClient httpClient, ILogger<AIService> logger, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _logger = logger;
            _aiServiceUrl = configuration["AIService:Url"] ?? "https://your-huggingface-space-url";
        }
        
        public async Task<SentimentAnalysisDto?> AnalyzeSentimentAsync(string text)
        {
            try
            {
                _logger.LogInformation($"Analyzing sentiment for text: {text}");
                
                // Mock AI response (gerçek AI servisi olmadığı için)
                await Task.Delay(500); // Simulate API call delay
                
                var mockResponse = new SentimentAnalysisDto
                {
                    Text = text,
                    Sentiment = DetermineMockSentiment(text),
                    Confidence = 0.85,
                    Scores = new Dictionary<string, double>
                    {
                        { "pozitif", DetermineMockScore(text, "pozitif") },
                        { "nötr", DetermineMockScore(text, "nötr") },
                        { "negatif", DetermineMockScore(text, "negatif") }
                    }
                };
                
                _logger.LogInformation($"Mock sentiment analysis result: {mockResponse.Sentiment}");
                return mockResponse;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in mock AI service");
                return null;
            }
        }
        
        private string DetermineMockSentiment(string text)
        {
            var lowerText = text.ToLower();
            
            if (lowerText.Contains("harika") || lowerText.Contains("mutlu") || 
                lowerText.Contains("güzel") || lowerText.Contains("iyi") ||
                lowerText.Contains("mükemmel") || lowerText.Contains("süper"))
            {
                return "pozitif";
            }
            
            if (lowerText.Contains("kötü") || lowerText.Contains("üzgün") || 
                lowerText.Contains("memnun değil") || lowerText.Contains("istemiyorum") ||
                lowerText.Contains("berbat") || lowerText.Contains("kızgın"))
            {
                return "negatif";
            }
            
            return "nötr";
        }
        
        private double DetermineMockScore(string text, string sentiment)
        {
            var lowerText = text.ToLower();
            var determinedSentiment = DetermineMockSentiment(text);
            
            if (sentiment == determinedSentiment)
            {
                return 0.85;
            }
            
            return 0.05;
        }
    }
}
