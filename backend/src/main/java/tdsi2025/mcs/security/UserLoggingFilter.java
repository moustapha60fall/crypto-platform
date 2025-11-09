package tdsi2025.mcs.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import tdsi2025.mcs.model.AppUser;
import tdsi2025.mcs.services.AppUserService;

import java.io.IOException;

@RequiredArgsConstructor
@Component
public class UserLoggingFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(UserLoggingFilter.class);
    private final CurrentUserProvider currentUserProvider;
    private final AppUserService userService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        // ⚡ Ignorer les requêtes OPTIONS (préflight CORS)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        AppUser user = currentUserProvider.extractUserFromJwt();

        if (user == null) {
            logger.debug("Aucun utilisateur extrait du JWT pour la requête : {}", request.getRequestURI());
        } else {
            AppUser syncedUser = userService.syncUser(user);

            if (syncedUser.isBlocked()) {
                logger.warn("Tentative d'accès par un utilisateur BLOQUÉ : {}", syncedUser.getUsername());
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Votre compte est bloqué.");
                return;
            }

            logger.info("Connexion réussie de : {}", syncedUser.getUsername());
        }

        filterChain.doFilter(request, response);
    }

}
