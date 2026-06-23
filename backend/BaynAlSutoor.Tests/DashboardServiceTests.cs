using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using BaynAlSutoor.Application.DTOs;
using BaynAlSutoor.Application.Interfaces;
using BaynAlSutoor.Application.Services;
using BaynAlSutoor.Domain.Entities;
using FluentAssertions;
using Moq;
using Xunit;

namespace BaynAlSutoor.Tests
{
    public class DashboardServiceTests
    {
        private readonly Mock<IUnitOfWork> _mockUnitOfWork;
        private readonly Mock<IMapper> _mockMapper;
        private readonly DashboardService _dashboardService;

        public DashboardServiceTests()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockMapper = new Mock<IMapper>();
            _dashboardService = new DashboardService(_mockUnitOfWork.Object, _mockMapper.Object);
        }

        [Fact]
        public async Task GetStatsAsync_ShouldReturnCorrectStats()
        {
            // Arrange
            var books = new List<Book> { new Book { Id = 1 }, new Book { Id = 2 } };
            var authors = new List<Author> { new Author { Id = 1 } };
            var users = new List<User> { new User { Id = 1 }, new User { Id = 2 } };
            var reviews = new List<Review> { new Review { Id = 1 } };
            var orders = new List<Order> { new Order { Id = 1, Total = 50 }, new Order { Id = 2, Total = 25 } };
            
            _mockUnitOfWork.Setup(u => u.Books.GetAllAsync()).ReturnsAsync(books);
            _mockUnitOfWork.Setup(u => u.Authors.GetAllAsync()).ReturnsAsync(authors);
            _mockUnitOfWork.Setup(u => u.Users.GetAllAsync()).ReturnsAsync(users);
            _mockUnitOfWork.Setup(u => u.Reviews.GetAllAsync()).ReturnsAsync(reviews);
            _mockUnitOfWork.Setup(u => u.Orders.GetAllAsync()).ReturnsAsync(orders);
            
            var activeSubs = new List<UserSubscription> { new UserSubscription { IsActive = true, EndDate = System.DateTime.UtcNow.AddDays(1) } };
            _mockUnitOfWork.Setup(u => u.UserSubscriptions.GetQueryable()).Returns(activeSubs.AsQueryable());
            
            var categories = new List<Category> { new Category { Id = 1, NameEn = "Fiction" } };
            _mockUnitOfWork.Setup(u => u.Categories.GetAllAsync()).ReturnsAsync(categories);

            // Act
            var result = await _dashboardService.GetStatsAsync();

            // Assert
            result.Should().NotBeNull();
            result.TotalBooks.Should().Be(2);
            result.TotalAuthors.Should().Be(1);
            result.TotalReaders.Should().Be(2);
            result.TotalReviews.Should().Be(1);
            result.TotalSales.Should().Be(75);
            result.ActiveSubscriptions.Should().Be(1);
        }
    }
}
