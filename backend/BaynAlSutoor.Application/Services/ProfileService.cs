using AutoMapper;
using BaynAlSutoor.Application.DTOs;
using BaynAlSutoor.Application.Interfaces;
using BaynAlSutoor.Domain.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaynAlSutoor.Application.Services
{
    public class ProfileService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ProfileService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<ReadingProgressDto>> GetReadingProgressAsync(int userId)
        {
            var progress = await _unitOfWork.UserReadingProgresses.FindAsync(p => p.UserId == userId);
            
            var progressList = progress.ToList();
            foreach (var item in progressList)
            {
                item.Book = await _unitOfWork.Books.GetByIdAsync(item.BookId) ?? new Book();
            }

            return progressList.Select(p => new ReadingProgressDto
            {
                BookId = p.BookId,
                BookTitle = new LocalizedStringDto { Ar = p.Book.TitleAr, En = p.Book.TitleEn },
                ProgressPercentage = p.ProgressPercentage
            });
        }

        public async Task<ReadingProgressDto?> UpdateReadingProgressAsync(int userId, UpdateReadingProgressDto request)
        {
            var book = await _unitOfWork.Books.GetByIdAsync(request.BookId);
            if (book == null) return null;

            var progress = (await _unitOfWork.UserReadingProgresses
                .FindAsync(p => p.UserId == userId && p.BookId == request.BookId)).FirstOrDefault();

            if (progress == null)
            {
                progress = new UserReadingProgress
                {
                    UserId = userId,
                    BookId = request.BookId,
                    ProgressPercentage = request.ProgressPercentage
                };
                await _unitOfWork.UserReadingProgresses.AddAsync(progress);
            }
            else
            {
                progress.ProgressPercentage = request.ProgressPercentage;
                _unitOfWork.UserReadingProgresses.Update(progress);
            }

            await _unitOfWork.CompleteAsync();

            return new ReadingProgressDto
            {
                BookId = progress.BookId,
                BookTitle = new LocalizedStringDto { Ar = book.TitleAr, En = book.TitleEn },
                ProgressPercentage = progress.ProgressPercentage
            };
        }

        public async Task<IEnumerable<BookDto>> GetFavoritesAsync(int userId)
        {
            var favs = await _unitOfWork.UserFavorites.FindAsync(f => f.UserId == userId);
            var books = new List<Book>();

            foreach (var fav in favs)
            {
                var book = await _unitOfWork.Books.GetByIdAsync(fav.BookId);
                if (book != null)
                {
                    book.Author = await _unitOfWork.Authors.GetByIdAsync(book.AuthorId) ?? new Author();
                    books.Add(book);
                }
            }

            return _mapper.Map<IEnumerable<BookDto>>(books);
        }

        public async Task<FavoriteStatusDto?> ToggleFavoriteAsync(int userId, int bookId)
        {
            var book = await _unitOfWork.Books.GetByIdAsync(bookId);
            if (book == null) return null;

            var fav = (await _unitOfWork.UserFavorites.FindAsync(f => f.UserId == userId && f.BookId == bookId)).FirstOrDefault();
            bool isFav;

            if (fav != null)
            {
                _unitOfWork.UserFavorites.Delete(fav);
                isFav = false;
            }
            else
            {
                fav = new UserFavorite { UserId = userId, BookId = bookId };
                await _unitOfWork.UserFavorites.AddAsync(fav);
                isFav = true;
            }

            await _unitOfWork.CompleteAsync();

            return new FavoriteStatusDto
            {
                BookId = bookId,
                IsFavorite = isFav
            };
        }

        public async Task<IEnumerable<BookDto>> GetPurchasedBooksAsync(int userId)
        {
            // Books are purchased if they appear in successful orders for the user
            var orders = await _unitOfWork.Orders.FindAsync(o => o.UserId == userId);
            var bookIds = new HashSet<int>();

            foreach (var order in orders)
            {
                var items = await _unitOfWork.OrderItems.FindAsync(oi => oi.OrderId == order.Id);
                foreach (var item in items)
                {
                    bookIds.Add(item.BookId);
                }
            }

            var books = new List<Book>();
            foreach (var bookId in bookIds)
            {
                var book = await _unitOfWork.Books.GetByIdAsync(bookId);
                if (book != null)
                {
                    book.Author = await _unitOfWork.Authors.GetByIdAsync(book.AuthorId) ?? new Author();
                    books.Add(book);
                }
            }

            return _mapper.Map<IEnumerable<BookDto>>(books);
        }
    }
}
