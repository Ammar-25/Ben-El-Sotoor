using BaynAlSutoor.Application.Interfaces;
using BaynAlSutoor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace BaynAlSutoor.Persistence.Repositories
{
    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        public UserRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            var cleanEmail = email.Trim().ToLower();
            return await _dbSet
                .FirstOrDefaultAsync(u => u.Email.ToLower() == cleanEmail);
        }

        public async Task<User?> GetUserWithRolesAndPermissionsAsync(int userId)
        {
            return await _dbSet
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                        .ThenInclude(r => r.RolePermissions)
                            .ThenInclude(rp => rp.Permission)
                .FirstOrDefaultAsync(u => u.Id == userId);
        }
    }
}
