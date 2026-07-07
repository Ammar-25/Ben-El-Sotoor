using System.Collections.Generic;

namespace BaynAlSutoor.Application.DTOs
{
    public class UserProfileDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int MemberSince { get; set; }
        public int BooksReadCount { get; set; }
        public int InProgressCount { get; set; }
        public int FavoritesCount { get; set; }
        public int ReviewsCount { get; set; }
        public bool HasActiveSubscription { get; set; }
        public string? ActiveSubscriptionPlan { get; set; }
    }

    public class UpdateProfileDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Password { get; set; }
    }

    public class ReadingProgressDto
    {
        public int BookId { get; set; }
        public LocalizedStringDto BookTitle { get; set; } = new();
        public int ProgressPercentage { get; set; }
    }

    public class UpdateReadingProgressDto
    {
        public int BookId { get; set; }
        public int ProgressPercentage { get; set; }
    }

    public class FavoriteStatusDto
    {
        public int BookId { get; set; }
        public bool IsFavorite { get; set; }
    }
}
