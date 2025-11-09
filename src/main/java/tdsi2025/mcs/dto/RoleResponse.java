package sn.ucad.lacgaa.emploi_du_temps.dto.response;

public class RoleResponse {

    private Integer idRole;
    private String nomRole;

    public RoleResponse(Integer idRole, String nomRole) {
        this.idRole = idRole;
        this.nomRole = nomRole;
    }

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
