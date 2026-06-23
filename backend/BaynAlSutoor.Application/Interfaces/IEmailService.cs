using System.Threading.Tasks;

namespace BaynAlSutoor.Application.Interfaces
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string body);
    }
}
