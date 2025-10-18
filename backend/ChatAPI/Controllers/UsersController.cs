using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ChatAPI.Data;
using ChatAPI.Models;
using ChatAPI.DTOs;
using ChatAPI.Services;

namespace ChatAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly ChatDbContext _context;
        private readonly ILogger<UsersController> _logger;
        
        public UsersController(ChatDbContext context, ILogger<UsersController> logger)
        {
            _context = context;
            _logger = logger;
        }
        
        [HttpPost]
        public async Task<ActionResult<UserDto>> CreateUser(CreateUserDto createUserDto)
        {
            try
            {
                // Check if username already exists
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Username == createUserDto.Username);
                
                if (existingUser != null)
                {
                    return BadRequest("Kullanıcı adı zaten kullanılıyor.");
                }
                
                var user = new User
                {
                    Username = createUserDto.Username,
                    Password = createUserDto.Password,
                    CreatedAt = DateTime.UtcNow
                };
                
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
                
                var userDto = new UserDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    CreatedAt = user.CreatedAt
                };
                
                _logger.LogInformation($"New user created: {user.Username}");
                return CreatedAtAction(nameof(GetUser), new { id = user.Id }, userDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user");
                return StatusCode(500, "Sunucu hatası");
            }
        }
        
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> GetUser(int id)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                
                if (user == null)
                {
                    return NotFound("Kullanıcı bulunamadı.");
                }
                
                var userDto = new UserDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    CreatedAt = user.CreatedAt
                };
                
                return Ok(userDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user");
                return StatusCode(500, "Sunucu hatası");
            }
        }
        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            try
            {
                var users = await _context.Users
                    .OrderBy(u => u.Username)
                    .ToListAsync();
                
                var userDtos = new List<UserDto>();
                
                foreach (var user in users)
                {
                    // Calculate average sentiment from user's messages
                    var userMessages = await _context.Messages
                        .Where(m => m.UserId == user.Id && m.Sentiment != null)
                        .ToListAsync();
                    
                    var privateMessages = await _context.PrivateMessages
                        .Where(pm => pm.SenderId == user.Id && pm.Sentiment != null)
                        .ToListAsync();
                    
                    var allMessages = userMessages.Select(m => new { m.Sentiment, m.SentimentConfidence })
                        .Concat(privateMessages.Select(pm => new { pm.Sentiment, pm.SentimentConfidence }))
                        .ToList();
                    
                    string? avgSentiment = null;
                    double? avgConfidence = null;
                    
                    if (allMessages.Any())
                    {
                        // Calculate sentiment scores
                        var positiveCount = allMessages.Count(m => m.Sentiment == "pozitif");
                        var negativeCount = allMessages.Count(m => m.Sentiment == "negatif");
                        var neutralCount = allMessages.Count(m => m.Sentiment == "nötr");
                        
                        var total = allMessages.Count;
                        var positivePercent = (double)positiveCount / total;
                        var negativePercent = (double)negativeCount / total;
                        var neutralPercent = (double)neutralCount / total;
                        
                        // Determine dominant sentiment
                        if (positivePercent >= negativePercent && positivePercent >= neutralPercent)
                        {
                            avgSentiment = "pozitif";
                            avgConfidence = positivePercent;
                        }
                        else if (negativePercent >= neutralPercent)
                        {
                            avgSentiment = "negatif";
                            avgConfidence = negativePercent;
                        }
                        else
                        {
                            avgSentiment = "nötr";
                            avgConfidence = neutralPercent;
                        }
                    }
                    
                    userDtos.Add(new UserDto
                    {
                        Id = user.Id,
                        Username = user.Username,
                        CreatedAt = user.CreatedAt,
                        AvgSentiment = avgSentiment,
                        AvgSentimentConfidence = avgConfidence
                    });
                }
                
                return Ok(userDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting users");
                return StatusCode(500, "Sunucu hatası");
            }
        }
    }
}
