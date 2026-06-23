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
    public class ReviewService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ReviewService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<ReviewDto>> GetReviewsByBookIdAsync(int bookId)
        {
            var reviews = await _unitOfWork.Reviews.FindAsync(r => r.BookId == bookId);
            foreach (var r in reviews)
            {
                r.User = await _unitOfWork.Users.GetByIdAsync(r.UserId) ?? new User { Name = "Anonymous" };
            }
            return _mapper.Map<IEnumerable<ReviewDto>>(reviews.OrderByDescending(r => r.Date));
        }

        public async Task<ReviewSummaryDto> GetReviewSummaryAsync(int? bookId)
        {
            var query = _unitOfWork.Reviews.GetQueryable();
            if (bookId.HasValue)
            {
                query = query.Where(r => r.BookId == bookId.Value);
            }

            var reviews = query.ToList();
            foreach (var r in reviews)
            {
                r.User = await _unitOfWork.Users.GetByIdAsync(r.UserId) ?? new User { Name = "Anonymous" };
            }

            var total = reviews.Count;
            var breakdown = new Dictionary<int, int> { { 5, 0 }, { 4, 0 }, { 3, 0 }, { 2, 0 }, { 1, 0 } };
            decimal sum = 0;

            foreach (var r in reviews)
            {
                if (breakdown.ContainsKey(r.Rating))
                {
                    breakdown[r.Rating]++;
                }
                sum += r.Rating;
            }

            var average = total > 0 ? Math.Round(sum / total, 1) : 0;

            return new ReviewSummaryDto
            {
                Average = average,
                Total = total,
                Breakdown = breakdown,
                Reviews = _mapper.Map<List<ReviewDto>>(reviews.OrderByDescending(r => r.Date))
            };
        }

        public async Task<ReviewDto?> CreateReviewAsync(int userId, CreateReviewDto request)
        {
            var book = await _unitOfWork.Books.GetByIdAsync(request.BookId);
            if (book == null) return null;

            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null) return null;

            var review = new Review
            {
                BookId = request.BookId,
                UserId = userId,
                Rating = request.Rating,
                TextAr = request.TextAr,
                TextEn = request.TextEn,
                Date = DateTime.UtcNow
            };

            await _unitOfWork.Reviews.AddAsync(review);
            await _unitOfWork.CompleteAsync();

            // Re-calculate book aggregates
            var reviews = await _unitOfWork.Reviews.FindAsync(r => r.BookId == book.Id);
            var reviewList = reviews.ToList();
            book.ReviewsCount = reviewList.Count;
            book.Rating = Math.Round((decimal)reviewList.Sum(r => r.Rating) / book.ReviewsCount, 1);

            _unitOfWork.Books.Update(book);
            await _unitOfWork.CompleteAsync();

            review.User = user;
            return _mapper.Map<ReviewDto>(review);
        }
    }
}
