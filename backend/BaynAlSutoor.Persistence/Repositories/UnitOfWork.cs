using BaynAlSutoor.Application.Interfaces;
using BaynAlSutoor.Domain.Entities;
using System.Threading.Tasks;

namespace BaynAlSutoor.Persistence.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;

        public UnitOfWork(ApplicationDbContext context)
        {
            _context = context;
            Users = new UserRepository(_context);
            Books = new BookRepository(_context);
            Authors = new AuthorRepository(_context);
            UserRoles = new GenericRepository<UserRole>(_context);
            Reviews = new GenericRepository<Review>(_context);
            SubscriptionPlans = new GenericRepository<SubscriptionPlan>(_context);
            UserSubscriptions = new GenericRepository<UserSubscription>(_context);
            UserFavorites = new GenericRepository<UserFavorite>(_context);
            UserReadingProgresses = new GenericRepository<UserReadingProgress>(_context);
            Orders = new GenericRepository<Order>(_context);
            OrderItems = new GenericRepository<OrderItem>(_context);
            NewsletterSubscribers = new GenericRepository<NewsletterSubscriber>(_context);
            FAQs = new GenericRepository<FAQ>(_context);
            AuditLogs = new GenericRepository<AuditLog>(_context);
            RefreshTokens = new GenericRepository<RefreshToken>(_context);
            Roles = new GenericRepository<Role>(_context);
            Permissions = new GenericRepository<Permission>(_context);
            Categories = new GenericRepository<Category>(_context);
            BookImages = new GenericRepository<BookImage>(_context);
            ContactMessages = new GenericRepository<ContactMessage>(_context);
            AppSettings = new GenericRepository<AppSetting>(_context);
            Payments = new GenericRepository<Payment>(_context);
        }

        public IUserRepository Users { get; }
        public IBookRepository Books { get; }
        public IAuthorRepository Authors { get; }
        public IGenericRepository<UserRole> UserRoles { get; }
        public IGenericRepository<Review> Reviews { get; }
        public IGenericRepository<SubscriptionPlan> SubscriptionPlans { get; }
        public IGenericRepository<UserSubscription> UserSubscriptions { get; }
        public IGenericRepository<UserFavorite> UserFavorites { get; }
        public IGenericRepository<UserReadingProgress> UserReadingProgresses { get; }
        public IGenericRepository<Order> Orders { get; }
        public IGenericRepository<OrderItem> OrderItems { get; }
        public IGenericRepository<NewsletterSubscriber> NewsletterSubscribers { get; }
        public IGenericRepository<FAQ> FAQs { get; }
        public IGenericRepository<AuditLog> AuditLogs { get; }
        public IGenericRepository<RefreshToken> RefreshTokens { get; }
        public IGenericRepository<Role> Roles { get; }
        public IGenericRepository<Permission> Permissions { get; }
        public IGenericRepository<Category> Categories { get; }
        public IGenericRepository<BookImage> BookImages { get; }
        public IGenericRepository<ContactMessage> ContactMessages { get; }
        public IGenericRepository<AppSetting> AppSettings { get; }
        public IGenericRepository<Payment> Payments { get; }

        public async Task<int> CompleteAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
