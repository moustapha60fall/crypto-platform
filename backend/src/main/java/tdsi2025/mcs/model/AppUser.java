package tdsi2025.mcs.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "app_user", indexes = {
        @Index(name = "idx_appuser_username", columnList = "username")
})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppUser {

    @Id
    @Column(length = 36, nullable = false, updatable = false)
    private String id; // UUID from Keycloak

    @Column(nullable = false, unique = true, length = 100)
    @Size(max = 100)
    @NotBlank
    private String username;

    @Column(name = "first_name", nullable = false, length = 24)
    @Size(max = 24)
    @NotBlank
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 24)
    @Size(max = 24)
    @NotBlank
    private String lastName;

    @Column(length = 254)
    @Email
    private String email;

    @Column(name = "phone_number", length = 24)
    @Size(max = 24)
    private String phoneNumber;

    @Column(name = "nom_region", length = 24)
    @Size(max = 24)
    private String nomRegion;

    @Column(name = "nom_ville", length = 24)
    @Size(max = 24)
    private String nomVille;

    @Column(name = "address", length = 24)
    @Size(max = 24)
    private String address;

    @Column(name = "civilite", length = 24)
    @Size(max = 24)
    private String civilite;

    @Column(name = "last_login")
    private Instant lastLogin;

    @Column(name = "session_start")
    private Instant sessionStart;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "is_blocked", nullable = false)
    private boolean blocked = false;

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.MERGE, CascadeType.PERSIST})
    @JoinTable(
            name = "utilisateur_roles",
            joinColumns = @JoinColumn(name = "id_utilisateur"),
            inverseJoinColumns = @JoinColumn(name = "id_role")
    )
    private Set<Role> roles = new HashSet<>();

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getNomRegion() {
        return nomRegion;
    }

    public void setNomRegion(String nomRegion) {
        this.nomRegion = nomRegion;
    }

    public String getNomVille() {
        return nomVille;
    }

    public void setNomVille(String nomVille) {
        this.nomVille = nomVille;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCivilite() {
        return civilite;
    }

    public void setCivilite(String civilite) {
        this.civilite = civilite;
    }

    public Instant getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(Instant lastLogin) {
        this.lastLogin = lastLogin;
    }

    public Instant getSessionStart() {
        return sessionStart;
    }

    public void setSessionStart(Instant sessionStart) {
        this.sessionStart = sessionStart;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public boolean isBlocked() {
        return blocked;
    }

    public void setBlocked(boolean blocked) {
        this.blocked = blocked;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }

}
