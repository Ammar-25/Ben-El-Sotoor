using AutoMapper;
using BaynAlSutoor.Domain.Entities;
using BaynAlSutoor.Application.DTOs;
using System.Collections.Generic;
using System.Text.Json;

namespace BaynAlSutoor.Application.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Book Mappings
            CreateMap<Book, BookDto>()
                .ForMember(dest => dest.Title, opt => opt.MapFrom(src => new LocalizedStringDto { Ar = src.TitleAr, En = src.TitleEn }))
                .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Category.NameEn))
                .ForMember(dest => dest.Description, opt => opt.MapFrom(src => new LocalizedStringDto { Ar = src.DescriptionAr, En = src.DescriptionEn }))
                .ForMember(dest => dest.Publisher, opt => opt.MapFrom(src => new LocalizedStringDto { Ar = src.PublisherAr, En = src.PublisherEn }))
                .ForMember(dest => dest.BookLanguage, opt => opt.MapFrom(src => new LocalizedStringDto { Ar = src.LanguageAr, En = src.LanguageEn }))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt.ToString("yyyy-MM-dd")));

            CreateMap<Book, BookDetailsDto>()
                .IncludeBase<Book, BookDto>()
                .ForMember(dest => dest.Author, opt => opt.MapFrom(src => src.Author))
                .ForMember(dest => dest.Reviews, opt => opt.MapFrom(src => src.Reviews));

            CreateMap<CreateBookDto, Book>()
                .ForMember(dest => dest.Category, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => System.DateTime.UtcNow));

            CreateMap<UpdateBookDto, Book>()
                .ForMember(dest => dest.Category, opt => opt.Ignore());

            // Author Mappings
            CreateMap<Author, AuthorDto>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => new LocalizedStringDto { Ar = src.NameAr, En = src.NameEn }))
                .ForMember(dest => dest.Bio, opt => opt.MapFrom(src => new LocalizedStringDto { Ar = src.BioAr, En = src.BioEn }))
                .ForMember(dest => dest.Quote, opt => opt.MapFrom(src => new LocalizedStringDto { Ar = src.QuoteAr, En = src.QuoteEn }))
                .ForMember(dest => dest.BooksCount, opt => opt.MapFrom(src => src.Books.Count))
                .ForMember(dest => dest.Achievements, opt => opt.MapFrom(src => DeserializeAchievements(src.AchievementsJson)));

            CreateMap<Author, AuthorDetailsDto>()
                .IncludeBase<Author, AuthorDto>()
                .ForMember(dest => dest.Books, opt => opt.MapFrom(src => src.Books));

            CreateMap<CreateAuthorDto, Author>()
                .ForMember(dest => dest.AchievementsJson, opt => opt.MapFrom(src => SerializeAchievements(src.AchievementsAr, src.AchievementsEn)));

            CreateMap<UpdateAuthorDto, Author>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.AchievementsJson,
                    opt => opt.MapFrom(src =>
                        SerializeAchievements(src.AchievementsAr, src.AchievementsEn)));

            // Review Mappings
            CreateMap<Review, ReviewDto>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => new LocalizedStringDto { Ar = src.User.Name, En = src.User.Name }))
                .ForMember(dest => dest.Text, opt => opt.MapFrom(src => new LocalizedStringDto { Ar = src.TextAr, En = src.TextEn }))
                .ForMember(dest => dest.Date, opt => opt.MapFrom(src => src.Date.ToString("yyyy-MM-dd")));

            // Subscription Plan Mappings
            CreateMap<SubscriptionPlan, SubscriptionPlanDto>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => new LocalizedStringDto { Ar = src.NameAr, En = src.NameEn }))
                .ForMember(dest => dest.PriceLabel, opt => opt.MapFrom(src => new LocalizedStringDto { Ar = src.PriceLabelAr, En = src.PriceLabelEn }))
                .ForMember(dest => dest.Period, opt => opt.MapFrom(src => new LocalizedStringDto { Ar = src.PeriodAr, En = src.PeriodEn }))
                .ForMember(dest => dest.FeatureKeys, opt => opt.MapFrom(src => DeserializeList(src.FeatureKeysJson)));

            // User Subscription Mappings
            CreateMap<UserSubscription, UserSubscriptionDto>()
                .ForMember(dest => dest.PlanNameAr, opt => opt.MapFrom(src => src.Plan.NameAr))
                .ForMember(dest => dest.PlanNameEn, opt => opt.MapFrom(src => src.Plan.NameEn));

            // Order Mappings
            CreateMap<Order, OrderDto>()
                .ForMember(dest => dest.OrderItems, opt => opt.MapFrom(src => src.OrderItems));

            CreateMap<OrderItem, OrderItemDto>()
                .ForMember(dest => dest.BookTitle, opt => opt.MapFrom(src => new LocalizedStringDto { Ar = src.Book.TitleAr, En = src.Book.TitleEn }))
                .ForMember(dest => dest.BookCover, opt => opt.MapFrom(src => src.Book.Cover));

            // Audit Log Mappings
            CreateMap<AuditLog, AuditLogDto>()
                .ForMember(dest => dest.UserEmail, opt => opt.MapFrom(src => "")); // Will be resolved manually if needed

            // Category Mappings
            CreateMap<Category, CategoryDto>();
            CreateMap<CreateCategoryDto, Category>();
            CreateMap<UpdateCategoryDto, Category>();

            // FAQ Mappings
            CreateMap<FAQ, FAQDto>();
            CreateMap<CreateFAQDto, FAQ>();
            CreateMap<UpdateFAQDto, FAQ>();

            // ContactMessage Mappings
            CreateMap<ContactMessage, ContactMessageDto>();
            CreateMap<CreateContactMessageDto, ContactMessage>();

            // Payment Mappings
            CreateMap<Payment, PaymentDto>();
            CreateMap<CreatePaymentDto, Payment>();

            // Role Mappings
            CreateMap<Role, RoleDto>();
            CreateMap<CreateRoleDto, Role>();
            CreateMap<UpdateRoleDto, Role>();

            // Newsletter Mappings
            CreateMap<NewsletterSubscriber, NewsletterSubscriberDto>();
            CreateMap<User, UserProfileDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email));
        }

        private static LocalizedListDto DeserializeAchievements(string json)
        {
            if (string.IsNullOrEmpty(json)) return new LocalizedListDto();
            try
            {
                return JsonSerializer.Deserialize<LocalizedListDto>(json) ?? new LocalizedListDto();
            }
            catch
            {
                return new LocalizedListDto();
            }
        }

        private static string SerializeAchievements(List<string> ar, List<string> en)
        {
            var dto = new LocalizedListDto { Ar = ar, En = en };
            return JsonSerializer.Serialize(dto);
        }

        private static List<string> DeserializeList(string json)
        {
            if (string.IsNullOrEmpty(json)) return new List<string>();
            try
            {
                return JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>();
            }
            catch
            {
                return new List<string>();
            }
        }
    }
}
