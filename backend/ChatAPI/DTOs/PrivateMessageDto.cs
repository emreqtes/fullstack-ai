using ChatAPI.Models;

namespace ChatAPI.DTOs
{
    public class PrivateMessageDto
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime SentAt { get; set; }
        public int SenderId { get; set; }
        public string SenderUsername { get; set; } = string.Empty;
        public int ReceiverId { get; set; }
        public string ReceiverUsername { get; set; } = string.Empty;
        public MessageStatus Status { get; set; }
        public DateTime? ReadAt { get; set; }
        public string? Sentiment { get; set; }
        public double? SentimentConfidence { get; set; }
        public string? SentimentScores { get; set; }
    }

    public class CreatePrivateMessageDto
    {
        public string Content { get; set; } = string.Empty;
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
    }

    public class UpdateMessageStatusDto
    {
        public int MessageId { get; set; }
        public MessageStatus Status { get; set; }
    }

    public class ConversationDto
    {
        public int OtherUserId { get; set; }
        public string OtherUsername { get; set; } = string.Empty;
        public List<PrivateMessageDto> Messages { get; set; } = new List<PrivateMessageDto>();
        public int UnreadCount { get; set; }
        public DateTime? LastMessageAt { get; set; }
        public string? LastMessageContent { get; set; }
    }
}
