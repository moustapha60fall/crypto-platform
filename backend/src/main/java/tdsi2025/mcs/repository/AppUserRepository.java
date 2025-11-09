package tdsi2025.mcs.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tdsi2025.mcs.model.AppUser;

import java.util.Optional;

@Repository
public interface AppUserRepository extends JpaRepository<AppUser, String> {
    Optional<AppUser> findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(String keyword, String keyword1);

    Optional<AppUser> findByEmail(String email);
}
