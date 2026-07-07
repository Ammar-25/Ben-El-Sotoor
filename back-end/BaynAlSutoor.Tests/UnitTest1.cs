using Microsoft.Extensions.Configuration;
using System.IO;
using Xunit;

namespace BaynAlSutoor.Tests;

public class UnitTest1
{
    [Fact]
    public void TestConfig()
    {
        var builder = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false);
        var config = builder.Build();
        
        var jwtSettings = config.GetSection("JwtSettings");
        var secretKey = jwtSettings.GetValue<string>("Secret");
        
        Assert.Equal("SuperSecretKeyForBaynAlSutoorProjectThatIsVeryLongAndSecure!", secretKey);
    }
}
