package tdsi2025.mcs.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import tdsi2025.mcs.enums.CryptoAlgorithm;
import tdsi2025.mcs.enums.KeyType;
import lombok.Data;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KeyMaterialDTO {

    private Long id;

    @NotBlank
    @Size(max = 128)
    private String name;

    @Size(max = 128)
    private String purpose;

    @NotNull
    private KeyType keyType;

    @NotNull
    private CryptoAlgorithm algorithm;

    private String encodedKey;

    @NotBlank
    private String keyRef;

    private String ownerId;

    private Instant createdAt;

    private boolean deprecated;
}
