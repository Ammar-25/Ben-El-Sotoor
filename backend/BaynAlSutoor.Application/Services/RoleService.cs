using AutoMapper;
using BaynAlSutoor.Application.DTOs;
using BaynAlSutoor.Application.Interfaces;
using BaynAlSutoor.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BaynAlSutoor.Application.Services
{
    public class RoleService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public RoleService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<RoleDto>> GetAllAsync()
        {
            var roles = await _unitOfWork.Roles.GetAllAsync();
            return _mapper.Map<IEnumerable<RoleDto>>(roles);
        }

        public async Task<RoleDto?> GetByIdAsync(int id)
        {
            var role = await _unitOfWork.Roles.GetByIdAsync(id);
            return role == null ? null : _mapper.Map<RoleDto>(role);
        }

        public async Task<RoleDto> CreateAsync(CreateRoleDto dto)
        {
            var role = _mapper.Map<Role>(dto);
            await _unitOfWork.Roles.AddAsync(role);
            await _unitOfWork.CompleteAsync();
            return _mapper.Map<RoleDto>(role);
        }

        public async Task<RoleDto?> UpdateAsync(int id, UpdateRoleDto dto)
        {
            var role = await _unitOfWork.Roles.GetByIdAsync(id);
            if (role == null) return null;

            _mapper.Map(dto, role);
            _unitOfWork.Roles.Update(role);
            await _unitOfWork.CompleteAsync();
            return _mapper.Map<RoleDto>(role);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var role = await _unitOfWork.Roles.GetByIdAsync(id);
            if (role == null) return false;

            _unitOfWork.Roles.Delete(role);
            await _unitOfWork.CompleteAsync();
            return true;
        }
    }
}
