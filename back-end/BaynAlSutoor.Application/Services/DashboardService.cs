using AutoMapper;
using BaynAlSutoor.Application.DTOs;
using BaynAlSutoor.Application.Interfaces;
using BaynAlSutoor.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaynAlSutoor.Application.Services
{
    public class DashboardService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public DashboardService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<int> GetTotalReadersAsync()
        {
            return (await _unitOfWork.Users.GetAllAsync()).Count();
        }

        public async Task<int> GetTotalReviewsAsync()
        {
            return (await _unitOfWork.Reviews.GetAllAsync()).Count();
        }

        public async Task<AdminStatsDto> GetStatsAsync()
        {
            var totalBooks = (await _unitOfWork.Books.GetAllAsync()).Count();
            var totalAuthors = (await _unitOfWork.Authors.GetAllAsync()).Count();
            
            // Readers count = users in role 'Reader' or total users for simplicity
            var totalReaders = (await _unitOfWork.Users.GetAllAsync()).Count();
            var totalReviews = (await _unitOfWork.Reviews.GetAllAsync()).Count();
            
            var orders = await _unitOfWork.Orders.GetAllAsync();
            var totalSales = orders.Sum(o => o.Total);

            var activeSubs = _unitOfWork.UserSubscriptions.GetQueryable()
                .Count(s => s.IsActive && s.EndDate >= DateTime.UtcNow);

            // Group category breakdown
            var books = await _unitOfWork.Books.GetAllAsync();
            var categories = await _unitOfWork.Categories.GetAllAsync();
            var categoryBreakdown = books
                .GroupBy(b => b.CategoryId)
                .Select(g => new CategoryStatDto
                {
                    Category = categories.FirstOrDefault(c => c.Id == g.Key)?.NameEn ?? "Unknown",
                    BookCount = g.Count()
                })
                .ToList();

            // Group sales history
            var salesHistory = orders
                .GroupBy(o => o.OrderDate.Date)
                .Select(g => new SalesHistoryDto
                {
                    Date = g.Key.ToString("yyyy-MM-dd"),
                    TotalSales = g.Sum(o => o.Total)
                })
                .OrderBy(s => s.Date)
                .Take(30)
                .ToList();

            return new AdminStatsDto
            {
                TotalBooks = totalBooks,
                TotalAuthors = totalAuthors,
                TotalReaders = totalReaders,
                TotalReviews = totalReviews,
                TotalSales = totalSales,
                ActiveSubscriptions = activeSubs,
                CategoryBreakdown = categoryBreakdown,
                SalesHistory = salesHistory
            };
        }

        public async Task<IEnumerable<AuditLogDto>> GetAuditLogsAsync()
        {
            var logs = await _unitOfWork.AuditLogs.GetAllAsync();
            var dtoList = new List<AuditLogDto>();

            foreach (var log in logs.OrderByDescending(l => l.Timestamp))
            {
                var dto = _mapper.Map<AuditLogDto>(log);
                if (log.UserId.HasValue)
                {
                    var user = await _unitOfWork.Users.GetByIdAsync(log.UserId.Value);
                    if (user != null)
                    {
                        dto.UserEmail = user.Email;
                    }
                }
                dtoList.Add(dto);
            }

            return dtoList;
        }
    }
}
