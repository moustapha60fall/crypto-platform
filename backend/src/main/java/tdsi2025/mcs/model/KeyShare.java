package tdsi2025.mcs.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "key_share", indexes = {
        @Index(name = "idx_keyshare_created_at", columnList = "created_at"),
        @Index(name = "idx_keyshare_shared_by", columnList = "shared_by_user_id"),
        @Index(name = "idx_keyshare_shared_with", columnList = "shared_with_user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KeyShare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔗 Clé partagée
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "key_material_id", nullable = false)
    private KeyMaterial keyMaterial;

    // 👤 L’utilisateur qui partage
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "shared_by_user_id", nullable = false)
    private AppUser sharedByUser;

    // 👥 Le destinataire
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "shared_with_user_id", nullable = false)
    private AppUser sharedWithUser;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    // 🔑 Métadonnées de la clé partagée
    private String encodedKey;
    private String algorithm;

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

    public KeyMaterial getKeyMaterial() {
        return keyMaterial;
    }

    public void setKeyMaterial(KeyMaterial keyMaterial) {
        this.keyMaterial = keyMaterial;
    }

    public AppUser getSharedByUser() {
        return sharedByUser;
    }

    public void setSharedByUser(AppUser sharedByUser) {
        this.sharedByUser = sharedByUser;
    }

    public AppUser getSharedWithUser() {
        return sharedWithUser;
    }

    public void setSharedWithUser(AppUser sharedWithUser) {
        this.sharedWithUser = sharedWithUser;
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
