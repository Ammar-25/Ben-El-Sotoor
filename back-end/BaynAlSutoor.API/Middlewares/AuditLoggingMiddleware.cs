using BaynAlSutoor.Application.Interfaces;
using BaynAlSutoor.Domain.Entities;

namespace BaynAlSutoor.API.Middlewares
{
    public class AuditLoggingMiddleware
    {
        private readonly RequestDelegate _next;

        public AuditLoggingMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, IUnitOfWork unitOfWork, ICurrentUserProvider currentUserProvider)
        {
            await _next(context);

            // Simple audit for non-GET requests if user is authenticated
            if (context.Request.Method != HttpMethod.Get.Method && context.User.Identity?.IsAuthenticated == true)
            {
                var userId = currentUserProvider.UserId;
                if (userId.HasValue)
                {
                    var log = new AuditLog
                    {
                        UserId = userId.Value,
                        Action = $"{context.Request.Method} {context.Request.Path}",
                        EntityName = "API",
                        EntityId = "N/A",
                        Timestamp = DateTime.UtcNow,
                        Details = $"Response Status: {context.Response.StatusCode}"
                    };
                    
                    await unitOfWork.AuditLogs.AddAsync(log);
                    await unitOfWork.CompleteAsync();
                }
            }
        }
    }
}
