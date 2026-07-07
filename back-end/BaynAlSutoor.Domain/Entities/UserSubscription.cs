using System;

namespace BaynAlSutoor.Domain.Entities
{
    public class UserSubscription
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string PlanId { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }

        // Navigation properties
        public User User { get; set; } = null!;
        public SubscriptionPlan Plan { get; set; } = null!;
    }
}
