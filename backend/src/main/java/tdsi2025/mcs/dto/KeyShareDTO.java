package tdsi2025.mcs.dto;

import lombok.*;

import java.time.Instant;

@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KeyShareDTO {

    private Long id;
    private Long keyMaterialId;
    private String sharedByUserId;
    private String sharedWithUserId;
    private Instant createdAt;

    // 🔑 Métadonnées de la clé partagée
    private String encodedKey;
    private String algorithm;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getKeyMaterialId() {
        return keyMaterialId;
    }

    public void setKeyMaterialId(Long keyMaterialId) {
        this.keyMaterialId = keyMaterialId;
    }

    public String getSharedByUserId() {
        return sharedByUserId;
    }

    public void setSharedByUserId(String sharedByUserId) {
        this.sharedByUserId = sharedByUserId;
    }

    public String getSharedWithUserId() {
        return sharedWithUserId;
    }

    public void setSharedWithUserId(String sharedWithUserId) {
        this.sharedWithUserId = sharedWithUserId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public String getEncodedKey() {
        return encodedKey;
    }

    public void setEncodedKey(String encodedKey) {
        this.encodedKey = encodedKey;
    }

    public String getAlgorithm() {
        return algorithm;
    }

    public void setAlgorithm(String algorithm) {
        this.algorithm = algorithm;
    }
}
