using BaynAlSutoor.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BaynAlSutoor.Application.Interfaces
{
    public interface IBookRepository : IGenericRepository<Book>
    {
        Task<IEnumerable<Book>> GetFeaturedBooksAsync(int limit);
        Task<IEnumerable<Book>> GetLatestBooksAsync(string range, int limit);
        Task<IEnumerable<Book>> SearchBooksAsync(string? q, string category, string lang, decimal maxPrice, string sort);
    }
}
