using BaynAlSutoor.Domain.Entities;
using System.Collections.Generic;

namespace BaynAlSutoor.Application.Interfaces
{
    public interface IJwtTokenGenerator
    {
        string GenerateToken(User user, IEnumerable<string> roles, IEnumerable<string> permissions);
        string GenerateRefreshToken();
    }
}
