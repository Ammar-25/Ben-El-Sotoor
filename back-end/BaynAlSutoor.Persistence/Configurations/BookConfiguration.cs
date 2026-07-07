using BaynAlSutoor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BaynAlSutoor.Persistence.Configurations
{
    public class BookConfiguration : IEntityTypeConfiguration<Book>
    {
        public void Configure(EntityTypeBuilder<Book> builder)
        {
            builder.HasKey(b => b.Id);
            builder.Property(b => b.TitleAr).IsRequired().HasMaxLength(200);
            builder.Property(b => b.TitleEn).IsRequired().HasMaxLength(200);
            builder.Property(b => b.Cover).HasMaxLength(500);
            builder.Property(b => b.PublisherAr).HasMaxLength(200);
            builder.Property(b => b.PublisherEn).HasMaxLength(200);
            builder.Property(b => b.LanguageAr).HasMaxLength(50);
            builder.Property(b => b.LanguageEn).HasMaxLength(50);
            builder.Property(b => b.DigitalAssetUrl).HasMaxLength(500);
            builder.Property(b => b.Price).HasPrecision(18, 2);
            builder.Property(b => b.OldPrice).HasPrecision(18, 2);
            builder.Property(b => b.Rating).HasPrecision(3, 2);

            // Indexes
            builder.HasIndex(b => b.CategoryId);
            builder.HasIndex(b => b.AuthorId);

            // Relationships
            builder.HasOne(b => b.Author)
                .WithMany(a => a.Books)
                .HasForeignKey(b => b.AuthorId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(b => b.Category)
                .WithMany(c => c.Books)
                .HasForeignKey(b => b.CategoryId)
                .OnDelete(DeleteBehavior.Restrict); // Avoid multiple cascade paths

            builder.HasMany(b => b.BookImages)
                .WithOne(bi => bi.Book)
                .HasForeignKey(bi => bi.BookId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(b => b.Reviews)
                .WithOne(r => r.Book)
                .HasForeignKey(r => r.BookId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(b => b.OrderItems)
                .WithOne(oi => oi.Book)
                .HasForeignKey(oi => oi.BookId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent order item cascading deletes
        }
    }

    public class CategoryConfiguration : IEntityTypeConfiguration<Category>
    {
        public void Configure(EntityTypeBuilder<Category> builder)
        {
            builder.HasKey(c => c.Id);
            builder.Property(c => c.NameAr).IsRequired().HasMaxLength(100);
            builder.Property(c => c.NameEn).IsRequired().HasMaxLength(100);
            builder.Property(c => c.Icon).HasMaxLength(100);
            builder.Property(c => c.DescriptionAr).HasMaxLength(500);
            builder.Property(c => c.DescriptionEn).HasMaxLength(500);
        }
    }

    public class BookImageConfiguration : IEntityTypeConfiguration<BookImage>
    {
        public void Configure(EntityTypeBuilder<BookImage> builder)
        {
            builder.HasKey(bi => bi.Id);
            builder.Property(bi => bi.ImageUrl).IsRequired().HasMaxLength(500);
        }
    }

    public class UserFavoriteConfiguration : IEntityTypeConfiguration<UserFavorite>
    {
        public void Configure(EntityTypeBuilder<UserFavorite> builder)
        {
            builder.HasKey(uf => new { uf.UserId, uf.BookId });

            builder.HasOne(uf => uf.User)
                .WithMany(u => u.UserFavorites)
                .HasForeignKey(uf => uf.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(uf => uf.Book)
                .WithMany(b => b.UserFavorites)
                .HasForeignKey(uf => uf.BookId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class UserReadingProgressConfiguration : IEntityTypeConfiguration<UserReadingProgress>
    {
        public void Configure(EntityTypeBuilder<UserReadingProgress> builder)
        {
            builder.HasKey(urp => new { urp.UserId, urp.BookId });

            builder.HasOne(urp => urp.User)
                .WithMany(u => u.UserReadingProgresses)
                .HasForeignKey(urp => urp.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(urp => urp.Book)
                .WithMany(b => b.UserReadingProgresses)
                .HasForeignKey(urp => urp.BookId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
