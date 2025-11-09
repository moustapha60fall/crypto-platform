package ucad.fst.dmi.lacgaa.tdsi2025.crypto_java_backend.config;

import io.micrometer.common.lang.NonNull;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import ucad.fst.dmi.lacgaa.tdsi2025.crypto_java_backend.models.User;
import ucad.fst.dmi.lacgaa.tdsi2025.crypto_java_backend.services.UserService;

import java.io.IOException;

@Component
public class UserLoggingFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(UserLoggingFilter.class);
    private final CurrentUserProvider currentUserProvider;
    private final UserService userService;

    public UserLoggingFilter(CurrentUserProvider currentUserProvider, UserService userService) {
        this.currentUserProvider = currentUserProvider;
        this.userService = userService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // ⚡ Ignorer les requêtes OPTIONS (préflight CORS)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        User user = currentUserProvider.extractUserFromJwt();

        if (user == null) {
            logger.debug("Aucun utilisateur extrait du JWT pour la requête : {}", request.getRequestURI());
        } else {
            User syncedUser = userService.syncUser(user);

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
