using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChatAPI.Models
{
    public class PrivateMessage
    {
        public int Id { get; set; }
        [Required]
        public string Content { get; set; } = string.Empty;
        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        // Gönderen kullanıcı
        public int SenderId { get; set; }
        [ForeignKey("SenderId")]
        public virtual User Sender { get; set; } = null!;

        // Alıcı kullanıcı
        public int ReceiverId { get; set; }
        [ForeignKey("ReceiverId")]
        public virtual User Receiver { get; set; } = null!;

        // Mesaj durumu (WhatsApp tarzı)
        public MessageStatus Status { get; set; } = MessageStatus.Sent;
        public DateTime? ReadAt { get; set; }

        // AI Analysis fields
        public string? Sentiment { get; set; } // e.g., "pozitif", "nötr", "negatif"
        public double? SentimentConfidence { get; set; } // Confidence score (0-1)
        public string? SentimentScores { get; set; } // JSON string of all sentiment scores
    }

    public enum MessageStatus
    {
        Sent = 0,      // Gönderildi (tek tik)
        Delivered = 1, // Ulaştı (çift tik)
        Read = 2       // Okundu (mavi çift tik)
    }
}
