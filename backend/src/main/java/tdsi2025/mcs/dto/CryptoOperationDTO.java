package tdsi2025.mcs.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import tdsi2025.mcs.enums.CryptoAlgorithm;
import tdsi2025.mcs.enums.CryptoPrimitiveType;
import tdsi2025.mcs.enums.CryptoServiceType;
import tdsi2025.mcs.enums.OperationStatus;

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

    private Long keyMaterialId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public CryptoServiceType getServiceType() {
        return serviceType;
    }

    public void setServiceType(CryptoServiceType serviceType) {
        this.serviceType = serviceType;
    }

    public CryptoPrimitiveType getPrimitiveType() {
        return primitiveType;
    }

    public void setPrimitiveType(CryptoPrimitiveType primitiveType) {
        this.primitiveType = primitiveType;
    }

    public CryptoAlgorithm getAlgorithm() {
        return algorithm;
    }

    public void setAlgorithm(CryptoAlgorithm algorithm) {
        this.algorithm = algorithm;
    }

    public OperationStatus getStatus() {
        return status;
    }

    public void setStatus(OperationStatus status) {
        this.status = status;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }

    public String getPerformedById() {
        return performedById;
    }

    public void setPerformedById(String performedById) {
        this.performedById = performedById;
    }

    public Long getKeyMaterialId() {
        return keyMaterialId;
    }

    public void setKeyMaterialId(Long keyMaterialId) {
        this.keyMaterialId = keyMaterialId;
    }

}
