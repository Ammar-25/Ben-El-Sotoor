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

        [HttpGet("books")]
        public async Task<IActionResult> GetBooks([FromQuery] int page = 1, [FromQuery] int limit = 10, [FromQuery] string? search = null)
        {
            var books = await _dashboardService.GetPaginatedBooksAsync(page, limit, search);
            return Ok(books);
        }

        [HttpGet("orders")]
        public async Task<IActionResult> GetOrders([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var orders = await _dashboardService.GetPaginatedOrdersAsync(page, limit);
            return Ok(orders);
        }

        [HttpGet("recent-orders")]
        public async Task<IActionResult> GetRecentOrders([FromQuery] int limit = 5)
        {
            var orders = await _dashboardService.GetRecentOrdersAsync(limit);
            return Ok(orders);
        }

        [HttpGet("orders/{id}")]
        public async Task<IActionResult> GetOrderById(int id)
        {
            var order = await _dashboardService.GetOrderDetailsAsync(id);
            if (order == null)
            {
                return NotFound(new { message = "Order not found." });
            }
            return Ok(order);
        }

        [HttpPut("orders/{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] BaynAlSutoor.Application.DTOs.UpdateOrderStatusDto dto)
        {
            var success = await _dashboardService.UpdateOrderStatusAsync(id, dto.Status);
            if (!success)
            {
                return BadRequest(new { message = "Failed to update order status." });
            }
            return Ok(new { message = "Order status updated successfully." });
        }
    }
}
