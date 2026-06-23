using BaynAlSutoor.Application.Interfaces;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;

namespace BaynAlSutoor.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly ILogger<EmailService> _logger;

        public EmailService(ILogger<EmailService> _logger)
        {
            this._logger = _logger;
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            _logger.LogInformation("SMTP Simulation: Dispatching email to {Recipient}. Subject: {Subject}. Body: {Body}", to, subject, body);
            // Simulate SMTP server round-trip latency
            await Task.Delay(100);
        }
    }
}
