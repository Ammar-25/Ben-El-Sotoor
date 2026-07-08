using AutoMapper;
using BaynAlSutoor.Application.DTOs;
using BaynAlSutoor.Application.Interfaces;
using BaynAlSutoor.Domain.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaynAlSutoor.Application.Services
{
    public class AuthorService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public AuthorService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<AuthorDto>> GetAllAuthorsAsync()
        {
            var authors = await _unitOfWork.Authors.GetAllAsync();
            
            // Resolve books count dynamically
            foreach (var author in authors)
            {
                var books = await _unitOfWork.Books.FindAsync(b => b.AuthorId == author.Id);
                author.Books = books.ToList();
            }

            return _mapper.Map<IEnumerable<AuthorDto>>(authors);
        }

        public async Task<AuthorDetailsDto?> GetAuthorByIdAsync(int id)
        {
            var author = await _unitOfWork.Authors.GetByIdAsync(id);
            if (author == null) return null;

            var books = await _unitOfWork.Books.FindAsync(b => b.AuthorId == id);
            author.Books = books.ToList();

            return _mapper.Map<AuthorDetailsDto>(author);
        }

        public async Task<IEnumerable<AuthorDto>> GetFeaturedAuthorsAsync(int limit)
        {
            var authors = await _unitOfWork.Authors.GetFeaturedAuthorsAsync(limit);
            return _mapper.Map<IEnumerable<AuthorDto>>(authors);
        }

        public async Task<AuthorDto> CreateAuthorAsync(CreateAuthorDto request)
        {
            var author = _mapper.Map<Author>(request);
            await _unitOfWork.Authors.AddAsync(author);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<AuthorDto>(author);
        }

        public async Task<AuthorDto?> UpdateAuthorAsync(int id, UpdateAuthorDto request)
        {
            var author = await _unitOfWork.Authors.GetByIdAsync(id);
            if (author == null) return null;

            _mapper.Map(request, author);
            _unitOfWork.Authors.Update(author);
            await _unitOfWork.CompleteAsync();

            return _mapper.Map<AuthorDto>(author);
        }

        public async Task<bool> DeleteAuthorAsync(int id)
        {
            var author = await _unitOfWork.Authors.GetByIdAsync(id);
            if (author == null) return false;

            var books = await _unitOfWork.Books.FindAsync(b => b.AuthorId == id);
            foreach (var book in books)
            {
                var reviews = await _unitOfWork.Reviews.FindAsync(r => r.BookId == book.Id);
                if (reviews.Any())
                {
                    _unitOfWork.Reviews.DeleteRange(reviews);
                }
            }
            if (books.Any())
            {
                _unitOfWork.Books.DeleteRange(books);
            }

            _unitOfWork.Authors.Delete(author);
            await _unitOfWork.CompleteAsync();
            return true;
        }
    }
}
