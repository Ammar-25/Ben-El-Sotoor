using BaynAlSutoor.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace BaynAlSutoor.API.Controllers
{
    [ApiController]
    [Route("api/stats")]
    public class StatsController : ControllerBase
    {
        private readonly DashboardService _dashboardService;

        public StatsController(DashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("users/count")]
        public async Task<IActionResult> GetUsersCount()
        {
            var count = await _dashboardService.GetTotalReadersAsync();
            return Ok(count);
        }

        [HttpGet("reviews/count")]
        public async Task<IActionResult> GetReviewsCount()
        {
            var count = await _dashboardService.GetTotalReviewsAsync();
            return Ok(count);
        }
    }
}
