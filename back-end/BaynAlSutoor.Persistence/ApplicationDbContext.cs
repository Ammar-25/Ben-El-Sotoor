using BaynAlSutoor.Application.Interfaces;
using BaynAlSutoor.Domain.Common;
using BaynAlSutoor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;

namespace BaynAlSutoor.Persistence
{
    public class ApplicationDbContext : DbContext
    {
        private readonly ICurrentUserProvider _currentUserProvider;

        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options,
            ICurrentUserProvider currentUserProvider) : base(options)
        {
            _currentUserProvider = currentUserProvider;
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Role> Roles => Set<Role>();
        public DbSet<UserRole> UserRoles => Set<UserRole>();
        public DbSet<Permission> Permissions => Set<Permission>();
        public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
        public DbSet<Author> Authors => Set<Author>();
        public DbSet<Book> Books => Set<Book>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<BookImage> BookImages => Set<BookImage>();
        public DbSet<Review> Reviews => Set<Review>();
        public DbSet<SubscriptionPlan> SubscriptionPlans => Set<SubscriptionPlan>();
        public DbSet<UserSubscription> UserSubscriptions => Set<UserSubscription>();
        public DbSet<UserFavorite> UserFavorites => Set<UserFavorite>();
        public DbSet<UserReadingProgress> UserReadingProgresses => Set<UserReadingProgress>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();
        public DbSet<NewsletterSubscriber> NewsletterSubscribers => Set<NewsletterSubscriber>();
        public DbSet<FAQ> FAQs => Set<FAQ>();
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
        public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();
        public DbSet<AppSetting> AppSettings => Set<AppSetting>();
        public DbSet<Payment> Payments => Set<Payment>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Apply all configurations from assembly
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

            // Global Query Filter for Soft Delete
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                if (typeof(ISoftDelete).IsAssignableFrom(entityType.ClrType))
                {
                    modelBuilder.Entity(entityType.ClrType)
                        .HasQueryFilter(GetSoftDeleteFilter(entityType.ClrType));
                }
            }
        }

        private static LambdaExpression GetSoftDeleteFilter(Type type)
        {
            var parameter = Expression.Parameter(type, "e");
            var property = Expression.Property(parameter, nameof(ISoftDelete.IsDeleted));
            var comparison = Expression.Equal(property, Expression.Constant(false));
            return Expression.Lambda(comparison, parameter);
        }

        public override int SaveChanges()
        {
            ApplySoftDelete();
            return base.SaveChanges();
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            ApplySoftDelete();
            return base.SaveChangesAsync(cancellationToken);
        }

        private void ApplySoftDelete()
        {
            var userId = _currentUserProvider.UserId;

            foreach (var entry in ChangeTracker.Entries())
            {
                if (entry.Entity is ISoftDelete softDelete && entry.State == EntityState.Deleted)
                {
                    entry.State = EntityState.Modified;
                    softDelete.IsDeleted = true;
                    softDelete.DeletedAt = DateTime.UtcNow;
                    softDelete.DeletedBy = userId;
                }
            }
        }
    }
}
