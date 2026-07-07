using System;
using System.Collections.Generic;

namespace BaynAlSutoor.Application.DTOs
{
    public class LocalizedStringDto
    {
        public string Ar { get; set; } = string.Empty;
        public string En { get; set; } = string.Empty;
    }

    public class BookDto
    {
        public int Id { get; set; }
        public LocalizedStringDto Title { get; set; } = new();
        public int AuthorId { get; set; }
        public string Category { get; set; } = string.Empty;
        public string Cover { get; set; } = string.Empty;
        public decimal Rating { get; set; }
        public int ReviewsCount { get; set; }
        public LocalizedStringDto Description { get; set; } = new();
        public decimal Price { get; set; }
        public decimal OldPrice { get; set; }
        public bool IsNew { get; set; }
        public LocalizedStringDto Publisher { get; set; } = new();
        public LocalizedStringDto BookLanguage { get; set; } = new();
        public int Pages { get; set; }
        public int Year { get; set; }
        public string CreatedAt { get; set; } = string.Empty; // Format as YYYY-MM-DD
    }

    public class BookDetailsDto : BookDto
    {
        public AuthorDto Author { get; set; } = null!;
        public List<ReviewDto> Reviews { get; set; } = new();
    }

    public class CreateBookDto
    {
        public string TitleAr { get; set; } = string.Empty;
        public string TitleEn { get; set; } = string.Empty;
        public int AuthorId { get; set; }
        public string Category { get; set; } = string.Empty;
        public string Cover { get; set; } = string.Empty;
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
    }

    public class UpdateBookDto : CreateBookDto
    {
        public int Id { get; set; }
    }

    public class CategoryWithCountDto
    {
        public string Key { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class ImageUrlResponseDto
    {
        public string Url { get; set; } = string.Empty;
    }
}
