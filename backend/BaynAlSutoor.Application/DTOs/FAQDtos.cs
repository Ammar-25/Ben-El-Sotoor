using System.ComponentModel.DataAnnotations;

namespace BaynAlSutoor.Application.DTOs
{
    public class FAQDto
    {
        public int Id { get; set; }
        public string QuestionAr { get; set; } = string.Empty;
        public string QuestionEn { get; set; } = string.Empty;
        public string AnswerAr { get; set; } = string.Empty;
        public string AnswerEn { get; set; } = string.Empty;
    }

    public class CreateFAQDto
    {
        [Required]
        public string QuestionAr { get; set; } = string.Empty;
        [Required]
        public string QuestionEn { get; set; } = string.Empty;
        [Required]
        public string AnswerAr { get; set; } = string.Empty;
        [Required]
        public string AnswerEn { get; set; } = string.Empty;
    }

    public class UpdateFAQDto : CreateFAQDto
    {
        public int Id { get; set; }
    }
}
