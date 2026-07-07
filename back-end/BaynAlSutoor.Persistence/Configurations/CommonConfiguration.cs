using BaynAlSutoor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BaynAlSutoor.Persistence.Configurations
{
    public class FAQConfiguration : IEntityTypeConfiguration<FAQ>
    {
        public void Configure(EntityTypeBuilder<FAQ> builder)
        {
            builder.HasKey(f => f.Id);
            builder.Property(f => f.QuestionAr).IsRequired();
            builder.Property(f => f.QuestionEn).IsRequired();
            builder.Property(f => f.AnswerAr).IsRequired();
            builder.Property(f => f.AnswerEn).IsRequired();
        }
    }

    public class ContactMessageConfiguration : IEntityTypeConfiguration<ContactMessage>
    {
        public void Configure(EntityTypeBuilder<ContactMessage> builder)
        {
            builder.HasKey(c => c.Id);
            builder.Property(c => c.Name).IsRequired().HasMaxLength(150);
            builder.Property(c => c.Email).IsRequired().HasMaxLength(256);
            builder.Property(c => c.Subject).IsRequired().HasMaxLength(200);
            builder.Property(c => c.Message).IsRequired();
        }
    }

    public class AppSettingConfiguration : IEntityTypeConfiguration<AppSetting>
    {
        public void Configure(EntityTypeBuilder<AppSetting> builder)
        {
            builder.HasKey(s => s.Id);
            builder.Property(s => s.SiteNameAr).IsRequired().HasMaxLength(150);
            builder.Property(s => s.SiteNameEn).IsRequired().HasMaxLength(150);
            builder.Property(s => s.LogoUrl).HasMaxLength(500);
            builder.Property(s => s.ContactEmail).HasMaxLength(256);
            builder.Property(s => s.ContactPhone).HasMaxLength(50);
            builder.Property(s => s.AddressAr).HasMaxLength(250);
            builder.Property(s => s.AddressEn).HasMaxLength(250);
            builder.Property(s => s.FacebookUrl).HasMaxLength(500);
            builder.Property(s => s.TwitterUrl).HasMaxLength(500);
            builder.Property(s => s.InstagramUrl).HasMaxLength(500);
        }
    }

    public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
    {
        public void Configure(EntityTypeBuilder<AuditLog> builder)
        {
            builder.HasKey(l => l.Id);
            builder.Property(l => l.Action).IsRequired().HasMaxLength(100);
            builder.Property(l => l.EntityName).IsRequired().HasMaxLength(100);
            builder.Property(l => l.EntityId).HasMaxLength(100);

            builder.HasIndex(l => l.UserId);
        }
    }

    public class NewsletterSubscriberConfiguration : IEntityTypeConfiguration<NewsletterSubscriber>
    {
        public void Configure(EntityTypeBuilder<NewsletterSubscriber> builder)
        {
            builder.HasKey(n => n.Id);
            builder.Property(n => n.Email).IsRequired().HasMaxLength(256);
            builder.HasIndex(n => n.Email).IsUnique();
        }
    }
}
