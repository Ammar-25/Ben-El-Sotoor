using AutoMapper;
using BaynAlSutoor.Application.DTOs;
using BaynAlSutoor.Application.Interfaces;
using BaynAlSutoor.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaynAlSutoor.Application.Services
{
    public class OrderService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public OrderService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<OrderConfirmationDto?> CheckoutAsync(int userId, CheckoutRequestDto request)
        {
            if (request.Items == null || !request.Items.Any())
            {
                return null;
            }

            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null) return null;

            decimal subtotal = 0;
            var orderItems = new List<OrderItem>();

            foreach (var cartItem in request.Items)
            {
                var book = await _unitOfWork.Books.GetByIdAsync(cartItem.Id);
                if (book == null) continue;

                subtotal += book.Price * cartItem.Qty;

                orderItems.Add(new OrderItem
                {
                    BookId = book.Id,
                    Quantity = cartItem.Qty,
                    UnitPrice = book.Price
                });

                // Add to user reading progress (starting at 0%) if not already present
                var existingProgress = (await _unitOfWork.UserReadingProgresses
                    .FindAsync(p => p.UserId == userId && p.BookId == book.Id)).FirstOrDefault();

                if (existingProgress == null)
                {
                    var progress = new UserReadingProgress
                    {
                        UserId = userId,
                        BookId = book.Id,
                        ProgressPercentage = 0
                    };
                    await _unitOfWork.UserReadingProgresses.AddAsync(progress);
                }
            }

            if (!orderItems.Any()) return null;

            decimal tax = subtotal * 0.14m; // 14% Tax
            decimal total = subtotal + tax;

            var order = new Order
            {
                UserId = userId,
                OrderDate = DateTime.UtcNow,
                Subtotal = subtotal,
                Tax = tax,
                Total = total,
                OrderItems = orderItems
            };

            await _unitOfWork.Orders.AddAsync(order);

            // Audit log
            var log = new AuditLog
            {
                UserId = userId,
                Action = "Order Placed",
                EntityName = "Order",
                EntityId = order.Id.ToString(),
                Timestamp = DateTime.UtcNow,
                Details = $"Order placed by user. Items: {orderItems.Count}. Total: {total} EGP"
            };
            await _unitOfWork.AuditLogs.AddAsync(log);

            await _unitOfWork.CompleteAsync();

            return new OrderConfirmationDto
            {
                OrderId = order.Id,
                Total = total,
                Message = "Your order was placed successfully!"
            };
        }

        public async Task<IEnumerable<OrderDto>> GetMyOrdersAsync(int userId)
        {
            var orders = await _unitOfWork.Orders.FindAsync(o => o.UserId == userId);
            
            var orderList = orders.ToList();
            foreach (var order in orderList)
            {
                var items = await _unitOfWork.OrderItems.FindAsync(oi => oi.OrderId == order.Id);
                order.OrderItems = items.ToList();

                foreach (var item in order.OrderItems)
                {
                    item.Book = await _unitOfWork.Books.GetByIdAsync(item.BookId) ?? new Book();
                }
            }

            return _mapper.Map<IEnumerable<OrderDto>>(orderList.OrderByDescending(o => o.OrderDate));
        }
    }
}
