using BaynAlSutoor.Application.Interfaces;
using BaynAlSutoor.Infrastructure.Services;
using Microsoft.Extensions.DependencyInjection;

namespace BaynAlSutoor.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructureServices(this IServiceCollection services)
        {
            // Register HttpContextAccessor
            services.AddHttpContextAccessor();

            // Register Services
            services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
            services.AddScoped<IPasswordHasher, PasswordHasher>();
            services.AddScoped<ICurrentUserProvider, CurrentUserProvider>();
            services.AddScoped<IFileService, FileService>();
            services.AddScoped<IEmailService, EmailService>();

            return services;
        }
    }
}
