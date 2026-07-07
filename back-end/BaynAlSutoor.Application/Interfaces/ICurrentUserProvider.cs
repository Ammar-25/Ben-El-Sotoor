namespace BaynAlSutoor.Application.Interfaces
{
    public interface ICurrentUserProvider
    {
        int? UserId { get; }
        string? Email { get; }
    }
}
