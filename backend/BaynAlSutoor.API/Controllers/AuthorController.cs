using BaynAlSutoor.Application.DTOs;
using BaynAlSutoor.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BaynAlSutoor.API.Controllers
{
    [ApiController]
    [Route("api/authors")]
    public class AuthorController : ControllerBase
    {
        private readonly AuthorService _authorService;

        public AuthorController(AuthorService authorService)
        {
            _authorService = authorService;
        }

        // =========================
        // GET ALL AUTHORS
        // =========================
        [HttpGet]
        public async Task<IActionResult> GetAllAuthors()
        {
            var authors = await _authorService.GetAllAuthorsAsync();
            return Ok(authors);
        }

        // =========================
        // GET AUTHOR BY ID
        // =========================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAuthor(int id)
        {
            var author = await _authorService.GetAuthorByIdAsync(id);

            if (author == null)
                return NotFound(new { message = "Author not found" });

            return Ok(author);
        }

        // =========================
        // GET FEATURED AUTHORS
        // =========================
        [HttpGet("featured")]
        public async Task<IActionResult> GetFeatured([FromQuery] int limit = 4)
        {
            var authors = await _authorService.GetFeaturedAuthorsAsync(limit);
            return Ok(authors);
        }

        // =========================
        // CREATE AUTHOR (ADMIN ONLY)
        // =========================
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateAuthor([FromBody] CreateAuthorDto request)
        {
            var author = await _authorService.CreateAuthorAsync(request);

            return CreatedAtAction(
                nameof(GetAuthor),
                new { id = author.Id },
                author
            );
        }

        // =========================
        // UPDATE AUTHOR (FIXED FLOW)
        // =========================
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateAuthor(int id, [FromBody] UpdateAuthorDto request)
        {
            if (request == null)
                return BadRequest(new { message = "Invalid request body" });

            var updatedAuthor = await _authorService.UpdateAuthorAsync(id, request);

            if (updatedAuthor == null)
                return NotFound(new { message = "Author not found" });

            return Ok(updatedAuthor);
        }

        // =========================
        // DELETE AUTHOR
        // =========================
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAuthor(int id)
        {
            var result = await _authorService.DeleteAuthorAsync(id);

            if (!result)
                return NotFound(new { message = "Author not found" });

            return NoContent();
        }
    }
}