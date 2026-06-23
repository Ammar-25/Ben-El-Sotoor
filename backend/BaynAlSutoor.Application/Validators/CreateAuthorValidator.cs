using FluentValidation;
using BaynAlSutoor.Application.DTOs;

namespace BaynAlSutoor.Application.Validators
{
    public class CreateAuthorValidator : AbstractValidator<CreateAuthorDto>
    {
        public CreateAuthorValidator()
        {
            RuleFor(x => x.NameAr)
                .NotEmpty().WithMessage("Arabic name is required.")
                .MaximumLength(200).WithMessage("Arabic name must not exceed 200 characters.");

            RuleFor(x => x.NameEn)
                .NotEmpty().WithMessage("English name is required.")
                .MaximumLength(200).WithMessage("English name must not exceed 200 characters.");

            RuleFor(x => x.BioAr)
                .NotEmpty().WithMessage("Arabic biography is required.");

            RuleFor(x => x.BioEn)
                .NotEmpty().WithMessage("English biography is required.");

            RuleFor(x => x.Followers)
                .GreaterThanOrEqualTo(0).WithMessage("Followers count cannot be negative.");
        }
    }
}
