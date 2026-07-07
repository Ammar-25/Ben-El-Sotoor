using AutoMapper;
using BaynAlSutoor.Application.DTOs;
using BaynAlSutoor.Application.Interfaces;
using BaynAlSutoor.Domain.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaynAlSutoor.Application.Services
{
    public class ContactMessageService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ContactMessageService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<ContactMessageDto>> GetAllAsync()
        {
            var messages = await _unitOfWork.ContactMessages.GetAllAsync();
            return _mapper.Map<IEnumerable<ContactMessageDto>>(messages.OrderByDescending(m => m.SentAt));
        }

        public async Task<ContactMessageDto?> GetByIdAsync(int id)
        {
            var message = await _unitOfWork.ContactMessages.GetByIdAsync(id);
            if (message != null && !message.IsRead)
            {
                message.IsRead = true;
                _unitOfWork.ContactMessages.Update(message);
                await _unitOfWork.CompleteAsync();
            }
            return message == null ? null : _mapper.Map<ContactMessageDto>(message);
        }

        public async Task<ContactMessageDto> CreateAsync(CreateContactMessageDto dto)
        {
            var message = _mapper.Map<ContactMessage>(dto);
            message.SentAt = System.DateTime.UtcNow;
            await _unitOfWork.ContactMessages.AddAsync(message);
            await _unitOfWork.CompleteAsync();
            return _mapper.Map<ContactMessageDto>(message);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var message = await _unitOfWork.ContactMessages.GetByIdAsync(id);
            if (message == null) return false;

            _unitOfWork.ContactMessages.Delete(message);
            await _unitOfWork.CompleteAsync();
            return true;
        }
    }
}
