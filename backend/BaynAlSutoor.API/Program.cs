using BaynAlSutoor.Application;
using BaynAlSutoor.Infrastructure;
using BaynAlSutoor.Persistence;
using BaynAlSutoor.API.Middlewares;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

using System.Text;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
<<<<<<< HEAD
var jwtSettings = new BaynAlSutoor.Infrastructure.Services.JwtSettings();
builder.Configuration.GetSection(BaynAlSutoor.Infrastructure.Services.JwtSettings.SectionName).Bind(jwtSettings);

builder.Services.Configure<BaynAlSutoor.Infrastructure.Services.JwtSettings>(
    builder.Configuration.GetSection(BaynAlSutoor.Infrastructure.Services.JwtSettings.SectionName));
=======
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings.GetValue<string>("Secret") ?? "DefaultSuperSecretKey1234567890!";
>>>>>>> origin/main

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
<<<<<<< HEAD
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret)),
=======
        ValidIssuer = jwtSettings.GetValue<string>("Issuer"),
        ValidAudience = jwtSettings.GetValue<string>("Audience"),
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
>>>>>>> origin/main
        RoleClaimType = System.Security.Claims.ClaimTypes.Role
    };
});
builder.Services.AddAuthorization();

builder.Services.AddOpenApiDocument(options =>
{
    options.Title = "BaynAlSutoor API";
    options.AddSecurity("Bearer", Enumerable.Empty<string>(), new NSwag.OpenApiSecurityScheme
    {
        Type = NSwag.OpenApiSecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        Description = "JWT Authorization header using the Bearer scheme."
    });
    options.OperationProcessors.Add(new NSwag.Generation.Processors.Security.AspNetCoreOperationSecurityScopeProcessor("Bearer"));
});


builder.Services.AddControllers();
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices();
builder.Services.AddPersistenceServices(builder.Configuration);

var app = builder.Build();

using var scope = app.Services.CreateScope();
await scope.ServiceProvider.GetRequiredService<DatabaseSeeder>().SeedAsync();

app.UseMiddleware<ExceptionMiddleware>();
app.UseMiddleware<RequestLoggingMiddleware>();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseOpenApi();
    app.UseSwaggerUi();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<AuditLoggingMiddleware>();

app.MapControllers();


app.Run();

public partial class Program { }