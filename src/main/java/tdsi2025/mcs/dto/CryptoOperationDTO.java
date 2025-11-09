package tdsi2025.mcs.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import tdsi2025.mcs.enums.CryptoAlgorithm;
import tdsi2025.mcs.enums.CryptoPrimitiveType;
import tdsi2025.mcs.enums.CryptoServiceType;
import tdsi2025.mcs.enums.OperationStatus;
import lombok.Data;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CryptoOperationDTO {

    private Long id;

    @NotNull
    private CryptoServiceType serviceType;

    @NotNull
    private CryptoPrimitiveType primitiveType;

    @NotNull
    private CryptoAlgorithm algorithm;

    @NotNull
    private OperationStatus status;

    private String metadata;

    private String performedById;
}

