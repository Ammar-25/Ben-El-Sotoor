namespace BaynAlSutoor.Domain.Entities
{
    public class UserReadingProgress
    {
        public int UserId { get; set; }
        public int BookId { get; set; }
        public int ProgressPercentage { get; set; } // 0 to 100

        // Navigation properties
        public User User { get; set; } = null!;
        public Book Book { get; set; } = null!;
    }
}
