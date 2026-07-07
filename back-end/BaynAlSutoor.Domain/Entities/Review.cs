using BaynAlSutoor.Domain.Common;
using System;

namespace BaynAlSutoor.Domain.Entities
{
    public class Review : ISoftDelete
    {
        public int Id { get; set; }
        public int BookId { get; set; }
        public int UserId { get; set; }
        public int Rating { get; set; }
        public string TextAr { get; set; } = string.Empty;
        public string TextEn { get; set; } = string.Empty;
        public DateTime Date { get; set; }

        // Soft Delete
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        public int? DeletedBy { get; set; }

        // Navigation properties
        public Book Book { get; set; } = null!;
        public User User { get; set; } = null!;
    }
}
