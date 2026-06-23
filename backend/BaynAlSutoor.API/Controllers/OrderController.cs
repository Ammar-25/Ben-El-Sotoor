using BaynAlSutoor.Application.DTOs;
using BaynAlSutoor.Application.Interfaces;
using BaynAlSutoor.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BaynAlSutoor.API.Controllers
{
    [ApiController]
    [Route("api/orders")]
    [Authorize]
    public class OrderController : ControllerBase
    {
        private readonly OrderService _orderService;
        private readonly ICurrentUserProvider _currentUserProvider;

        public OrderController(OrderService orderService, ICurrentUserProvider currentUserProvider)
        {
            _orderService = orderService;
            _currentUserProvider = currentUserProvider;
        }

        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout([FromBody] CheckoutRequestDto request)
        {
            var userId = _currentUserProvider.UserId;
            if (userId == null) return Unauthorized();

            var result = await _orderService.CheckoutAsync(userId.Value, request);
            if (result == null) return BadRequest("Checkout failed.");

            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetMyOrders()
        {
            var userId = _currentUserProvider.UserId;
            if (userId == null) return Unauthorized();

            var orders = await _orderService.GetMyOrdersAsync(userId.Value);
            return Ok(orders);
        }
    }
}
