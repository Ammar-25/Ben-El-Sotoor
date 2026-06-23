using System;
using System.Collections.Generic;

namespace BaynAlSutoor.Application.DTOs
{
    public class ReviewDto
    {
        public int Id { get; set; }
        public int BookId { get; set; }
        public LocalizedStringDto UserName { get; set; } = new();
        public int Rating { get; set; }
        public LocalizedStringDto Text { get; set; } = new();
        public string Date { get; set; } = string.Empty; // Format as YYYY-MM-DD
    }

    public class ReviewSummaryDto
    {
        public decimal Average { get; set; }
        public int Total { get; set; }
        public Dictionary<int, int> Breakdown { get; set; } = new();
        public List<ReviewDto> Reviews { get; set; } = new();
    }

    public class CreateReviewDto
    {
        public int BookId { get; set; }
        public int Rating { get; set; }
        public string TextAr { get; set; } = string.Empty;
        public string TextEn { get; set; } = string.Empty;
    }
}
