using ChatAPI.Data;
using ChatAPI.DTOs;
using ChatAPI.Models;
using ChatAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace ChatAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PrivateMessagesController : ControllerBase
    {
        private readonly ChatDbContext _context;
        private readonly IAIService _aiService;
        private readonly ILogger<PrivateMessagesController> _logger;

        public PrivateMessagesController(ChatDbContext context, IAIService aiService, ILogger<PrivateMessagesController> logger)
        {
            _context = context;
            _aiService = aiService;
            _logger = logger;
        }

        // GET: api/PrivateMessages/conversations/{userId}
        [HttpGet("conversations/{userId}")]
        public async Task<ActionResult<IEnumerable<ConversationDto>>> GetConversations(int userId)
        {
            _logger.LogInformation($"Getting conversations for user {userId}");

            var conversations = await _context.PrivateMessages
                .Where(pm => pm.SenderId == userId || pm.ReceiverId == userId)
                .GroupBy(pm => pm.SenderId == userId ? pm.ReceiverId : pm.SenderId)
                .Select(g => new ConversationDto
                {
                    OtherUserId = g.Key,
                    OtherUsername = g.First().SenderId == userId ? 
                        g.First().Receiver.Username : 
                        g.First().Sender.Username,
                    LastMessageAt = g.Max(pm => pm.SentAt),
                    LastMessageContent = g.OrderByDescending(pm => pm.SentAt).First().Content,
                    UnreadCount = g.Count(pm => pm.ReceiverId == userId && pm.Status != MessageStatus.Read)
                })
                .OrderByDescending(c => c.LastMessageAt)
                .ToListAsync();

            return Ok(conversations);
        }

        // GET: api/PrivateMessages/{userId1}/{userId2}
        [HttpGet("{userId1}/{userId2}")]
        public async Task<ActionResult<IEnumerable<PrivateMessageDto>>> GetConversation(int userId1, int userId2)
        {
            _logger.LogInformation($"Getting conversation between users {userId1} and {userId2}");

            var messages = await _context.PrivateMessages
                .Where(pm => (pm.SenderId == userId1 && pm.ReceiverId == userId2) ||
                            (pm.SenderId == userId2 && pm.ReceiverId == userId1))
                .Include(pm => pm.Sender)
                .Include(pm => pm.Receiver)
                .OrderBy(pm => pm.SentAt)
                .Select(pm => new PrivateMessageDto
                {
                    Id = pm.Id,
                    Content = pm.Content,
                    SentAt = pm.SentAt,
                    SenderId = pm.SenderId,
                    SenderUsername = pm.Sender.Username,
                    ReceiverId = pm.ReceiverId,
                    ReceiverUsername = pm.Receiver.Username,
                    Status = pm.Status,
                    ReadAt = pm.ReadAt,
                    Sentiment = pm.Sentiment,
                    SentimentConfidence = pm.SentimentConfidence,
                    SentimentScores = pm.SentimentScores
                })
                .ToListAsync();

            return Ok(messages);
        }

        // POST: api/PrivateMessages
        [HttpPost]
        public async Task<ActionResult<PrivateMessageDto>> SendPrivateMessage(CreatePrivateMessageDto createMessageDto)
        {
            _logger.LogInformation($"Sending private message from user {createMessageDto.SenderId} to user {createMessageDto.ReceiverId}");

            // Check if both users exist
            var senderExists = await _context.Users.AnyAsync(u => u.Id == createMessageDto.SenderId);
            var receiverExists = await _context.Users.AnyAsync(u => u.Id == createMessageDto.ReceiverId);

            if (!senderExists || !receiverExists)
            {
                _logger.LogWarning($"User not found: Sender={senderExists}, Receiver={receiverExists}");
                return BadRequest("Kullanıcı bulunamadı.");
            }

            var message = new PrivateMessage
            {
                Content = createMessageDto.Content,
                SenderId = createMessageDto.SenderId,
                ReceiverId = createMessageDto.ReceiverId,
                SentAt = DateTime.Now,
                Status = MessageStatus.Sent
            };

            _context.PrivateMessages.Add(message);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Private message created with ID: {message.Id}. Analyzing sentiment...");

            // Analyze sentiment using AI service
            var sentimentResult = await _aiService.AnalyzeSentimentAsync(createMessageDto.Content);

            if (sentimentResult != null)
            {
                message.Sentiment = sentimentResult.Sentiment;
                message.SentimentConfidence = sentimentResult.Confidence;
                message.SentimentScores = JsonSerializer.Serialize(sentimentResult.Scores);
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Sentiment analyzed for private message {message.Id}: {message.Sentiment}");
            }

            // Retrieve the users to include usernames in the DTO response
            var sender = await _context.Users.FindAsync(message.SenderId);
            var receiver = await _context.Users.FindAsync(message.ReceiverId);

            return CreatedAtAction(nameof(GetConversation), new { userId1 = message.SenderId, userId2 = message.ReceiverId }, new PrivateMessageDto
            {
                Id = message.Id,
                Content = message.Content,
                SentAt = message.SentAt,
                SenderId = message.SenderId,
                SenderUsername = sender?.Username ?? "Bilinmeyen Kullanıcı",
                ReceiverId = message.ReceiverId,
                ReceiverUsername = receiver?.Username ?? "Bilinmeyen Kullanıcı",
                Status = message.Status,
                ReadAt = message.ReadAt,
                Sentiment = message.Sentiment,
                SentimentConfidence = message.SentimentConfidence,
                SentimentScores = message.SentimentScores
            });
        }

        // PUT: api/PrivateMessages/{messageId}/status
        [HttpPut("{messageId}/status")]
        public async Task<IActionResult> UpdateMessageStatus(int messageId, UpdateMessageStatusDto updateDto)
        {
            _logger.LogInformation($"Updating message {messageId} status to {updateDto.Status}");

            var message = await _context.PrivateMessages.FindAsync(messageId);
            if (message == null)
            {
                _logger.LogWarning($"Private message {messageId} not found");
                return NotFound();
            }

            message.Status = updateDto.Status;
            if (updateDto.Status == MessageStatus.Read)
            {
                message.ReadAt = DateTime.Now;
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation($"Message {messageId} status updated to {updateDto.Status}");

            return NoContent();
        }

        // PUT: api/PrivateMessages/conversation/{userId1}/{userId2}/read
        [HttpPut("conversation/{userId1}/{userId2}/read")]
        public async Task<IActionResult> MarkConversationAsRead(int userId1, int userId2)
        {
            _logger.LogInformation($"Marking conversation between users {userId1} and {userId2} as read");

            var messages = await _context.PrivateMessages
                .Where(pm => pm.SenderId == userId2 && pm.ReceiverId == userId1 && pm.Status != MessageStatus.Read)
                .ToListAsync();

            foreach (var message in messages)
            {
                message.Status = MessageStatus.Read;
                message.ReadAt = DateTime.Now;
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation($"Marked {messages.Count} messages as read");

            return NoContent();
        }
    }
}
