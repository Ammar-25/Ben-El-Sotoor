using BaynAlSutoor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BaynAlSutoor.Persistence.Configurations
{
    public class SubscriptionPlanConfiguration : IEntityTypeConfiguration<SubscriptionPlan>
    {
        public void Configure(EntityTypeBuilder<SubscriptionPlan> builder)
        {
            builder.HasKey(p => p.Id);
            builder.Property(p => p.Id).HasMaxLength(50);
            builder.Property(p => p.NameAr).IsRequired().HasMaxLength(100);
            builder.Property(p => p.NameEn).IsRequired().HasMaxLength(100);
            builder.Property(p => p.PriceLabelAr).IsRequired().HasMaxLength(100);
            builder.Property(p => p.PriceLabelEn).IsRequired().HasMaxLength(100);
            builder.Property(p => p.PeriodAr).IsRequired().HasMaxLength(100);
            builder.Property(p => p.PeriodEn).IsRequired().HasMaxLength(100);
            builder.Property(p => p.Price).HasPrecision(18, 2);
        }
    }

    public class UserSubscriptionConfiguration : IEntityTypeConfiguration<UserSubscription>
    {
        public void Configure(EntityTypeBuilder<UserSubscription> builder)
        {
            builder.HasKey(s => s.Id);
            builder.Property(s => s.PlanId).IsRequired().HasMaxLength(50);

            builder.HasIndex(s => s.UserId);
            builder.HasIndex(s => s.PlanId);

            builder.HasOne(s => s.Plan)
                .WithMany(p => p.UserSubscriptions)
                .HasForeignKey(s => s.PlanId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
