using BaynAlSutoor.Application.Interfaces;
using BaynAlSutoor.Domain.Entities;
<<<<<<< HEAD
using Microsoft.Extensions.Options;
=======
using Microsoft.Extensions.Configuration;
>>>>>>> origin/main
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace BaynAlSutoor.Infrastructure.Services
{
    public class JwtTokenGenerator : IJwtTokenGenerator
    {
<<<<<<< HEAD
        private readonly JwtSettings _jwtSettings;

        public JwtTokenGenerator(IOptions<JwtSettings> jwtSettings)
        {
            _jwtSettings = jwtSettings.Value;
=======
        private readonly IConfiguration _configuration;

        public JwtTokenGenerator(IConfiguration configuration)
        {
            _configuration = configuration;
>>>>>>> origin/main
        }

        public string GenerateToken(User user, IEnumerable<string> roles, IEnumerable<string> permissions)
        {
<<<<<<< HEAD
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
=======
            var secretKey = _configuration["JwtSettings:Secret"] ?? "BaynAlSutoorSuperSecretSecurityKeyThatNeedsToBeLongEnough";
            var issuer = _configuration["JwtSettings:Issuer"] ?? "BaynAlSutoorAPI";
            var audience = _configuration["JwtSettings:Audience"] ?? "BaynAlSutoorClient";
            var expiryMinutes = double.Parse(_configuration["JwtSettings:ExpiryMinutes"] ?? "60");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
>>>>>>> origin/main
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("name", user.Name)
            };

            // Add roles claims
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            // Add permissions claims
            foreach (var permission in permissions)
            {
                claims.Add(new Claim("permission", permission));
            }

            var token = new JwtSecurityToken(
<<<<<<< HEAD
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes),
=======
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
>>>>>>> origin/main
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateRefreshToken()
        {
            var randomNumber = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }
    }
}
