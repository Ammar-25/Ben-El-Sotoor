using AutoMapper;
using BaynAlSutoor.Application.DTOs;
using BaynAlSutoor.Application.Interfaces;
using BaynAlSutoor.Domain.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaynAlSutoor.Application.Services
{
    public class FAQService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public FAQService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<FAQDto>> GetAllAsync()
        {
            var faqs = await _unitOfWork.FAQs.GetAllAsync();
            return _mapper.Map<IEnumerable<FAQDto>>(faqs.OrderBy(f => f.Id));
        }

        public async Task<FAQDto?> GetByIdAsync(int id)
        {
            var faq = await _unitOfWork.FAQs.GetByIdAsync(id);
            return faq == null ? null : _mapper.Map<FAQDto>(faq);
        }

        public async Task<FAQDto> CreateAsync(CreateFAQDto dto)
        {
            var faq = _mapper.Map<FAQ>(dto);
            await _unitOfWork.FAQs.AddAsync(faq);
            await _unitOfWork.CompleteAsync();
            return _mapper.Map<FAQDto>(faq);
        }

        public async Task<FAQDto?> UpdateAsync(int id, UpdateFAQDto dto)
        {
            var faq = await _unitOfWork.FAQs.GetByIdAsync(id);
            if (faq == null) return null;

            _mapper.Map(dto, faq);
            _unitOfWork.FAQs.Update(faq);
            await _unitOfWork.CompleteAsync();
            return _mapper.Map<FAQDto>(faq);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var faq = await _unitOfWork.FAQs.GetByIdAsync(id);
            if (faq == null) return false;

            _unitOfWork.FAQs.Delete(faq);
            await _unitOfWork.CompleteAsync();
            return true;
        }
    }
}
