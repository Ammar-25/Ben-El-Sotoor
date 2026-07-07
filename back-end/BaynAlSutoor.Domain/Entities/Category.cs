using BaynAlSutoor.Domain.Common;
using System;
using System.Collections.Generic;

namespace BaynAlSutoor.Domain.Entities
{
    public class Category : ISoftDelete
    {
        public int Id { get; set; }
        public string NameAr { get; set; } = string.Empty;
        public string NameEn { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public string DescriptionAr { get; set; } = string.Empty;
        public string DescriptionEn { get; set; } = string.Empty;

        // Soft Delete
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        public int? DeletedBy { get; set; }

        // Navigation
        public ICollection<Book> Books { get; set; } = new List<Book>();
    }
}
