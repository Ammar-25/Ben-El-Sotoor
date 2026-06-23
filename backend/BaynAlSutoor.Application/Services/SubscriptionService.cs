using AutoMapper;
using BaynAlSutoor.Application.DTOs;
using BaynAlSutoor.Application.Interfaces;
using BaynAlSutoor.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaynAlSutoor.Application.Services
{
    public class SubscriptionService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public SubscriptionService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<SubscriptionPlanDto>> GetAllPlansAsync()
        {
            var plans = await _unitOfWork.SubscriptionPlans.GetAllAsync();
            return _mapper.Map<IEnumerable<SubscriptionPlanDto>>(plans);
        }

        public async Task<UserSubscriptionDto?> SubscribeUserAsync(int userId, string planId)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null) return null;

            var plan = await _unitOfWork.SubscriptionPlans.GetByIdAsync(planId);
            if (plan == null) return null;

            // Inactivate existing subscriptions for this user
            var activeSubs = await _unitOfWork.UserSubscriptions.FindAsync(s => s.UserId == userId && s.IsActive);
            foreach (var sub in activeSubs)
            {
                sub.IsActive = false;
                _unitOfWork.UserSubscriptions.Update(sub);
            }

            int days = planId switch
            {
                "monthly" => 30,
                "annual" => 365,
                "premium" => 365,
                _ => 0
            };

            var userSubscription = new UserSubscription
            {
                UserId = userId,
                PlanId = planId,
                StartDate = DateTime.UtcNow,
                EndDate = days > 0 ? DateTime.UtcNow.AddDays(days) : DateTime.UtcNow.AddYears(10), // Single/Free is effectively lifetime
                IsActive = true
            };

            await _unitOfWork.UserSubscriptions.AddAsync(userSubscription);
            
            // Audit Log
            var log = new AuditLog
            {
                UserId = userId,
                Action = "Subscription Purchased",
                EntityName = "UserSubscription",
                EntityId = planId,
                Timestamp = DateTime.UtcNow,
                Details = $"User subscribed to plan {planId} for {days} days."
            };
            await _unitOfWork.AuditLogs.AddAsync(log);
            await _unitOfWork.CompleteAsync();

            // Fetch fully populated subscription mapping details
            userSubscription.Plan = plan;
            return _mapper.Map<UserSubscriptionDto>(userSubscription);
        }
    }
}
