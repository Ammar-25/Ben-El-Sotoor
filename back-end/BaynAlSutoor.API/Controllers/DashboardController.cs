using BaynAlSutoor.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BaynAlSutoor.API.Controllers
{
    [ApiController]
    [Route("api/dashboard")]
    [Authorize(Roles = "Admin")]
    public class DashboardController : ControllerBase
    {
        private readonly DashboardService _dashboardService;

        public DashboardController(DashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var stats = await _dashboardService.GetStatsAsync();
            return Ok(stats);
        }

        [HttpGet("audit-logs")]
        public async Task<IActionResult> GetAuditLogs()
        {
            var logs = await _dashboardService.GetAuditLogsAsync();
            return Ok(logs);
        }

        [HttpGet("users/count")]
        public async Task<IActionResult> GetTotalUsersCount()
        {
            var count = await _dashboardService.GetTotalReadersAsync();
            return Ok(new { TotalUsers = count });
        }

        [HttpGet("orders/count")]
        public async Task<IActionResult> GetTotalOrdersCount()
        {
            var count = await _dashboardService.GetTotalOrdersAsync();
            return Ok(new { TotalOrders = count });
        }

        [HttpGet("books/count")]
        public async Task<IActionResult> GetTotalBooksCount()
        {
            var count = await _dashboardService.GetTotalBooksAsync();
            return Ok(new { TotalBooks = count });
        }

        [HttpGet("revenue/total")]
        public async Task<IActionResult> GetTotalRevenue()
        {
            var total = await _dashboardService.GetTotalRevenueAsync();
            return Ok(new { TotalRevenue = total });
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var users = await _dashboardService.GetPaginatedUsersAsync(page, limit);
            return Ok(users);
        }
    }
}
