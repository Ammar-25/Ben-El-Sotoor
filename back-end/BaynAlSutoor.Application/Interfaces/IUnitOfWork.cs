using BaynAlSutoor.Domain.Entities;
using System;
using System.Threading.Tasks;

namespace BaynAlSutoor.Application.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IUserRepository Users { get; }
        IBookRepository Books { get; }
        IAuthorRepository Authors { get; }
        IGenericRepository<UserRole> UserRoles { get; }
        IGenericRepository<Review> Reviews { get; }
        IGenericRepository<SubscriptionPlan> SubscriptionPlans { get; }
        IGenericRepository<UserSubscription> UserSubscriptions { get; }
        IGenericRepository<UserFavorite> UserFavorites { get; }
        IGenericRepository<UserReadingProgress> UserReadingProgresses { get; }
        IGenericRepository<Order> Orders { get; }
        IGenericRepository<OrderItem> OrderItems { get; }
        IGenericRepository<NewsletterSubscriber> NewsletterSubscribers { get; }
        IGenericRepository<FAQ> FAQs { get; }
        IGenericRepository<AuditLog> AuditLogs { get; }
        IGenericRepository<RefreshToken> RefreshTokens { get; }
        IGenericRepository<Role> Roles { get; }
        IGenericRepository<Permission> Permissions { get; }
        IGenericRepository<Category> Categories { get; }
        IGenericRepository<BookImage> BookImages { get; }
        IGenericRepository<ContactMessage> ContactMessages { get; }
        IGenericRepository<AppSetting> AppSettings { get; }
        IGenericRepository<Payment> Payments { get; }
        
        Task<int> CompleteAsync();
    }
}
