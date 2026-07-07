using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;
using Microsoft.Extensions.DependencyInjection;
using AutoMapper;
using BaynAlSutoor.Domain.Entities;
using BaynAlSutoor.Application.DTOs;
using System;

namespace BaynAlSutoor.Tests
{
    public class AutoMapperTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;

        public AutoMapperTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory;
        }

        [Fact]
        public void AutoMapper_ShouldMapUserToUserProfileDto()
        {
            using var scope = _factory.Services.CreateScope();
            var mapper = scope.ServiceProvider.GetRequiredService<IMapper>();

            var user = new User
            {
                Id = 1,
                Name = "Test User",
                Email = "test@example.com"
            };

            var dto = mapper.Map<UserProfileDto>(user);
            Assert.NotNull(dto);
            Assert.Equal(user.Id, dto.Id);
        }
    }
}
