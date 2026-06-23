using System.IO;
using System.Threading.Tasks;

namespace BaynAlSutoor.Application.Interfaces
{
    public interface IFileService
    {
        Task<string> SaveFileAsync(Stream fileStream, string fileName, string folderName);
        void DeleteFile(string fileUrl);
    }
}
