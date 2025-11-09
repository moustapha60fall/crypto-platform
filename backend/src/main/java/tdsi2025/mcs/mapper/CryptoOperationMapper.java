package tdsi2025.mcs.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import tdsi2025.mcs.dto.CryptoOperationDTO;
import tdsi2025.mcs.model.AppUser;
import tdsi2025.mcs.model.CryptoOperation;
import tdsi2025.mcs.model.KeyMaterial;

@Mapper(componentModel = "spring")
public interface CryptoOperationMapper {

    @Mapping(source = "performedBy.id", target = "performedById")
    @Mapping(source = "keyMaterial.id", target = "keyMaterialId")
    CryptoOperationDTO toDto(CryptoOperation entity);

    @Mapping(source = "performedById", target = "performedBy")
    @Mapping(source = "keyMaterialId", target = "keyMaterial")
    CryptoOperation toEntity(CryptoOperationDTO dto);

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

    default KeyMaterial map(Long id) {
        if (id == null) return null;
        KeyMaterial k = new KeyMaterial();
        k.setId(id);
        return k;
    }

    default Long map(KeyMaterial key) {
        return key != null ? key.getId() : null;
    }
}
