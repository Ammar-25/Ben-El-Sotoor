using BaynAlSutoor.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BaynAlSutoor.Application.Interfaces
{
    public interface IAuthorRepository : IGenericRepository<Author>
    {
        Task<IEnumerable<Author>> GetFeaturedAuthorsAsync(int limit);
    }
}
