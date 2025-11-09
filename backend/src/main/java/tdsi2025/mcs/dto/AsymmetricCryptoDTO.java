package tdsi2025.mcs.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import tdsi2025.mcs.enums.CryptoAlgorithm;
import tdsi2025.mcs.enums.PaddingScheme;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AsymmetricCryptoDTO {

    @NotBlank
    @Size(max = 256)
    private String keyRef;

    @NotNull
    private CryptoAlgorithm algorithm;

    @Size(max = 256)
    private String publicKeyRef;

    @Size(max = 256)
    private String privateKeyRef;

    private String inputData; // base64

    private String outputData; // base64

    private PaddingScheme padding;

    @NotBlank
    private String performedById;
}
