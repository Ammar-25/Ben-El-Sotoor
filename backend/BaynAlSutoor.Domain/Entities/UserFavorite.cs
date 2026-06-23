namespace BaynAlSutoor.Domain.Entities
{
    public class UserFavorite
    {
        public int UserId { get; set; }
        public int BookId { get; set; }

        // Navigation properties
        public User User { get; set; } = null!;
        public Book Book { get; set; } = null!;
    }
}
