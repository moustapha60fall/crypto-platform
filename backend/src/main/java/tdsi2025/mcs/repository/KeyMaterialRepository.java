package tdsi2025.mcs.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tdsi2025.mcs.model.AppUser;
import tdsi2025.mcs.model.KeyMaterial;

import java.util.Collection;
import java.util.Optional;

@Repository
public interface KeyMaterialRepository extends JpaRepository<KeyMaterial,Long> {
    Collection<KeyMaterial> findByOwner(AppUser owner);

    Optional<KeyMaterial> findByKeyRef(String keyRef);
}

