using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ChatAPI.Data;
using ChatAPI.Models;
using ChatAPI.DTOs;
using ChatAPI.Services;
using System.Text.Json;

namespace ChatAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MessagesController : ControllerBase
    {
        private readonly ChatDbContext _context;
        private readonly IAIService _aiService;
        private readonly ILogger<MessagesController> _logger;
        
        public MessagesController(ChatDbContext context, IAIService aiService, ILogger<MessagesController> logger)
        {
            _context = context;
            _aiService = aiService;
            _logger = logger;
        }
        
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
                    SentAt = DateTime.Now
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
        
        [HttpGet("{id}")]
        public async Task<ActionResult<MessageDto>> GetMessage(int id)
        {
            try
            {
                var message = await _context.Messages
                    .Include(m => m.User)
                    .FirstOrDefaultAsync(m => m.Id == id);
                
                if (message == null)
                {
                    return NotFound("Mesaj bulunamadı.");
                }
                
                var messageDto = new MessageDto
                {
                    Id = message.Id,
                    Content = message.Content,
                    SentAt = message.SentAt,
                    UserId = message.UserId,
                    Username = message.User.Username,
                    Sentiment = message.Sentiment,
                    SentimentConfidence = message.SentimentConfidence,
                    SentimentScores = message.SentimentScores
                };
                
                return Ok(messageDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting message");
                return StatusCode(500, "Sunucu hatası");
            }
        }
        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessages()
        {
            try
            {
                var messages = await _context.Messages
                    .Include(m => m.User)
                    .OrderByDescending(m => m.SentAt)
                    .Take(50) // Son 50 mesajı getir
                    .Select(m => new MessageDto
                    {
                        Id = m.Id,
                        Content = m.Content,
                        SentAt = m.SentAt,
                        UserId = m.UserId,
                        Username = m.User.Username,
                        Sentiment = m.Sentiment,
                        SentimentConfidence = m.SentimentConfidence,
                        SentimentScores = m.SentimentScores
                    })
                    .ToListAsync();
                
                return Ok(messages);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting messages");
                return StatusCode(500, "Sunucu hatası");
            }
        }
        
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessagesByUser(int userId)
        {
            try
            {
                var messages = await _context.Messages
                    .Include(m => m.User)
                    .Where(m => m.UserId == userId)
                    .OrderByDescending(m => m.SentAt)
                    .Take(20) // Son 20 mesajı getir
                    .Select(m => new MessageDto
                    {
                        Id = m.Id,
                        Content = m.Content,
                        SentAt = m.SentAt,
                        UserId = m.UserId,
                        Username = m.User.Username,
                        Sentiment = m.Sentiment,
                        SentimentConfidence = m.SentimentConfidence,
                        SentimentScores = m.SentimentScores
                    })
                    .ToListAsync();
                
                return Ok(messages);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting messages by user");
                return StatusCode(500, "Sunucu hatası");
            }
        }
    }
}
