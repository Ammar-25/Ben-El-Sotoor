using BaynAlSutoor.Domain.Entities;
using System.Threading.Tasks;

namespace BaynAlSutoor.Application.Interfaces
{
    public interface IUserRepository : IGenericRepository<User>
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetUserWithRolesAndPermissionsAsync(int userId);
    }
}
