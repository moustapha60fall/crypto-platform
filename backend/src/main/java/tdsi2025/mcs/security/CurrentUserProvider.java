package tdsi2025.mcs.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import tdsi2025.mcs.model.AppUser;
import tdsi2025.mcs.model.Role;

import java.util.*;

@Component
public class CurrentUserProvider {

    private static final ThreadLocal<AppUser> currentUserCache = new ThreadLocal<>();

    @SuppressWarnings("unchecked")
    public AppUser extractUserFromJwt() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof Jwt jwt) {
            Map<String, Object> claims = jwt.getClaims();

            // Création de l'utilisateur avec les infos de base
            AppUser user = new AppUser();
            user.setId(jwt.getSubject());
            user.setUsername(jwt.getClaimAsString("preferred_username"));
            user.setEmail(jwt.getClaimAsString("email"));
            user.setFirstName(jwt.getClaimAsString("given_name"));
            user.setLastName(jwt.getClaimAsString("family_name"));

            // 🟩 Extraction des rôles uniquement pour backend-client
            Set<Role> roleSet = new HashSet<>();
            Map<String, Object> resourceAccess = (Map<String, Object>) claims.get("resource_access");

            if (resourceAccess != null && resourceAccess.containsKey("backend-client")) {
                Map<String, Object> backendClient = (Map<String, Object>) resourceAccess.get("backend-client");
                if (backendClient.containsKey("roles")) {
                    List<String> roles = (List<String>) backendClient.get("roles");
                    for (String roleName : roles) {
                        roleSet.add(new Role(null, roleName.toUpperCase(), new HashSet<>()));
                    }
                }
            }

            user.setRoles(roleSet);

            return user;
        }

        return null;
    }

    public AppUser getCurrentUser() {
        if (currentUserCache.get() != null) {
            return currentUserCache.get();
        }
        AppUser user = extractUserFromJwt();
        if (user == null) {
            throw new IllegalStateException("Aucun utilisateur connecté ou JWT invalide");
        }
        currentUserCache.set(user);
        return user;
    }
}
