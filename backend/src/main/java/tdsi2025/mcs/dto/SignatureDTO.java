package tdsi2025.mcs.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import tdsi2025.mcs.enums.CryptoAlgorithm;
import tdsi2025.mcs.enums.HashFunction;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignatureDTO {

    @NotBlank
    private String message;

    private String signature; // base64 ou hex, selon output format

    private String publicKeyRef;
    private String privateKeyRef;

    private CryptoAlgorithm algorithm;
    private HashFunction hashFunction;

    private boolean base64Output;

    private String performedById;

    private String fileName;
    private boolean valid;
}

