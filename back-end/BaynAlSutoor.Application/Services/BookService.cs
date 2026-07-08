using AutoMapper;
using BaynAlSutoor.Application.DTOs;
using BaynAlSutoor.Application.Interfaces;
using BaynAlSutoor.Domain.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaynAlSutoor.Application.Services
{
    public class BookService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public BookService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<BookDto>> SearchBooksAsync(
            string? q, 
            string category, 
            string lang, 
            decimal maxPrice, 
            string sort, 
            int page, 
            int size)
        {
            var books = await _unitOfWork.Books.SearchBooksAsync(q, category, lang, maxPrice, sort);
            
            // Apply pagination
            var pagedBooks = books
                .Skip((page - 1) * size)
                .Take(size);

            return _mapper.Map<IEnumerable<BookDto>>(pagedBooks);
        }

        public async Task<int> SearchBooksCountAsync(string? q, string category, string lang, decimal maxPrice)
        {
            var books = await _unitOfWork.Books.SearchBooksAsync(q, category, lang, maxPrice, "newest");
            return books.Count();
        }

        public async Task<BookDetailsDto?> GetBookByIdAsync(int id)
        {
            var book = await _unitOfWork.Books.GetByIdAsync(id);
            if (book == null) return null;

            // Load Author details and Reviews manually if EF core lazy load is not set
            var author = await _unitOfWork.Authors.GetByIdAsync(book.AuthorId);
            book.Author = author!;

            var category = await _unitOfWork.Categories.GetByIdAsync(book.CategoryId);
            book.Category = category!;

            var reviews = await _unitOfWork.Reviews.FindAsync(r => r.BookId == id);
            book.Reviews = reviews.ToList();
            
            // Force user load for review usernames
            foreach (var review in book.Reviews)
            {
                review.User = await _unitOfWork.Users.GetByIdAsync(review.UserId) ?? new User { Name = "Anonymous" };
            }

            return _mapper.Map<BookDetailsDto>(book);
        }

        public async Task<IEnumerable<BookDto>> GetFeaturedBooksAsync(int limit)
        {
            var books = await _unitOfWork.Books.GetFeaturedBooksAsync(limit);
            return _mapper.Map<IEnumerable<BookDto>>(books);
        }

        public async Task<IEnumerable<BookDto>> GetLatestBooksAsync(string range, int limit)
        {
            var books = await _unitOfWork.Books.GetLatestBooksAsync(range, limit);
            return _mapper.Map<IEnumerable<BookDto>>(books);
        }

        public async Task<IEnumerable<BookDto>> GetSearchSuggestionsAsync(string q, int limit)
        {
            var books = await _unitOfWork.Books.SearchBooksAsync(q, "all", "all", decimal.MaxValue, "newest");
            var suggestions = books.Take(limit);
            return _mapper.Map<IEnumerable<BookDto>>(suggestions);
        }

        public async Task<BookDto> CreateBookAsync(CreateBookDto request)
        {
            var book = _mapper.Map<Book>(request);
            
            // Resolve Category ID
            var category = (await _unitOfWork.Categories.FindAsync(c => c.NameEn.ToLower() == request.Category.ToLower())).FirstOrDefault();
            book.CategoryId = category?.Id ?? 1;

            await _unitOfWork.Books.AddAsync(book);
            await _unitOfWork.CompleteAsync();

            // Populate category for mapping
            book.Category = category ?? await _unitOfWork.Categories.GetByIdAsync(book.CategoryId) ?? new Category();

            return _mapper.Map<BookDto>(book);
        }

        public async Task<BookDto?> UpdateBookAsync(int id, UpdateBookDto request)
        {
            var book = await _unitOfWork.Books.GetByIdAsync(id);
            if (book == null) return null;

            _mapper.Map(request, book);

            // Resolve Category ID
            var category = (await _unitOfWork.Categories.FindAsync(c => c.NameEn.ToLower() == request.Category.ToLower())).FirstOrDefault();
            book.CategoryId = category?.Id ?? 1;

            _unitOfWork.Books.Update(book);
            await _unitOfWork.CompleteAsync();

            // Populate category for mapping
            book.Category = category ?? await _unitOfWork.Categories.GetByIdAsync(book.CategoryId) ?? new Category();

            return _mapper.Map<BookDto>(book);
        }

        public async Task<bool> DeleteBookAsync(int id)
        {
            var book = await _unitOfWork.Books.GetByIdAsync(id);
            if (book == null) return false;

            var reviews = await _unitOfWork.Reviews.FindAsync(r => r.BookId == id);
            if (reviews != null && reviews.Any())
            {
                _unitOfWork.Reviews.DeleteRange(reviews);
            }

            _unitOfWork.Books.Delete(book);
            await _unitOfWork.CompleteAsync();
            return true;
        }
    }
}
