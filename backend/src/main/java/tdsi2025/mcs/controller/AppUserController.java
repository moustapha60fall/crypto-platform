package tdsi2025.mcs.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import tdsi2025.mcs.dto.AppUserDTO;
import tdsi2025.mcs.dto.RoleResponse;
import tdsi2025.mcs.services.AppUserService;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Validated
public class AppUserController {

    private final AppUserService userService;

    @GetMapping("/me")
    public ResponseEntity<AppUserDTO> getCurrentUserProfile() {
        return ResponseEntity.ok(userService.getCurrentUserProfile());
    }

    @GetMapping("/all")
    public ResponseEntity<Page<AppUserDTO>> getAllUsers(Pageable pageable) {
        return ResponseEntity.ok(userService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppUserDTO> getUserById(@PathVariable String id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur non trouvé"));
    }

    @GetMapping("/{email}/roles")
    public ResponseEntity<Set<RoleResponse>> getRolesByUtilisateurEmail(@PathVariable String email) {
        Set<RoleResponse> roleResponses = userService.getRolesByEmail(email);
        return ResponseEntity.ok(roleResponses);
    }

    @PostMapping
    public ResponseEntity<AppUserDTO> createUser(@Valid @RequestBody AppUserDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.save(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AppUserDTO> updateUserProfile(@PathVariable String id, @Valid @RequestBody AppUserDTO dto) {
        return ResponseEntity.ok(userService.updateUserProfile(id, dto));
    }

    @PatchMapping("/{id}/block")
    public ResponseEntity<AppUserDTO> toggleBlockUser(@PathVariable String id, @RequestParam boolean blocked) {
        return ResponseEntity.ok(userService.toggleBlockUser(id, blocked));
    }

    @PatchMapping("/{id}/roles")
    public ResponseEntity<AppUserDTO> updateUserRoles(@PathVariable String id, @RequestBody String roles) {
        return ResponseEntity.ok(userService.updateUserRole(id, roles));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<AppUserDTO>> searchUsers(@RequestParam String keyword) {
        return ResponseEntity.ok(userService.searchUsersByUsernameOrEmail(keyword));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        try {
            // 🔒 Invalidation de la session Spring Security
            request.logout();

            // 🧹 Nettoyage du cache utilisateur local (si tu l’utilises)
            SecurityContextHolder.clearContext();

            // Optionnel : Effacer les cookies JWT / JSESSIONID
            Cookie cookie = new Cookie("JSESSIONID", null);
            cookie.setHttpOnly(true);
            cookie.setMaxAge(0);
            cookie.setPath("/");
            response.addCookie(cookie);

            return ResponseEntity.noContent().build();
        } catch (ServletException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erreur lors de la déconnexion", e);
        }
    }

}
