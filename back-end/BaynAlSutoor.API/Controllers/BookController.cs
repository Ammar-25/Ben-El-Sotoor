using BaynAlSutoor.Application.DTOs;
using BaynAlSutoor.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BaynAlSutoor.API.Controllers
{
    [ApiController]
    [Route("api/books")]
    public class BookController : ControllerBase
    {
        private readonly BookService _bookService;

        public BookController(BookService bookService)
        {
            _bookService = bookService;
        }

        [HttpGet]
        public async Task<IActionResult> SearchBooks([FromQuery] string? q, [FromQuery] string? category, [FromQuery] string? lang, [FromQuery] decimal maxPrice = 0, [FromQuery] string sort = "newest", [FromQuery] int page = 1, [FromQuery] int pageSize = 12)
        {
            var books = await _bookService.SearchBooksAsync(q, category ?? "", lang ?? "", maxPrice, sort, page, pageSize);
            var count = await _bookService.SearchBooksCountAsync(q, category ?? "", lang ?? "", maxPrice);

            return Ok(new { data = books, total = count });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetBook(int id)
        {
            var book = await _bookService.GetBookByIdAsync(id);
            if (book == null) return NotFound();
            return Ok(book);
        }

        [HttpGet("featured")]
        public async Task<IActionResult> GetFeatured([FromQuery] int limit = 6)
        {
            var books = await _bookService.GetFeaturedBooksAsync(limit);
            return Ok(books);
        }

        [HttpGet("latest")]
        public async Task<IActionResult> GetLatest([FromQuery] string range = "30days", [FromQuery] int limit = 10)
        {
            var books = await _bookService.GetLatestBooksAsync(range, limit);
            return Ok(books);
        }

        [HttpGet("suggestions")]
        public async Task<IActionResult> GetSuggestions([FromQuery] string q, [FromQuery] int limit = 5)
        {
            var books = await _bookService.GetSearchSuggestionsAsync(q, limit);
            return Ok(books);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateBook([FromBody] CreateBookDto request)
        {
            var book = await _bookService.CreateBookAsync(request);
            return CreatedAtAction(nameof(GetBook), new { id = book.Id }, book);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateBook(int id, [FromBody] UpdateBookDto request)
        {
            var book = await _bookService.UpdateBookAsync(id, request);
            if (book == null) return NotFound();
            return Ok(book);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteBook(int id)
        {
            var result = await _bookService.DeleteBookAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
