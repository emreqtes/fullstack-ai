using Microsoft.EntityFrameworkCore;
using ChatAPI.Models;

namespace ChatAPI.Data
{
    public class ChatDbContext : DbContext
    {
        public ChatDbContext(DbContextOptions<ChatDbContext> options) : base(options)
        {
        }
        
            public DbSet<User> Users { get; set; }
            public DbSet<Message> Messages { get; set; }
            public DbSet<PrivateMessage> PrivateMessages { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("datetime('now')");
                
                // Unique username constraint
                entity.HasIndex(e => e.Username).IsUnique();
            });
            
            // Message configuration
            modelBuilder.Entity<Message>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Content).IsRequired();
                entity.Property(e => e.SentAt).HasDefaultValueSql("datetime('now')");
                
                // Foreign key relationship
                entity.HasOne(e => e.User)
                      .WithMany(e => e.Messages)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // PrivateMessage configuration
            modelBuilder.Entity<PrivateMessage>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Content).IsRequired();
                entity.Property(e => e.SentAt).HasDefaultValueSql("datetime('now')");
                
                // Foreign key relationships
                entity.HasOne(e => e.Sender)
                      .WithMany()
                      .HasForeignKey(e => e.SenderId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Receiver)
                      .WithMany()
                      .HasForeignKey(e => e.ReceiverId)
                      .OnDelete(DeleteBehavior.Cascade);

                // Index for efficient querying
                entity.HasIndex(e => new { e.SenderId, e.ReceiverId });
                entity.HasIndex(e => new { e.ReceiverId, e.SenderId });
            });
        }
    }
}
