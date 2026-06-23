using BaynAlSutoor.Application.DTOs;
using BaynAlSutoor.Application.Interfaces;
using BaynAlSutoor.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BaynAlSutoor.API.Controllers
{
    [ApiController]
    [Route("api/subscriptions")]
    public class SubscriptionController : ControllerBase
    {
        private readonly SubscriptionService _subscriptionService;
        private readonly ICurrentUserProvider _currentUserProvider;

        public SubscriptionController(SubscriptionService subscriptionService, ICurrentUserProvider currentUserProvider)
        {
            _subscriptionService = subscriptionService;
            _currentUserProvider = currentUserProvider;
        }

        [HttpGet("plans")]
        public async Task<IActionResult> GetAllPlans()
        {
            var plans = await _subscriptionService.GetAllPlansAsync();
            return Ok(plans);
        }

        [HttpPost("subscribe")]
        [Authorize]
        public async Task<IActionResult> Subscribe([FromBody] SubscribeRequestDto request)
        {
            var userId = _currentUserProvider.UserId;
            if (userId == null) return Unauthorized();

            var result = await _subscriptionService.SubscribeUserAsync(userId.Value, request.PlanId);
            if (result == null) return BadRequest("Subscription failed.");

            return Ok(result);
        }
    }

    public class SubscribeRequestDto
    {
        public string PlanId { get; set; } = string.Empty;
    }
}
