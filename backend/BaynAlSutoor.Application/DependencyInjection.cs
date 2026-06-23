using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using BaynAlSutoor.Application.Services;
using System.Reflection;

namespace BaynAlSutoor.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            // Register AutoMapper
            services.AddAutoMapper(cfg => cfg.AddMaps(Assembly.GetExecutingAssembly()));

            // Register FluentValidation
            services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

            // Register Business Services
            services.AddScoped<AuthService>();
            services.AddScoped<BookService>();
            services.AddScoped<AuthorService>();
            services.AddScoped<ReviewService>();
            services.AddScoped<SubscriptionService>();
            services.AddScoped<OrderService>();
            services.AddScoped<ProfileService>();
            services.AddScoped<DashboardService>();
            services.AddScoped<CategoryService>();
            services.AddScoped<FAQService>();
            services.AddScoped<ContactMessageService>();
            services.AddScoped<PaymentService>();
            services.AddScoped<RoleService>();
            services.AddScoped<NewsletterService>();

            return services;
        }
    }
}
