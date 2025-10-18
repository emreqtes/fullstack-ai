namespace ChatAPI.DTOs
{
    public class CreateMessageDto
    {
        public string Content { get; set; } = string.Empty;
        public int UserId { get; set; }
    }
    
    public class MessageDto
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime SentAt { get; set; }
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string? Sentiment { get; set; }
        public double? SentimentConfidence { get; set; }
        public string? SentimentScores { get; set; }
    }
    
    public class SentimentAnalysisDto
    {
        public string Sentiment { get; set; } = string.Empty;
        public double Confidence { get; set; }
        public Dictionary<string, double> Scores { get; set; } = new();
        public string Text { get; set; } = string.Empty;
    }
}
