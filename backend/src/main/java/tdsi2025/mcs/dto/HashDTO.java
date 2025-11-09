package tdsi2025.mcs.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import tdsi2025.mcs.enums.HashFunction;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HashDTO {

    @NotBlank(message = "Le message à hacher ne peut pas être vide")
    private String message;

    @NotNull(message = "L'algorithme de hachage doit être spécifié")
    private HashFunction hash;

    private Long keyId; // facultatif → utilisé uniquement pour HMAC

    private boolean base64Output;

    @NotBlank
    private String performedById;
}
