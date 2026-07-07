using BaynAlSutoor.Application.DTOs;
using BaynAlSutoor.Application.Interfaces;
using BaynAlSutoor.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BaynAlSutoor.API.Controllers
{
    [ApiController]
    [Route("api/profile")]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly ProfileService _profileService;
        private readonly ICurrentUserProvider _currentUserProvider;

        public ProfileController(ProfileService profileService, ICurrentUserProvider currentUserProvider)
        {
            _profileService = profileService;
            _currentUserProvider = currentUserProvider;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = _currentUserProvider.UserId;
            if (userId == null) return Unauthorized();

            var profile = await _profileService.GetMyProfileAsync(userId.Value);
            if (profile == null) return NotFound();

            return Ok(profile);
        }

        [HttpGet("progress")]
        public async Task<IActionResult> GetReadingProgress()
        {
            var userId = _currentUserProvider.UserId;
            if (userId == null) return Unauthorized();

            var progress = await _profileService.GetReadingProgressAsync(userId.Value);
            return Ok(progress);
        }

        [HttpPut("progress")]
        public async Task<IActionResult> UpdateReadingProgress([FromBody] UpdateReadingProgressDto request)
        {
            var userId = _currentUserProvider.UserId;
            if (userId == null) return Unauthorized();

            var result = await _profileService.UpdateReadingProgressAsync(userId.Value, request);
            if (result == null) return NotFound();

            return Ok(result);
        }

        [HttpGet("favorites")]
        public async Task<IActionResult> GetFavorites()
        {
            var userId = _currentUserProvider.UserId;
            if (userId == null) return Unauthorized();

            var favorites = await _profileService.GetFavoritesAsync(userId.Value);
            return Ok(favorites);
        }

        [HttpPost("favorites/toggle")]
        public async Task<IActionResult> ToggleFavorite([FromBody] ToggleFavoriteRequestDto request)
        {
            var userId = _currentUserProvider.UserId;
            if (userId == null) return Unauthorized();

            var result = await _profileService.ToggleFavoriteAsync(userId.Value, request.BookId);
            if (result == null) return NotFound();

            return Ok(result);
        }

        [HttpGet("purchases")]
        public async Task<IActionResult> GetPurchasedBooks()
        {
            var userId = _currentUserProvider.UserId;
            if (userId == null) return Unauthorized();

            var books = await _profileService.GetPurchasedBooksAsync(userId.Value);
            return Ok(books);
        }

        [HttpGet("reviews")]
        public async Task<IActionResult> GetMyReviews()
        {
            var userId = _currentUserProvider.UserId;
            if (userId == null) return Unauthorized();

            var reviews = await _profileService.GetMyReviewsAsync(userId.Value);
            return Ok(reviews);
        }
    }

    public class ToggleFavoriteRequestDto
    {
        public int BookId { get; set; }
    }
}
