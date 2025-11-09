package tdsi2025.mcs.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppUserDTO {

    private String id;

    @NotBlank
    @Size(max = 100)
    private String username;

    @NotBlank
    @Size(max = 24)
    private String firstName;

    @NotBlank
    @Size(max = 24)
    private String lastName;

    @Email
    private String email;
    private Instant lastLogin;
    private String roles;

    private boolean active;
    private boolean blocked;
}

