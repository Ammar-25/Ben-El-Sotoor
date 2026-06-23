using BaynAlSutoor.Application.Interfaces;
using BaynAlSutoor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaynAlSutoor.Persistence.Repositories
{
    public class BookRepository : GenericRepository<Book>, IBookRepository
    {
        public BookRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Book>> GetFeaturedBooksAsync(int limit)
        {
            return await _dbSet
                .Include(b => b.Author)
                .Include(b => b.Category)
                .OrderByDescending(b => b.Rating)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<IEnumerable<Book>> GetLatestBooksAsync(string range, int limit)
        {
            var cutoff = DateTime.UtcNow;
            switch (range.ToLower())
            {
                case "weekly":
                    cutoff = cutoff.AddDays(-7);
                    break;
                case "monthly":
                    cutoff = cutoff.AddDays(-30);
                    break;
                case "yearly":
                    cutoff = cutoff.AddDays(-365);
                    break;
                default:
                    cutoff = DateTime.MinValue;
                    break;
            }

            return await _dbSet
                .Include(b => b.Author)
                .Include(b => b.Category)
                .Where(b => b.CreatedAt >= cutoff)
                .OrderByDescending(b => b.CreatedAt)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<IEnumerable<Book>> SearchBooksAsync(
            string? q, 
            string category, 
            string lang, 
            decimal maxPrice, 
            string sort)
        {
            var query = _dbSet
                .Include(b => b.Author)
                .Include(b => b.Category)
                .Include(b => b.BookImages)
                .AsQueryable();

            // Text search
            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.Trim().ToLower();
                query = query.Where(b => 
                    b.TitleAr.ToLower().Contains(term) || 
                    b.TitleEn.ToLower().Contains(term) ||
                    b.Author.NameAr.ToLower().Contains(term) ||
                    b.Author.NameEn.ToLower().Contains(term));
            }

            // Category filter (matches lowercase name/code)
            if (!string.IsNullOrWhiteSpace(category) && !category.Equals("all", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(b => b.Category.NameEn.ToLower() == category.ToLower());
            }

            // Language filter
            if (!string.IsNullOrWhiteSpace(lang) && !lang.Equals("all", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(b => 
                    b.LanguageAr.ToLower() == lang.ToLower() || 
                    b.LanguageEn.ToLower() == lang.ToLower());
            }

            // Price filter
            if (maxPrice > 0 && maxPrice < decimal.MaxValue)
            {
                query = query.Where(b => b.Price <= maxPrice);
            }

            // Sorting
            query = sort.ToLower() switch
            {
                "pricelow" => query.OrderBy(b => b.Price),
                "pricehigh" => query.OrderByDescending(b => b.Price),
                "rating" => query.OrderByDescending(b => b.Rating),
                "newest" or _ => query.OrderByDescending(b => b.CreatedAt)
            };

            return await query.ToListAsync();
        }
    }
}
