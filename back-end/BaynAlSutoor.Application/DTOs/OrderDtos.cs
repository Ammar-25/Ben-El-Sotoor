using System;
using System.Collections.Generic;

namespace BaynAlSutoor.Application.DTOs
{
    public class CartItemDto
    {
        public int Id { get; set; }
        public int Qty { get; set; }
    }

    public class CheckoutRequestDto
    {
        public List<CartItemDto> Items { get; set; } = new();
    }

    public class OrderItemDto
    {
        public int Id { get; set; }
        public int BookId { get; set; }
        public LocalizedStringDto BookTitle { get; set; } = new();
        public string BookCover { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }

    public class OrderDto
    {
        public int Id { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal Subtotal { get; set; }
        public decimal Tax { get; set; }
        public decimal Total { get; set; }
        public string Status { get; set; } = string.Empty;
        public List<OrderItemDto> OrderItems { get; set; } = new();
    }

    public class OrderConfirmationDto
    {
        public int OrderId { get; set; }
        public decimal Total { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class OrderAdminDto
    {
        public int Id { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public decimal Total { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class PaginatedOrderDto
    {
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int Limit { get; set; }
        public int TotalPages { get; set; }
        public List<OrderAdminDto> Orders { get; set; } = new();
    }

    public class OrderDetailsAdminDto : OrderAdminDto
    {
        public List<OrderItemDto> OrderItems { get; set; } = new();
    }
}
