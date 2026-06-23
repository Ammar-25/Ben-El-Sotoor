using BaynAlSutoor.Application.Interfaces;
using BaynAlSutoor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaynAlSutoor.Persistence.Repositories
{
    public class AuthorRepository : GenericRepository<Author>, IAuthorRepository
    {
        public AuthorRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Author>> GetFeaturedAuthorsAsync(int limit)
        {
            return await _dbSet
                .OrderByDescending(a => a.Followers)
                .Take(limit)
                .ToListAsync();
        }
    }
}
