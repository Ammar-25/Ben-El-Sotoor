using System;

namespace BaynAlSutoor.Domain.Entities
{
    public class NewsletterSubscriber
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public DateTime SubscribedAt { get; set; }
    }
}
