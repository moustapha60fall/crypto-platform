package ucad.fst.dmi.lacgaa.tdsi2025.crypto_java_backend.config;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class KeycloakRoleConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

    @Override
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        Map<String, Object> resourceAccess = jwt.getClaimAsMap("resource_access");
        if (resourceAccess == null) {
            return Set.of();
        }

        // 👇 Ici on cible le client "backend-client"
        Map<String, Object> backendClient = (Map<String, Object>) resourceAccess.get("backend-client");
        if (backendClient == null) {
            return Set.of();
        }

        Collection<String> roles = (Collection<String>) backendClient.get("roles");
        if (roles == null) {
            return Set.of();
        }

        return roles.stream()
                .map(role -> "ROLE_" + role) // Spring Security attend "ROLE_admin"
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toSet());
    }
}

