package tdsi2025.mcs.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tdsi2025.mcs.model.KeyShare;

import java.util.Collection;

@Repository
public interface KeyShareRepository  extends JpaRepository<KeyShare, String> {

    Collection<KeyShare> findBySharedWithUser_Id(String userId);
    Collection<KeyShare> findBySharedByUser_Id(String userId);
}
