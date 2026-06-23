using AutoMapper;
using BaynAlSutoor.Application.DTOs;
using BaynAlSutoor.Application.Interfaces;
using BaynAlSutoor.Domain.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaynAlSutoor.Application.Services
{
    public class PaymentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public PaymentService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<PaymentDto>> GetAllAsync()
        {
            var payments = await _unitOfWork.Payments.GetAllAsync();
            return _mapper.Map<IEnumerable<PaymentDto>>(payments.OrderByDescending(p => p.CreatedAt));
        }

        public async Task<PaymentDto?> GetByIdAsync(int id)
        {
            var payment = await _unitOfWork.Payments.GetByIdAsync(id);
            return payment == null ? null : _mapper.Map<PaymentDto>(payment);
        }

        public async Task<PaymentDto> CreateAsync(CreatePaymentDto dto)
        {
            var payment = _mapper.Map<Payment>(dto);
            payment.CreatedAt = System.DateTime.UtcNow;
            await _unitOfWork.Payments.AddAsync(payment);
            await _unitOfWork.CompleteAsync();
            return _mapper.Map<PaymentDto>(payment);
        }
    }
}
