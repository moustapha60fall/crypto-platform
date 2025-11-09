package tdsi2025.mcs.mapper;

import org.mapstruct.Mapper;
import tdsi2025.mcs.dto.AppUserDTO;
import tdsi2025.mcs.dto.RoleResponse;
import tdsi2025.mcs.model.AppUser;
import tdsi2025.mcs.model.Role;

@Mapper(componentModel = "spring")
public interface AppUserMapper {

    AppUserDTO toDto(AppUser entity);
    AppUser toEntity(AppUserDTO dto);

    // Conversion personnalisée
    default RoleResponse map(Role role) {
        if (role == null) return null;
        return new RoleResponse(role.getIdRole(), role.getNomRole());
    }

    default Role map(RoleResponse dto) {
        if (dto == null) return null;
        Role role = new Role();
        role.setIdRole(dto.getIdRole());
        role.setNomRole(dto.getNomRole());
        return role;
    }
}
