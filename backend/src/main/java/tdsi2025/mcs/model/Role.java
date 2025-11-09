package tdsi2025.mcs.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "roles")
@NoArgsConstructor
@AllArgsConstructor
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_role")
    private Integer idRole;

    @Column(name = "nom_role", nullable = false, unique = true, length = 50)
    private String nomRole;

    @ManyToMany(mappedBy = "roles", fetch = FetchType.LAZY)
    private Set<AppUser> utilisateurs = new HashSet<>();

    public Integer getIdRole() {
        return idRole;
    }

    public void setIdRole(Integer idRole) {
        this.idRole = idRole;
    }

    public String getNomRole() {
        return nomRole;
    }

    public void setNomRole(String nomRole) {
        this.nomRole = nomRole;
    }

    public Set<AppUser> getUtilisateurs() {
        return utilisateurs;
    }

    public void setUtilisateurs(Set<AppUser> utilisateurs) {
        this.utilisateurs = utilisateurs;
    }
}
