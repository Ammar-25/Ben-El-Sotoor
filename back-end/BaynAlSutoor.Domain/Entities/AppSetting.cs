namespace BaynAlSutoor.Domain.Entities
{
    public class AppSetting
    {
        public int Id { get; set; }
        public string SiteNameAr { get; set; } = string.Empty;
        public string SiteNameEn { get; set; } = string.Empty;
        public string LogoUrl { get; set; } = string.Empty;
        public string ContactEmail { get; set; } = string.Empty;
        public string ContactPhone { get; set; } = string.Empty;
        public string AddressAr { get; set; } = string.Empty;
        public string AddressEn { get; set; } = string.Empty;
        public string FacebookUrl { get; set; } = string.Empty;
        public string TwitterUrl { get; set; } = string.Empty;
        public string InstagramUrl { get; set; } = string.Empty;
    }
}
