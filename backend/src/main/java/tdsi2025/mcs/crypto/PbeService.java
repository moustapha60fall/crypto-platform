package tdsi2025.mcs.crypto;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tdsi2025.mcs.dto.*;
import tdsi2025.mcs.enums.*;
import tdsi2025.mcs.interfaces.KeyEncryptor;
import tdsi2025.mcs.mapper.KeyMaterialMapper;
import tdsi2025.mcs.model.AppUser;
import tdsi2025.mcs.model.AuditLog;
import tdsi2025.mcs.model.KeyMaterial;
import tdsi2025.mcs.repository.AuditLogRepository;
import tdsi2025.mcs.security.CurrentUserProvider;
import tdsi2025.mcs.services.CryptoOperationService;
import tdsi2025.mcs.services.KeyMaterialService;

import javax.crypto.Mac;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Arrays;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class PbeService {

    private final KeyMaterialService keyMaterialService;
    private final CryptoOperationService cryptoOperationService;
    private final AuditLogRepository auditRepo;
    private final CurrentUserProvider currentUserProvider;
    private final KeyEncryptor keyEncryptor;
    private final KeyMaterialMapper mapper;

    // ================================================================
    // PUBLIC METHOD : Dérivation d'une clé à partir d'une clé maîtresse
    // ================================================================
    public KeyMaterialDTO deriveKeyFromMaster(DerivedKeyDTO dto) throws Exception {
        SecretKey masterKey = keyMaterialService.getSecretKeyByRef(dto.getMasterkeyRef());
        if (masterKey == null) throw new IllegalArgumentException("Master key not found: " + dto.getMasterkeyRef());

        byte[] salt = dto.getSaltBase64() != null ? Base64.getDecoder().decode(dto.getSaltBase64()) : generateRandomSalt();
        int keySize = dto.getKeySize() > 0 ? dto.getKeySize() : 256;

        SecretKey derivedKey = hkdfDeriveKey(masterKey.getEncoded(), salt, keySize, masterKey.getAlgorithm());
        AppUser owner = currentUserProvider.getCurrentUser();

        KeyMaterial derived = buildDerivedKeyMaterial(derivedKey, dto, masterKey, owner);
        KeyMaterialDTO saved = keyMaterialService.createKey(mapper.toDto(derived), dto.getOwnerId());

        logAudit("Derived key from masterKeyId=" + dto.getMasterkeyRef() + ", Size=" + keySize, owner);
        log.info("✅ Derived key '{}' successfully created for owner={}", dto.getName(), dto.getOwnerId());

        logOperation(dto, owner, derived, masterKey, keySize);

        return saved;
    }

    // ================================================================
    // BUILD DERIVED KEY MATERIAL
    // ================================================================
    private KeyMaterial buildDerivedKeyMaterial(SecretKey derivedKey, DerivedKeyDTO dto, SecretKey masterKey, AppUser owner) throws Exception {
        String name = dto.getName() != null ? dto.getName() : "derived_" + dto.getMasterkeyRef() + "_" + System.currentTimeMillis();
        String purpose = dto.getPurpose() != null ? dto.getPurpose() : "DERIVED_FROM_MASTER";

        return KeyMaterial.builder()
                .name("derived_" +name)
                .purpose(purpose)
                .keyType(KeyType.SYMMETRIC)
                .algorithm(CryptoAlgorithm.valueOf(masterKey.getAlgorithm()))
                .keyRef("kms:derived:" + UUID.randomUUID())
                .encodedKey(keyEncryptor.encrypt(derivedKey.getEncoded()))
                .owner(owner)
                .deprecated(false)
                .createdAt(Instant.now())
                .build();
    }

    // ================================================================
    // HKDF IMPLEMENTATION
    // ================================================================
    private SecretKey hkdfDeriveKey(byte[] ikm, byte[] salt, int keySize, String outputAlgo) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(salt, "HmacSHA256"));
        byte[] prk = mac.doFinal(ikm);

        int hashLen = mac.getMacLength();
        int n = (int) Math.ceil((double) keySize / 8 / hashLen);
        byte[] okm = new byte[n * hashLen];
        byte[] previous = new byte[0];

        for (int i = 0; i < n; i++) {
            mac.init(new SecretKeySpec(prk, "HmacSHA256"));
            mac.update(previous);
            mac.update((byte) (i + 1));
            previous = mac.doFinal();
            System.arraycopy(previous, 0, okm, i * hashLen, previous.length);
        }

        return new SecretKeySpec(Arrays.copyOf(okm, keySize / 8), outputAlgo);
    }

    // ================================================================
    // UTILITIES
    // ================================================================
    private byte[] generateRandomSalt() {
        byte[] salt = new byte[16];
        new SecureRandom().nextBytes(salt);
        return salt;
    }

    private void logAudit(String details, AppUser actor) {
        auditRepo.save(AuditLog.builder()
                .action(AuditAction.KEY_CREATED.name())
                .details(details)
                .actor(actor)
                .requestId(UUID.randomUUID().toString())
                .createdAt(Instant.now())
                .verified(true)
                .build());
    }

    // ================================================================
    // CRYPTO OPERATION LOGGING
    // ================================================================
    private void logOperation(DerivedKeyDTO dto, AppUser actor,
                              KeyMaterial derived, SecretKey masterKey, int keySize) {

        try {
            KeyMaterial masterMaterial = keyMaterialService.findByKeyRefOrThrow(dto.getMasterkeyRef());

            String metadata = String.format("Derived key from %s, size=%d bits, algo=%s",
                    dto.getMasterkeyRef(), keySize, masterKey.getAlgorithm());

            cryptoOperationService.createOperation(
                    CryptoOperationDTO.builder()
                            .serviceType(CryptoServiceType.KEY_MANAGEMENT)
                            .primitiveType(CryptoPrimitiveType.KEY_DERIVATION)
                            .algorithm(CryptoAlgorithm.valueOf(masterKey.getAlgorithm()))
                            .status(OperationStatus.SUCCESS)
                            .performedById(actor.getId())
                            .keyMaterialId(masterMaterial.getId())
                            .metadata(metadata)
                            .build(),
                    null,
                    derived.getKeyRef()
            );

            log.info("🧩 CryptoOperation enregistrée : dérivation depuis masterKeyId={}", masterMaterial.getId());

        } catch (Exception e) {
            log.error("❌ Échec de logOperation pour deriveKeyFromMaster : {}", e.getMessage());
        }
    }

}
