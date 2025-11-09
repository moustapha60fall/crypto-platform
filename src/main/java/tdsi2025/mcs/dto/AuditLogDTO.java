package tdsi2025.mcs.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDTO {

    private Long id;

    @NotBlank
    @Size(max = 64)
    private String action;

    private boolean verified;

    private String details;

    private String actorId;

    private String requestId;
}
