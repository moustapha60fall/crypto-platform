package tdsi2025.mcs.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tdsi2025.mcs.model.AppUser;
import tdsi2025.mcs.model.CryptoOperation;
import tdsi2025.mcs.model.KeyMaterial;

import java.util.Collection;

@Repository
public interface CryptoOperationRepository extends JpaRepository<CryptoOperation,Long> {
    Collection<CryptoOperation> findByPerformedBy(AppUser user);

    Collection<CryptoOperation> findByKeyMaterial_Id(Long keyId);
}
