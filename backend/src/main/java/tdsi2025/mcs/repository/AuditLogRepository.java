package tdsi2025.mcs.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tdsi2025.mcs.model.AppUser;
import tdsi2025.mcs.model.AuditLog;

import java.time.Instant;
import java.util.List;

@Repository
public interface AuditLogRepository  extends JpaRepository<AuditLog,Integer> {

    List<AuditLog> findByActor(AppUser actor);
    List<AuditLog> findByActionIgnoreCase(String action);
    List<AuditLog> findByCreatedAtBetween(Instant start, Instant end);
}
