using System;
using System.Collections.Generic;

namespace BaynAlSutoor.Application.DTOs
{
    public class UserAdminDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public List<string> Roles { get; set; } = new();
    }

    public class PaginatedUserDto
    {
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int Limit { get; set; }
        public int TotalPages { get; set; }
        public List<UserAdminDto> Users { get; set; } = new();
    }
}
