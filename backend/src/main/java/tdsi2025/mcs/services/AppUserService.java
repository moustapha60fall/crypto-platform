package tdsi2025.mcs.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import tdsi2025.mcs.dto.AppUserDTO;
import tdsi2025.mcs.dto.RoleResponse;
import tdsi2025.mcs.mapper.AppUserMapper;
import tdsi2025.mcs.model.AppUser;
import tdsi2025.mcs.model.AuditLog;
import tdsi2025.mcs.model.Role;
import tdsi2025.mcs.repository.AppUserRepository;
import tdsi2025.mcs.repository.AuditLogRepository;
import tdsi2025.mcs.repository.RoleRepository;
import tdsi2025.mcs.security.CurrentUserProvider;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AppUserService {

    private final AppUserRepository userRepo;
    private final AuditLogRepository auditRepo;
    private final RoleRepository roleRepo;
    private final AppUserMapper mapper;
    private final CurrentUserProvider currentUserProvider;

    public AppUserDTO getCurrentUserProfile() {
        log.debug("→ getCurrentUserProfile() appelé");

        AppUser extractedUser = currentUserProvider.getCurrentUser();
        log.debug("CurrentUserProvider renvoie : {}", extractedUser);

        if (extractedUser == null) {
            log.error("Aucun utilisateur connecté ou JWT invalide !");
            throw new IllegalStateException("Aucun utilisateur connecté ou JWT invalide");
        }

        AppUser syncedUser = syncUser(extractedUser);
        log.debug("Utilisateur synchronisé : {}", syncedUser);

        AppUserDTO dto = mapper.toDto(syncedUser);
        log.debug("Mapper.toDto() renvoie : {}", dto);

        return dto;
    } 
    /**
     * Synchronise l'utilisateur Keycloak avec la base locale.
     * Si l'utilisateur existe déjà, on met à jour uniquement les champs non nuls de Keycloak.
     */
    public AppUser syncUser(AppUser extractedUser) {
        log.debug("→ syncUser() appelé avec : {}", extractedUser);

        // 🔄 Synchroniser les rôles
        Set<Role> syncedRoles = new HashSet<>();
        for (Role role : extractedUser.getRoles()) {
            Role existingRole = roleRepo.findByNomRole(role.getNomRole())
                    .orElseGet(() -> roleRepo.save(
                            new Role(null, role.getNomRole(), new HashSet<>())
                    ));
            syncedRoles.add(existingRole);
        }
        extractedUser.setRoles(syncedRoles);

        return userRepo.findById(extractedUser.getId())
                .map(existing -> {
                    log.debug("Utilisateur trouvé en base : {}", existing);

                    // Champs issus de Keycloak — toujours synchronisés
                    existing.setUsername(extractedUser.getUsername());
                    existing.setEmail(extractedUser.getEmail());
                    existing.setFirstName(extractedUser.getFirstName());
                    existing.setLastName(extractedUser.getLastName());
                    existing.setLastLogin(Instant.now());
                    existing.setActive(true);

                    // Champs locaux — ne pas écraser s'ils sont null côté Keycloak
                    if (extractedUser.getPhoneNumber() != null)
                        existing.setPhoneNumber(extractedUser.getPhoneNumber());
                    if (extractedUser.getNomRegion() != null)
                        existing.setNomRegion(extractedUser.getNomRegion());
                    if (extractedUser.getNomVille() != null)
                        existing.setNomVille(extractedUser.getNomVille());
                    if (extractedUser.getAddress() != null)
                        existing.setAddress(extractedUser.getAddress());
                    if (extractedUser.getCivilite() != null)
                        existing.setCivilite(extractedUser.getCivilite());

                    AppUser saved = userRepo.save(existing);
                    log.debug("Utilisateur mis à jour et sauvegardé : {}", saved);
                    return saved;
                })
                .orElseGet(() -> {
                    log.debug("Utilisateur inexistant — création en cours...");
                    extractedUser.setLastLogin(Instant.now());
                    extractedUser.setSessionStart(Instant.now());
                    extractedUser.setActive(true);
                    extractedUser.setBlocked(false);

                    AppUser saved = userRepo.save(extractedUser);
                    log.debug("Nouvel utilisateur sauvegardé : {}", saved);

                    auditRepo.save(AuditLog.builder()
                            .action("USER_SYNC_CREATED")
                            .details("User " + saved.getUsername() + " synced with roles " + saved.getRoles())
                            .actor(saved)
                            .requestId(UUID.randomUUID().toString())
                            .createdAt(Instant.now())
                            .build());

                    log.debug("AuditLog créé pour USER_SYNC_CREATED");
                    return saved;
                });
    }

    /**
     * Mise à jour manuelle du profil utilisateur via PUT /api/users/{id}
     */
    public AppUserDTO updateUserProfile(String id, AppUserDTO dto) {
        log.debug("→ updateUserProfile({})", id);
        log.debug("DTO reçu : {}", dto);

        AppUser user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Mise à jour des champs du profil
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEmail(dto.getEmail());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setNomRegion(dto.getNomRegion());
        user.setNomVille(dto.getNomVille());
        user.setAddress(dto.getAddress());
        user.setCivilite(dto.getCivilite());

        AppUser saved = userRepo.save(user);
        log.debug("Profil mis à jour : {}", saved);

        auditRepo.save(AuditLog.builder()
                .action("USER_PROFILE_UPDATED")
                .details("Profile updated for " + user.getUsername())
                .actor(currentUserProvider.getCurrentUser())
                .requestId(UUID.randomUUID().toString())
                .createdAt(Instant.now())
                .build());

        return mapper.toDto(saved);
    }

    public Page<AppUserDTO> findAll(Pageable pageable) {
        return userRepo.findAll(pageable).map(mapper::toDto);
    }

    public Optional<AppUserDTO> getUserById(String id) {
        System.out.println("\n[DEBUG] → getUserById(" + id + ")");
        Optional<AppUserDTO> result = userRepo.findById(id).map(mapper::toDto);
        System.out.println("[DEBUG] Résultat : " + result.orElse(null));
        return result;
    }

    public AppUserDTO toggleBlockUser(String id, boolean blocked) {
        System.out.println("\n[DEBUG] → toggleBlockUser(" + id + ", " + blocked + ")");
        AppUser user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        user.setBlocked(blocked);
        AppUser saved = userRepo.save(user);

        System.out.println("[DEBUG] Utilisateur après modification du blocage : " + saved);

        auditRepo.save(AuditLog.builder()
                .action(blocked ? "USER_BLOCKED" : "USER_UNBLOCKED")
                .details("User " + user.getUsername() + " block status changed to " + blocked)
                .actor(currentUserProvider.getCurrentUser())
                .requestId(UUID.randomUUID().toString())
                .createdAt(Instant.now())
                .build());

        return mapper.toDto(saved);
    }

    // 🟢 Récupère les rôles d’un utilisateur
    public Set<RoleResponse> getRolesByEmail(String email) {
        AppUser user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé : " + email));

        return user.getRoles().stream()
                .map(role -> new RoleResponse(role.getIdRole(), role.getNomRole()))
                .collect(Collectors.toSet());
    }

    // 🟢 ✅ Correction complète de updateUserRole()
    public AppUserDTO updateUserRole(String id, String roles) {
        log.debug("\n[DEBUG] → updateUserRole({}, {})", id, roles);

        AppUser user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Conversion de la chaîne CSV en liste de rôles
        Set<Role> roleSet = Arrays.stream(roles.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(roleName -> roleRepo.findByNomRole(roleName)
                        .orElseGet(() -> {
                            Role newRole = new Role();
                            newRole.setNomRole(roleName);
                            return roleRepo.save(newRole);
                        }))
                .collect(Collectors.toSet());

        user.setRoles(roleSet);
        AppUser saved = userRepo.save(user);

        auditRepo.save(AuditLog.builder()
                .action("USER_ROLE_UPDATED")
                .details("Roles updated to " + roles)
                .actor(currentUserProvider.getCurrentUser())
                .requestId(UUID.randomUUID().toString())
                .createdAt(Instant.now())
                .build());

        log.debug("[DEBUG] Rôles mis à jour : {}", saved.getRoles());

        return mapper.toDto(saved);
    }

    public List<AppUserDTO> searchUsersByUsernameOrEmail(String keyword) {
        System.out.println("\n[DEBUG] → searchUsersByUsernameOrEmail(" + keyword + ")");
        List<AppUserDTO> list = userRepo.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(keyword, keyword)
                .stream()
                .map(mapper::toDto)
                .toList();
        System.out.println("[DEBUG] Résultats trouvés : " + list.size());
        return list;
    }

    public void deleteUser(String id) {
        System.out.println("\n[DEBUG] → deleteUser(" + id + ")");
        AppUser user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        userRepo.delete(user);
        System.out.println("[DEBUG] Utilisateur supprimé : " + user);

        auditRepo.save(AuditLog.builder()
                .action("USER_DELETED")
                .details("User " + user.getUsername() + " deleted")
                .actor(currentUserProvider.getCurrentUser())
                .requestId(UUID.randomUUID().toString())
                .createdAt(Instant.now())
                .build());
    }

    public AppUserDTO save(AppUserDTO dto) {
        System.out.println("\n[DEBUG] → save() appelé avec DTO : " + dto);

        AppUser entity = mapper.toEntity(dto);
        System.out.println("[DEBUG] Mapper.toEntity() a donné : " + entity);

        entity.setLastLogin(Instant.now());
        AppUser saved = userRepo.save(entity);

        System.out.println("[DEBUG] Entité sauvegardée : " + saved);
        AppUserDTO result = mapper.toDto(saved);
        System.out.println("[DEBUG] Mapper.toDto() final : " + result);

        return result;
    }
}
