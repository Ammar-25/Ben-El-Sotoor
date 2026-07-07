using BaynAlSutoor.Domain.Common;
using System;
using System.Collections.Generic;

namespace BaynAlSutoor.Domain.Entities
{
    public class Author : ISoftDelete
    {
        public int Id { get; set; }
        public string NameAr { get; set; } = string.Empty;
        public string NameEn { get; set; } = string.Empty;
        public string Photo { get; set; } = string.Empty;
        public string Banner { get; set; } = string.Empty;
        public string BioAr { get; set; } = string.Empty;
        public string BioEn { get; set; } = string.Empty;
        public int Followers { get; set; }
        public decimal Rating { get; set; }
        public string AchievementsJson { get; set; } = string.Empty; // Stores list of achievements serialized as JSON array
        public string QuoteAr { get; set; } = string.Empty;
        public string QuoteEn { get; set; } = string.Empty;

        // Soft Delete
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        public int? DeletedBy { get; set; }

        // Navigation properties
        public ICollection<Book> Books { get; set; } = new List<Book>();
    }
}
