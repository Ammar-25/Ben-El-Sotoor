namespace BaynAlSutoor.Domain.Entities
{
    public class FAQ
    {
        public int Id { get; set; }
        public string QuestionAr { get; set; } = string.Empty;
        public string QuestionEn { get; set; } = string.Empty;
        public string AnswerAr { get; set; } = string.Empty;
        public string AnswerEn { get; set; } = string.Empty;
    }
}
