using BaynAlSutoor.Application.Interfaces;
using Microsoft.AspNetCore.Hosting;
using System;
using System.IO;
using System.Threading.Tasks;

namespace BaynAlSutoor.Infrastructure.Services
{
    public class FileService : IFileService
    {
        private readonly IWebHostEnvironment _webHostEnvironment;

        public FileService(IWebHostEnvironment webHostEnvironment)
        {
            _webHostEnvironment = webHostEnvironment;
        }

        public async Task<string> SaveFileAsync(Stream fileStream, string fileName, string folderName)
        {
            var webRootPath = _webHostEnvironment.WebRootPath;
            if (string.IsNullOrEmpty(webRootPath))
            {
                // Fallback to current directory if running outside IIS/Kestrel root
                webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            }

            var uploadsFolder = Path.Combine(webRootPath, "uploads", folderName);
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(fileName)}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileDestination = new FileStream(filePath, FileMode.Create))
            {
                await fileStream.CopyToAsync(fileDestination);
            }

            // Return path relative to wwwroot, matching standard web static access
            return $"/uploads/{folderName}/{uniqueFileName}";
        }

        public void DeleteFile(string fileUrl)
        {
            if (string.IsNullOrEmpty(fileUrl)) return;

            var webRootPath = _webHostEnvironment.WebRootPath;
            if (string.IsNullOrEmpty(webRootPath))
            {
                webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            }

            // Clean leading slashes
            var relativePath = fileUrl.TrimStart('/');
            var filePath = Path.Combine(webRootPath, relativePath);

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }
        }
    }
}
