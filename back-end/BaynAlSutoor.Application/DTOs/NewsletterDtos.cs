namespace BaynAlSutoor.Application.DTOs
{
    public class SubscribeNewsletterDto
    {
        public string Email { get; set; } = string.Empty;
    }

    public class NewsletterSubscriberDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public System.DateTime SubscribedAt { get; set; }
    }
}
