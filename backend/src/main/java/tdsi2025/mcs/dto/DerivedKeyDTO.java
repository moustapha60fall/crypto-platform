package tdsi2025.mcs.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DerivedKeyDTO {

    // --- Référence à la clé maîtresse ---
    @NotBlank
    @Size(max = 256)
    private String masterkeyRef;

    // --- Paramètres de dérivation ---
    private String saltBase64; // encodé en Base64 pour transport JSON

    @Min(value = 128, message = "Key size must be at least 128 bits")
    @Max(value = 512, message = "Key size must not exceed 512 bits")
    private int keySize; // en bits

    @NotBlank(message = "Derivation algorithm is required (e.g., HKDF)")
    private String derivationAlgorithm; // ex: HKDF

    // --- Métadonnées métier ---
    @NotBlank(message = "Derived key name cannot be blank")
    private String name;

    private String purpose; // facultatif, ex: "session encryption", "data signing"

    @NotBlank(message = "Owner ID is required")
    private String ownerId;
}
