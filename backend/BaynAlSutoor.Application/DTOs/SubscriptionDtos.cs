using System;
using System.Collections.Generic;

namespace BaynAlSutoor.Application.DTOs
{
    public class SubscriptionPlanDto
    {
        public string Id { get; set; } = string.Empty;
        public LocalizedStringDto Name { get; set; } = new();
        public decimal Price { get; set; }
        public LocalizedStringDto PriceLabel { get; set; } = new();
        public LocalizedStringDto Period { get; set; } = new();
        public bool Featured { get; set; }
        public List<string> FeatureKeys { get; set; } = new();
    }

    public class SubscribeRequestDto
    {
        public string PlanId { get; set; } = string.Empty;
    }

    public class UserSubscriptionDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string PlanId { get; set; } = string.Empty;
        public string PlanNameEn { get; set; } = string.Empty;
        public string PlanNameAr { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
    }
}
