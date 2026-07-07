using BaynAlSutoor.Application.DTOs;
using BaynAlSutoor.Application.Interfaces;
using BaynAlSutoor.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BaynAlSutoor.API.Controllers
{
    [ApiController]
    [Route("api/reviews")]
    public class ReviewController : ControllerBase
    {
        private readonly ReviewService _reviewService;
        private readonly ICurrentUserProvider _currentUserProvider;

        public ReviewController(ReviewService reviewService, ICurrentUserProvider currentUserProvider)
        {
            _reviewService = reviewService;
            _currentUserProvider = currentUserProvider;
        }

        [HttpGet("book/{bookId}")]
        public async Task<IActionResult> GetReviewsByBookId(int bookId, [FromQuery] int page = 1, [FromQuery] int limit = 5)
        {
            var reviews = await _reviewService.GetReviewsByBookIdAsync(bookId, page, limit);
            return Ok(reviews);
        }

        [HttpGet("summary/{bookId}")]
        public async Task<IActionResult> GetReviewSummary(int bookId)
        {
            var summary = await _reviewService.GetReviewSummaryAsync(bookId);
            return Ok(summary);
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetGlobalReviewSummary()
        {
            var summary = await _reviewService.GetReviewSummaryAsync(null);
            return Ok(summary);
        }

        [HttpGet("top")]
        public async Task<IActionResult> GetTopReviews([FromQuery] int limit = 3)
        {
            var topReviews = await _reviewService.GetTopReviewsAsync(limit);
            return Ok(topReviews);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto request)
        {
            var userId = _currentUserProvider.UserId;
            if (userId == null) return Unauthorized();

            var review = await _reviewService.CreateReviewAsync(userId.Value, request);
            if (review == null) return BadRequest("Unable to create review. Have you purchased or read this book?");

            return Ok(review);
        }
    }
}
