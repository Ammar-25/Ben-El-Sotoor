using FluentValidation;
using BaynAlSutoor.Application.DTOs;

namespace BaynAlSutoor.Application.Validators
{
    public class CreateBookValidator : AbstractValidator<CreateBookDto>
    {
        public CreateBookValidator()
        {
            RuleFor(x => x.TitleAr)
                .NotEmpty().WithMessage("Arabic title is required.")
                .MaximumLength(200).WithMessage("Arabic title must not exceed 200 characters.");

            RuleFor(x => x.TitleEn)
                .NotEmpty().WithMessage("English title is required.")
                .MaximumLength(200).WithMessage("English title must not exceed 200 characters.");

            RuleFor(x => x.AuthorId)
                .GreaterThan(0).WithMessage("A valid Author ID is required.");

            RuleFor(x => x.Category)
                .NotEmpty().WithMessage("Category is required.");

            RuleFor(x => x.Price)
                .GreaterThanOrEqualTo(0).WithMessage("Price must be a positive value.");

            RuleFor(x => x.Pages)
                .GreaterThan(0).WithMessage("Pages must be greater than zero.");

            RuleFor(x => x.Year)
                .ExclusiveBetween(1000, 2100).WithMessage("A valid publication year is required.");
        }
    }
}
