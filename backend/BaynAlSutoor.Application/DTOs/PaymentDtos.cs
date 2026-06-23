using System;
using System.ComponentModel.DataAnnotations;

namespace BaynAlSutoor.Application.DTOs
{
    public class PaymentDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int? OrderId { get; set; }
        public int? SubscriptionId { get; set; }
        public decimal Amount { get; set; }
        public string Gateway { get; set; } = string.Empty;
        public string TransactionId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class CreatePaymentDto
    {
        public int UserId { get; set; }
        public int? OrderId { get; set; }
        public int? SubscriptionId { get; set; }
        [Required]
        public decimal Amount { get; set; }
        [Required]
        public string Gateway { get; set; } = string.Empty;
        public string TransactionId { get; set; } = string.Empty;
        public string Status { get; set; } = "Completed";
    }
}
