package sn.ucad.lacgaa.emploi_du_temps.service;

import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import sn.ucad.lacgaa.emploi_du_temps.exception.ModelException;
import sn.ucad.lacgaa.emploi_du_temps.models.Role;
import sn.ucad.lacgaa.emploi_du_temps.models.Utilisateur;
import sn.ucad.lacgaa.emploi_du_temps.repository.RoleRepository;
import sn.ucad.lacgaa.emploi_du_temps.repository.UtilisateurRepository;

import java.util.List;

@Service
@Transactional
public class RoleService {

    private static final Logger logger = LoggerFactory.getLogger(RoleService.class);
    private final RoleRepository roleRepository;
    private final UtilisateurRepository utilisateurRepository;

    public RoleService(RoleRepository roleRepository, UtilisateurRepository utilisateurRepository) {
        this.roleRepository = roleRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    public void assignRolesToUser(String email, List<String> roleNames) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new ModelException("USER_NOT_FOUND", "Utilisateur introuvable pour l'email : " + email));

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
