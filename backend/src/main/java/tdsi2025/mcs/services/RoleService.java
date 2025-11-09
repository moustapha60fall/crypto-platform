package tdsi2025.mcs.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import tdsi2025.mcs.model.AppUser;
import tdsi2025.mcs.model.Role;
import tdsi2025.mcs.repository.AppUserRepository;
import tdsi2025.mcs.repository.RoleRepository;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class RoleService {

    private static final Logger logger = LoggerFactory.getLogger(RoleService.class);
    private final RoleRepository roleRepository;
    private final AppUserRepository utilisateurRepository;

    public void assignRolesToUser(String email, List<String> roleNames) {
        AppUser utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(RuntimeException::new);

        for (String roleName : roleNames) {
            Role role = roleRepository.findByNomRole(roleName)
                    .orElseGet(() -> {
                        Role newRole = new Role();
                        newRole.setNomRole(roleName);
                        roleRepository.save(newRole);
                        return newRole;
                    });
            utilisateur.getRoles().add(role);
        }

        utilisateurRepository.save(utilisateur);
        logger.info("Rôles {} assignés à l'utilisateur {}", roleNames, utilisateur.getEmail());

    }

}
