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
    public class ContactMessageController : ControllerBase
    {
        private readonly ContactMessageService _contactMessageService;

        public ContactMessageController(ContactMessageService contactMessageService)
        {
            _contactMessageService = contactMessageService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<ContactMessageDto>>> GetAll()
        {
            var messages = await _contactMessageService.GetAllAsync();
            return Ok(messages);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ContactMessageDto>> GetById(int id)
        {
            var message = await _contactMessageService.GetByIdAsync(id);
            if (message == null) return NotFound();
            return Ok(message);
        }

        [HttpPost]
        public async Task<ActionResult<ContactMessageDto>> Create(CreateContactMessageDto dto)
        {
            var created = await _contactMessageService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> Delete(int id)
        {
            var success = await _contactMessageService.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
