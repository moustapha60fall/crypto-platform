package tdsi2025.mcs.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import tdsi2025.mcs.enums.CryptoAlgorithm;
import tdsi2025.mcs.enums.PaddingScheme;
import tdsi2025.mcs.enums.SymmetricMode;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SymmetricCryptoDTO {

    @NotBlank
    @Size(max = 256)
    private String keyRef;

    @NotNull
    private CryptoAlgorithm algorithm;

    private SymmetricMode mode;

    @NotNull
    private PaddingScheme padding;

    @Size(min = 1)
    private String inputData; // inputData = données à chiffrer base64

    private String outputData; // outputData = données chiffrées / déchiffrées base64 (résultat)

    private String inputFile;
    private String outputFile;

    @NotBlank
    private String performedById;
}
