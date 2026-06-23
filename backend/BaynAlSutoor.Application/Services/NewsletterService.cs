using AutoMapper;
using BaynAlSutoor.Application.DTOs;
using BaynAlSutoor.Application.Interfaces;
using BaynAlSutoor.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BaynAlSutoor.Application.Services
{
    public class NewsletterService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public NewsletterService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<NewsletterSubscriberDto>> GetAllAsync()
        {
            var subscribers = await _unitOfWork.NewsletterSubscribers.GetAllAsync();
            return _mapper.Map<IEnumerable<NewsletterSubscriberDto>>(subscribers);
        }

        public async Task<NewsletterSubscriberDto> SubscribeAsync(SubscribeNewsletterDto dto)
        {
            var subscriber = new NewsletterSubscriber
            {
                Email = dto.Email,
                SubscribedAt = System.DateTime.UtcNow
            };
            await _unitOfWork.NewsletterSubscribers.AddAsync(subscriber);
            await _unitOfWork.CompleteAsync();
            return _mapper.Map<NewsletterSubscriberDto>(subscriber);
        }
        
        public async Task<bool> UnsubscribeAsync(string email)
        {
            var subscriber = (await _unitOfWork.NewsletterSubscribers.FindAsync(s => s.Email == email)).FirstOrDefault();
            if (subscriber == null) return false;
            
            _unitOfWork.NewsletterSubscribers.Delete(subscriber);
            await _unitOfWork.CompleteAsync();
            return true;
        }
    }
}
