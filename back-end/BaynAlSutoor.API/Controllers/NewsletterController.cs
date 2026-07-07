using BaynAlSutoor.Application.DTOs;
using BaynAlSutoor.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BaynAlSutoor.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NewsletterController : ControllerBase
    {
        private readonly NewsletterService _newsletterService;

        public NewsletterController(NewsletterService newsletterService)
        {
            _newsletterService = newsletterService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<NewsletterSubscriberDto>>> GetAll()
        {
            var subscribers = await _newsletterService.GetAllAsync();
            return Ok(subscribers);
        }

        [HttpPost("subscribe")]
        public async Task<ActionResult<NewsletterSubscriberDto>> Subscribe(SubscribeNewsletterDto dto)
        {
            var created = await _newsletterService.SubscribeAsync(dto);
            return Ok(created);
        }

        [HttpPost("unsubscribe")]
        public async Task<ActionResult> Unsubscribe([FromBody] string email)
        {
            var success = await _newsletterService.UnsubscribeAsync(email);
            if (!success) return NotFound();
            return Ok();
        }
    }
}
