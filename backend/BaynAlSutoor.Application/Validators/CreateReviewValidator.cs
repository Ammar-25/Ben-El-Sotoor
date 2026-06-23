using FluentValidation;
using BaynAlSutoor.Application.DTOs;

namespace BaynAlSutoor.Application.Validators
{
    public class CreateReviewValidator : AbstractValidator<CreateReviewDto>
    {
        public CreateReviewValidator()
        {
            RuleFor(x => x.BookId)
                .GreaterThan(0).WithMessage("A valid Book ID is required.");

            RuleFor(x => x.Rating)
                .InclusiveBetween(1, 5).WithMessage("Rating must be between 1 and 5 stars.");

            RuleFor(x => x.TextAr)
                .NotEmpty().WithMessage("Arabic review text is required.");

            RuleFor(x => x.TextEn)
                .NotEmpty().WithMessage("English review text is required.");
        }
    }
}
