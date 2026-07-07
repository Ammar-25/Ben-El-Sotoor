using BaynAlSutoor.Domain.Common;
using System;
using System.Collections.Generic;

namespace BaynAlSutoor.Domain.Entities
{
    public class Book : ISoftDelete
    {
        public int Id { get; set; }
        public string TitleAr { get; set; } = string.Empty;
        public string TitleEn { get; set; } = string.Empty;
        public int AuthorId { get; set; }
        public int CategoryId { get; set; }
        public string Cover { get; set; } = string.Empty;
        public decimal Rating { get; set; }
        public int ReviewsCount { get; set; }
        public string DescriptionAr { get; set; } = string.Empty;
        public string DescriptionEn { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public decimal OldPrice { get; set; }
        public bool IsNew { get; set; }
        public string PublisherAr { get; set; } = string.Empty;
        public string PublisherEn { get; set; } = string.Empty;
        public string LanguageAr { get; set; } = string.Empty;
        public string LanguageEn { get; set; } = string.Empty;
        public int Pages { get; set; }
        public int Year { get; set; }
        public string? DigitalAssetUrl { get; set; }
        public DateTime CreatedAt { get; set; }

        // Soft Delete
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        public int? DeletedBy { get; set; }

        // Navigation properties
        public Author Author { get; set; } = null!;
        public Category Category { get; set; } = null!;
        public ICollection<BookImage> BookImages { get; set; } = new List<BookImage>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public ICollection<UserFavorite> UserFavorites { get; set; } = new List<UserFavorite>();
        public ICollection<UserReadingProgress> UserReadingProgresses { get; set; } = new List<UserReadingProgress>();
    }
}
