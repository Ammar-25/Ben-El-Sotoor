using System;
using System.Collections.Generic;

namespace BaynAlSutoor.Application.DTOs
{
    public class CategoryStatDto
    {
        public string Category { get; set; } = string.Empty;
        public int BookCount { get; set; }
    }

    public class SalesHistoryDto
    {
        public string Date { get; set; } = string.Empty;
        public decimal TotalSales { get; set; }
    }

    public class AdminStatsDto
    {
        public int TotalBooks { get; set; }
        public int TotalAuthors { get; set; }
        public int TotalReaders { get; set; }
        public int TotalReviews { get; set; }
        public decimal TotalSales { get; set; }
        public int ActiveSubscriptions { get; set; }
        public List<CategoryStatDto> CategoryBreakdown { get; set; } = new();
        public List<SalesHistoryDto> SalesHistory { get; set; } = new();
    }

    public class AuditLogDto
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public string UserEmail { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string EntityName { get; set; } = string.Empty;
        public string? EntityId { get; set; }
        public DateTime Timestamp { get; set; }
        public string? Details { get; set; }
    }
}
