package tdsi2025.mcs.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import tdsi2025.mcs.enums.CryptoAlgorithm;
import tdsi2025.mcs.enums.KeyType;

import java.time.Instant;

@Entity
@Table(name = "key_material", indexes = {
        @Index(name = "idx_keymaterial_name", columnList = "name"),
        @Index(name = "idx_keymaterial_keyref", columnList = "key_ref")
})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KeyMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 128)
    @Size(max = 128)
    @NotBlank
    private String name;

    @Column(length = 128)
    @Size(max = 128)
    private String purpose;

    @Enumerated(EnumType.STRING)
    @Column(name = "key_type", nullable = false, length = 32)
    private KeyType keyType;

    @Enumerated(EnumType.STRING)
    @Column(name = "algorithm", nullable = false, length = 32)
    private CryptoAlgorithm algorithm;

    @Lob
    @Column(name = "encoded_key")
    private String encodedKey;

    @Column(name = "key_ref", nullable = false)
    @NotBlank
    private String keyRef;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    @JsonIgnore
    private AppUser owner;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "deprecated", nullable = false)
    private boolean deprecated = false;

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

    public AppUser getOwner() {
        return owner;
    }

    public void setOwner(AppUser owner) {
        this.owner = owner;
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
