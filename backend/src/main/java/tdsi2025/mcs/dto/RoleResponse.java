package tdsi2025.mcs.dto;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
public class RoleResponse {

    private Integer idRole;
    private String nomRole;

    public Integer getIdRole() {
        return this.idRole;
    }

    public String getNomRole() {
        return this.nomRole;
    }

    public void setIdRole(Integer idRole) {
        this.idRole = idRole;
    }

    public void setNomRole(String nomRole) {
        this.nomRole = nomRole;
    }
}
