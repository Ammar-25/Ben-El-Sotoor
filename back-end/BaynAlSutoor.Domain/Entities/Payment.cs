using System;

namespace BaynAlSutoor.Domain.Entities
{
    public class Payment
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; } = string.Empty; // Pending, Success, Failed
        public string Gateway { get; set; } = string.Empty;
        public string TransactionId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }

        // Navigation
        public Order Order { get; set; } = null!;
    }
}
