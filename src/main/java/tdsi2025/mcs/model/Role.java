package sn.ucad.lacgaa.emploi_du_temps.models;

import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_role")
    private Integer idRole;

    @Column(name = "nom_role")
    private String nomRole;

    @ManyToMany(mappedBy = "roles", fetch = FetchType.LAZY)
    private Set<Utilisateur> utilisateurs = new HashSet<>();

    public Role(Integer idRole, String nomRole, Set<Utilisateur> utilisateurs) {
        this.idRole = idRole;
        this.nomRole = nomRole;
        this.utilisateurs = utilisateurs;
    }

    public Role() {
    }

    public Integer getIdRole() {
        return this.idRole;
    }

    public String getNomRole() {
        return this.nomRole;
    }

    public Set<Utilisateur> getUtilisateurs() {
        return this.utilisateurs;
    }

    public void setIdRole(Integer idRole) {
        this.idRole = idRole;
    }

    public void setNomRole(String nomRole) {
        this.nomRole = nomRole;
    }

    public void setUtilisateurs(Set<Utilisateur> utilisateurs) {
        this.utilisateurs = utilisateurs;
    }
}
