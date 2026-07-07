using System.Collections.Generic;

namespace BaynAlSutoor.Application.DTOs
{
    public class LocalizedListDto
    {
        public List<string> Ar { get; set; } = new();
        public List<string> En { get; set; } = new();
    }

    public class AuthorDto
    {
        public int Id { get; set; }
        public LocalizedStringDto Name { get; set; } = new();
        public string Photo { get; set; } = string.Empty;
        public string Banner { get; set; } = string.Empty;
        public LocalizedStringDto Bio { get; set; } = new();
        public int BooksCount { get; set; }
        public int Followers { get; set; }
        public decimal Rating { get; set; }
        public LocalizedListDto Achievements { get; set; } = new();
        public LocalizedStringDto Quote { get; set; } = new();
    }

    public class AuthorDetailsDto : AuthorDto
    {
        public List<BookDto> Books { get; set; } = new();
    }

    public class CreateAuthorDto
    {
        public string NameAr { get; set; } = string.Empty;
        public string NameEn { get; set; } = string.Empty;
        public string Photo { get; set; } = string.Empty;
        public string Banner { get; set; } = string.Empty;
        public string BioAr { get; set; } = string.Empty;
        public string BioEn { get; set; } = string.Empty;
        public int Followers { get; set; }
        public decimal Rating { get; set; }
        public List<string> AchievementsAr { get; set; } = new();
        public List<string> AchievementsEn { get; set; } = new();
        public string QuoteAr { get; set; } = string.Empty;
        public string QuoteEn { get; set; } = string.Empty;
    }

    public class UpdateAuthorDto : CreateAuthorDto
    {
        public int Id { get; set; }
    }
}
