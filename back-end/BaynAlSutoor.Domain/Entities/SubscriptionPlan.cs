using System.Collections.Generic;

namespace BaynAlSutoor.Domain.Entities
{
    public class SubscriptionPlan
    {
        public string Id { get; set; } = string.Empty; // e.g., single, monthly, annual, premium
        public string NameAr { get; set; } = string.Empty;
        public string NameEn { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string PriceLabelAr { get; set; } = string.Empty;
        public string PriceLabelEn { get; set; } = string.Empty;
        public string PeriodAr { get; set; } = string.Empty;
        public string PeriodEn { get; set; } = string.Empty;
        public bool Featured { get; set; }
        public string FeatureKeysJson { get; set; } = string.Empty; // Serialized list of keys, e.g. ["unlimitedReading", "newReleases"]

        // Navigation properties
        public ICollection<UserSubscription> UserSubscriptions { get; set; } = new List<UserSubscription>();
    }
}
