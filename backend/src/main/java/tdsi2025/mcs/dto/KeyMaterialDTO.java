package tdsi2025.mcs.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import tdsi2025.mcs.enums.CryptoAlgorithm;
import tdsi2025.mcs.enums.KeyType;

import java.time.Instant;

@NoArgsConstructor
@AllArgsConstructor
@Builder
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

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public KeyType getKeyType() {
        return keyType;
    }

    public void setKeyType(KeyType keyType) {
        this.keyType = keyType;
    }

    public CryptoAlgorithm getAlgorithm() {
        return algorithm;
    }

    public void setAlgorithm(CryptoAlgorithm algorithm) {
        this.algorithm = algorithm;
    }

    public String getEncodedKey() {
        return encodedKey;
    }

    public void setEncodedKey(String encodedKey) {
        this.encodedKey = encodedKey;
    }

    public String getKeyRef() {
        return keyRef;
    }

    public void setKeyRef(String keyRef) {
        this.keyRef = keyRef;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(String ownerId) {
        this.ownerId = ownerId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isDeprecated() {
        return deprecated;
    }

    public void setDeprecated(boolean deprecated) {
        this.deprecated = deprecated;
    }
}
