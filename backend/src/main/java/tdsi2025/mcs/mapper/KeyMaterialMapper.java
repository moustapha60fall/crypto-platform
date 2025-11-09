package tdsi2025.mcs.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import tdsi2025.mcs.dto.KeyMaterialDTO;
import tdsi2025.mcs.model.AppUser;
import tdsi2025.mcs.model.KeyMaterial;

@Mapper(componentModel = "spring")
public interface KeyMaterialMapper {

    @Mapping(source = "owner.id", target = "ownerId")
    KeyMaterialDTO toDto(KeyMaterial entity);

    @Mapping(source = "ownerId", target = "owner")
    KeyMaterial toEntity(KeyMaterialDTO dto);

    // --- Méthodes utilitaires ---
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
