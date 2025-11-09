package tdsi2025.mcs.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import tdsi2025.mcs.dto.AuditLogDTO;
import tdsi2025.mcs.model.AppUser;
import tdsi2025.mcs.model.AuditLog;

@Mapper(componentModel = "spring")
public interface AuditLogMapper {

    // --- Entity → DTO ---
    @Mapping(source = "actor.id", target = "actorId")
    AuditLogDTO toDto(AuditLog entity);

    // --- DTO → Entity ---
    @Mapping(source = "actorId", target = "actor")
    AuditLog toEntity(AuditLogDTO dto);

    // --- Méthodes utilitaires pour AppUser ---
    default AppUser map(String id) {
        if (id == null) return null;
        AppUser u = new AppUser();
        u.setId(id);
        return u;
    }

    default String map(AppUser user) {
        return user != null ? user.getId() : null;
    }
}
