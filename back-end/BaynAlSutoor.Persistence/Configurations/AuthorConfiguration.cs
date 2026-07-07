using BaynAlSutoor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BaynAlSutoor.Persistence.Configurations
{
    public class AuthorConfiguration : IEntityTypeConfiguration<Author>
    {
        public void Configure(EntityTypeBuilder<Author> builder)
        {
            builder.HasKey(a => a.Id);
            builder.Property(a => a.NameAr).IsRequired().HasMaxLength(200);
            builder.Property(a => a.NameEn).IsRequired().HasMaxLength(200);
            builder.Property(a => a.Photo).HasMaxLength(500);
            builder.Property(a => a.Banner).HasMaxLength(500);
            builder.Property(a => a.QuoteAr).HasMaxLength(500);
            builder.Property(a => a.QuoteEn).HasMaxLength(500);
            builder.Property(a => a.Rating).HasPrecision(3, 2);
        }
    }

    public class ReviewConfiguration : IEntityTypeConfiguration<Review>
    {
        public void Configure(EntityTypeBuilder<Review> builder)
        {
            builder.HasKey(r => r.Id);
            builder.Property(r => r.TextAr).IsRequired();
            builder.Property(r => r.TextEn).IsRequired();

            builder.HasIndex(r => r.BookId);
            builder.HasIndex(r => r.UserId);
        }
    }
}
