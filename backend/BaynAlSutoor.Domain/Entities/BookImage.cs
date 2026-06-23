namespace BaynAlSutoor.Domain.Entities
{
    public class BookImage
    {
        public int Id { get; set; }
        public int BookId { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }

        // Navigation
        public Book Book { get; set; } = null!;
    }
}
