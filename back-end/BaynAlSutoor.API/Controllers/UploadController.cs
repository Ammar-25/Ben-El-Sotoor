using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BaynAlSutoor.API.Controllers
{
    [ApiController]
    [Route("api/upload")]
    [Authorize(Roles = "Admin")]
    public class UploadController : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded" });

            // Path to front-end assets (from BaynAlSutoor.API directory)
            var uploadsFolderPath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "front-end", "assets", "images", "books"));
            
            if (!Directory.Exists(uploadsFolderPath))
                Directory.CreateDirectory(uploadsFolderPath);

            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            var filePath = Path.Combine(uploadsFolderPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return Ok(new { url = $"assets/images/books/{fileName}" });
        }
    }
}
