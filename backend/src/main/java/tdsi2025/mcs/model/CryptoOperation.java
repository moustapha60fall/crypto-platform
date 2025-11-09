package tdsi2025.mcs.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import tdsi2025.mcs.enums.CryptoAlgorithm;
import tdsi2025.mcs.enums.CryptoPrimitiveType;
import tdsi2025.mcs.enums.CryptoServiceType;
import tdsi2025.mcs.enums.OperationStatus;

import java.time.Instant;

@Entity
@Table(name = "crypto_operation", indexes = {
        @Index(name = "idx_cryptoop_ts", columnList = "created_at"),
        @Index(name = "idx_cryptoop_user", columnList = "performed_by_id"),
        @Index(name = "idx_cryptoop_key", columnList = "key_material_id")

})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CryptoOperation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "service_type", nullable = false, length = 32)
    private CryptoServiceType serviceType;

    @Enumerated(EnumType.STRING)
    @Column(name = "primitive_type", nullable = false, length = 32)
    private CryptoPrimitiveType primitiveType;

    @Enumerated(EnumType.STRING)
    @Column(name = "algorithm", nullable = false, length = 32)
    private CryptoAlgorithm algorithm;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    private OperationStatus status;

    @Lob
    @Column(name = "metadata")
    private String metadata;

    @Lob
    @Column(name = "input_data_encrypted")
    @JsonIgnore
    private String inputDataEncrypted;

    @Lob
    @Column(name = "output_data_encrypted")
    @JsonIgnore
    private String outputDataEncrypted;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "performed_by_id", nullable = false)
    private AppUser performedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "key_material_id")
    private KeyMaterial keyMaterial;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

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

    public String getInputDataEncrypted() {
        return inputDataEncrypted;
    }

    public void setInputDataEncrypted(String inputDataEncrypted) {
        this.inputDataEncrypted = inputDataEncrypted;
    }

    public String getOutputDataEncrypted() {
        return outputDataEncrypted;
    }

    public void setOutputDataEncrypted(String outputDataEncrypted) {
        this.outputDataEncrypted = outputDataEncrypted;
    }

    public AppUser getPerformedBy() {
        return performedBy;
    }

    public void setPerformedBy(AppUser performedBy) {
        this.performedBy = performedBy;
    }

    public KeyMaterial getKeyMaterial() {
        return keyMaterial;
    }

    public void setKeyMaterial(KeyMaterial keyMaterial) {
        this.keyMaterial = keyMaterial;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
