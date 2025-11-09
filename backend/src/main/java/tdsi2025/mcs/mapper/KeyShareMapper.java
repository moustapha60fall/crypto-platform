package tdsi2025.mcs.mapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import tdsi2025.mcs.dto.KeyShareDTO;
import tdsi2025.mcs.model.AppUser;
import tdsi2025.mcs.model.KeyMaterial;
import tdsi2025.mcs.model.KeyShare;

@Mapper(componentModel = "spring")
public interface KeyShareMapper {

    @Mapping(source = "keyMaterial.encodedKey", target = "encodedKey")
    @Mapping(source = "keyMaterial.algorithm", target = "algorithm")
    @Mapping(source = "keyMaterial.id", target = "keyMaterialId")
    @Mapping(source = "sharedByUser.id", target = "sharedByUserId")
    @Mapping(source = "sharedWithUser.id", target = "sharedWithUserId")
    KeyShareDTO toDto(KeyShare entity);

    @Mapping(source = "keyMaterialId", target = "keyMaterial")
    @Mapping(source = "sharedByUserId", target = "sharedByUser")
    @Mapping(source = "sharedWithUserId", target = "sharedWithUser")
    KeyShare toEntity(KeyShareDTO dto);

    // Méthodes utilitaires pour la conversion
    default KeyMaterial map(Long id) {
        if (id == null) return null;
        KeyMaterial km = new KeyMaterial();
        km.setId(id);
        return km;
    }

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
