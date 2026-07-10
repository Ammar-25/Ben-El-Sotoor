using AutoMapper;
using BaynAlSutoor.Application.DTOs;
using BaynAlSutoor.Application.Interfaces;
using BaynAlSutoor.Domain.Entities;
using Google.Apis.Auth;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaynAlSutoor.Application.Services
{
    public class AuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;
        private readonly IMapper _mapper;

        public AuthService(
            IUnitOfWork unitOfWork,
            IPasswordHasher passwordHasher,
            IJwtTokenGenerator jwtTokenGenerator,
            IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _passwordHasher = passwordHasher;
            _jwtTokenGenerator = jwtTokenGenerator;
            _mapper = mapper;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
        {
            var existingUser = await _unitOfWork.Users.GetByEmailAsync(request.Email);
            if (existingUser != null)
            {
                return new AuthResponseDto { IsSuccess = false, Message = "Email address already registered." };
            }

            var user = new User
            {
                Name = request.Name,
                Email = request.Email,
                PasswordHash = _passwordHasher.HashPassword(request.Password),
                MemberSince = DateTime.UtcNow.Year,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Users.AddAsync(user);
            await _unitOfWork.CompleteAsync();

            // Assign "Reader" role
            var readerRole = (await _unitOfWork.Roles.FindAsync(r => r.Name == "Reader")).FirstOrDefault();
            if (readerRole != null)
            {
                var userRole = new UserRole { UserId = user.Id, RoleId = readerRole.Id };
                await _unitOfWork.UserRoles.AddAsync(userRole);
            }

            // Create Audit Log
            var log = new AuditLog
            {
                UserId = user.Id,
                Action = "User Registration",
                EntityName = "User",
                EntityId = user.Id.ToString(),
                Timestamp = DateTime.UtcNow,
                Details = $"User registered with email {user.Email}"
            };
            await _unitOfWork.AuditLogs.AddAsync(log);
            await _unitOfWork.CompleteAsync();

            // Auto-login after registration
            return await LoginUserAsync(user);
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
        {
            var user = await _unitOfWork.Users.GetByEmailAsync(request.Email);
            if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
            {
                return new AuthResponseDto { IsSuccess = false, Message = "Invalid email or password." };
            }

            // Create Audit Log
            var log = new AuditLog
            {
                UserId = user.Id,
                Action = "User Login",
                EntityName = "User",
                EntityId = user.Id.ToString(),
                Timestamp = DateTime.UtcNow,
                Details = $"User logged in: {user.Email}"
            };
            await _unitOfWork.AuditLogs.AddAsync(log);
            await _unitOfWork.CompleteAsync();

            return await LoginUserAsync(user, request.RememberMe);
        }

        public async Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenRequestDto request)
        {
            var refreshToken = (await _unitOfWork.RefreshTokens.FindAsync(t => t.Token == request.RefreshToken)).FirstOrDefault();
            if (refreshToken == null || !refreshToken.IsActive)
            {
                return new AuthResponseDto { IsSuccess = false, Message = "Invalid or expired refresh token." };
            }

            var user = await _unitOfWork.Users.GetByIdAsync(refreshToken.UserId);
            if (user == null)
            {
                return new AuthResponseDto { IsSuccess = false, Message = "User associated with token not found." };
            }

            // Revoke current token
            refreshToken.RevokedAt = DateTime.UtcNow;
            _unitOfWork.RefreshTokens.Update(refreshToken);

            // Generate new keys
            var fullUser = await _unitOfWork.Users.GetUserWithRolesAndPermissionsAsync(user.Id);
            var roles = fullUser?.UserRoles.Select(ur => ur.Role.Name) ?? new List<string>();
            var permissions = fullUser?.UserRoles.SelectMany(ur => ur.Role.RolePermissions).Select(rp => rp.Permission.Name) ?? new List<string>();

            var newJwt = _jwtTokenGenerator.GenerateToken(user, roles, permissions);
            var newRefreshTokenString = _jwtTokenGenerator.GenerateRefreshToken();
            var newRefreshToken = new RefreshToken
            {
                Token = newRefreshTokenString,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                CreatedAt = DateTime.UtcNow,
                UserId = user.Id
            };

            await _unitOfWork.RefreshTokens.AddAsync(newRefreshToken);
            await _unitOfWork.CompleteAsync();

            var userProfile = _mapper.Map<UserProfileDto>(user);
            ResolveUserProfileStats(user, userProfile);

            return new AuthResponseDto
            {
                IsSuccess = true,
                Token = newJwt,
                RefreshToken = newRefreshTokenString,
                RefreshTokenExpiration = newRefreshToken.ExpiresAt,
                User = userProfile
            };
        }

        public async Task<bool> LogoutAsync(string refreshTokenString)
        {
            var refreshToken = (await _unitOfWork.RefreshTokens.FindAsync(t => t.Token == refreshTokenString)).FirstOrDefault();
            if (refreshToken == null) return false;

            refreshToken.RevokedAt = DateTime.UtcNow;
            _unitOfWork.RefreshTokens.Update(refreshToken);
            await _unitOfWork.CompleteAsync();
            return true;
        }

        public async Task<AuthResponseDto> SocialLoginAsync(SocialLoginRequestDto request)
        {
            if (request.Provider == "Google")
            {
                try
                {
                    var settings = new GoogleJsonWebSignature.ValidationSettings()
                    {
                        Audience = new List<string>() { "616265757583-ciqasnjads2vbi0mvd49rproekrf821k.apps.googleusercontent.com" }
                    };
                    
                    var payload = await GoogleJsonWebSignature.ValidateAsync(request.TokenId, settings);
                    string email = payload.Email;
                    
                    var user = await _unitOfWork.Users.GetByEmailAsync(email);
                    
                    if (request.IsRegister)
                    {
                        if (user != null)
                        {
                            return new AuthResponseDto { IsSuccess = false, Message = "Email address already registered." };
                        }
                        
                        user = new User
                        {
                            Name = payload.Name ?? "Google User",
                            Email = email,
                            PasswordHash = _passwordHasher.HashPassword(Guid.NewGuid().ToString()),
                            MemberSince = DateTime.UtcNow.Year,
                            CreatedAt = DateTime.UtcNow
                        };
                        await _unitOfWork.Users.AddAsync(user);
                        await _unitOfWork.CompleteAsync();

                        var readerRole = (await _unitOfWork.Roles.FindAsync(r => r.Name == "Reader")).FirstOrDefault();
                        if (readerRole != null)
                        {
                            var userRole = new UserRole { UserId = user.Id, RoleId = readerRole.Id };
                            await _unitOfWork.UserRoles.AddAsync(userRole);
                        }
                        await _unitOfWork.CompleteAsync();
                        
                        // Create Audit Log
                        var log = new AuditLog
                        {
                            UserId = user.Id,
                            Action = "User Registration (Google)",
                            EntityName = "User",
                            EntityId = user.Id.ToString(),
                            Timestamp = DateTime.UtcNow,
                            Details = $"User registered via Google with email {user.Email}"
                        };
                        await _unitOfWork.AuditLogs.AddAsync(log);
                        await _unitOfWork.CompleteAsync();
                    }
                    else
                    {
                        if (user == null)
                        {
                            return new AuthResponseDto { IsSuccess = false, Message = "Account not found. Please register first." };
                        }
                        
                        // Create Audit Log
                        var log = new AuditLog
                        {
                            UserId = user.Id,
                            Action = "User Login (Google)",
                            EntityName = "User",
                            EntityId = user.Id.ToString(),
                            Timestamp = DateTime.UtcNow,
                            Details = $"User logged in via Google: {user.Email}"
                        };
                        await _unitOfWork.AuditLogs.AddAsync(log);
                        await _unitOfWork.CompleteAsync();
                    }

                    return await LoginUserAsync(user);
                }
                catch (InvalidJwtException)
                {
                    return new AuthResponseDto { IsSuccess = false, Message = "Invalid Google token." };
                }
            }

            return new AuthResponseDto { IsSuccess = false, Message = "Unsupported provider." };
        }

        private async Task<AuthResponseDto> LoginUserAsync(User user, bool rememberMe = false)
        {
            var fullUser = await _unitOfWork.Users.GetUserWithRolesAndPermissionsAsync(user.Id);
            var roles = fullUser?.UserRoles?.Select(ur => ur.Role.Name) ?? new List<string> { "Reader" };
            var permissions = fullUser?.UserRoles?.SelectMany(ur => ur.Role.RolePermissions).Select(rp => rp.Permission.Name) ?? new List<string>();

            var token = _jwtTokenGenerator.GenerateToken(user, roles, permissions);
            var refreshTokenString = _jwtTokenGenerator.GenerateRefreshToken();

            var refreshToken = new RefreshToken
            {
                Token = refreshTokenString,
                ExpiresAt = rememberMe ? DateTime.UtcNow.AddDays(30) : DateTime.UtcNow.AddDays(1),
                CreatedAt = DateTime.UtcNow,
                UserId = user.Id
            };

            await _unitOfWork.RefreshTokens.AddAsync(refreshToken);
            await _unitOfWork.CompleteAsync();

            var userProfile = _mapper.Map<UserProfileDto>(user);
            ResolveUserProfileStats(user, userProfile);

            return new AuthResponseDto
            {
                IsSuccess = true,
                Message = "Authentication successful.",
                Token = token,
                RefreshToken = refreshTokenString,
                RefreshTokenExpiration = refreshToken.ExpiresAt,
                User = userProfile
            };
        }

        private void ResolveUserProfileStats(User user, UserProfileDto profile)
        {
            // Populate aggregates from UnitOfWork queries
            profile.BooksReadCount = _unitOfWork.UserReadingProgresses.GetQueryable().Count(p => p.UserId == user.Id && p.ProgressPercentage == 100);
            profile.InProgressCount = _unitOfWork.UserReadingProgresses.GetQueryable().Count(p => p.UserId == user.Id && p.ProgressPercentage > 0 && p.ProgressPercentage < 100);
            profile.FavoritesCount = _unitOfWork.UserFavorites.GetQueryable().Count(f => f.UserId == user.Id);
            profile.ReviewsCount = _unitOfWork.Reviews.GetQueryable().Count(r => r.UserId == user.Id);

            var activeSub = _unitOfWork.UserSubscriptions.GetQueryable()
                .FirstOrDefault(s => s.UserId == user.Id && s.IsActive && s.EndDate >= DateTime.UtcNow);

            if (activeSub != null)
            {
                profile.HasActiveSubscription = true;
                profile.ActiveSubscriptionPlan = activeSub.PlanId;
            }
        }
    }
}
