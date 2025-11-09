package tdsi2025.mcs.services;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tdsi2025.mcs.dto.KeyMaterialDTO;
import tdsi2025.mcs.enums.AuditAction;
import tdsi2025.mcs.enums.CryptoAlgorithm;
import tdsi2025.mcs.enums.KeyType;
import tdsi2025.mcs.exception.*;
import tdsi2025.mcs.exception.KeyManagementException;
import tdsi2025.mcs.interfaces.KeyEncryptor;
import tdsi2025.mcs.mapper.KeyMaterialMapper;
import tdsi2025.mcs.model.AppUser;
import tdsi2025.mcs.model.AuditLog;
import tdsi2025.mcs.model.KeyMaterial;
import tdsi2025.mcs.repository.AppUserRepository;
import tdsi2025.mcs.repository.AuditLogRepository;
import tdsi2025.mcs.repository.KeyMaterialRepository;
import tdsi2025.mcs.util.CryptoUtil;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.security.*;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class KeyMaterialService {

    private final KeyMaterialRepository keyRepo;
    private final AppUserRepository userRepo;
    private final AuditLogRepository auditRepo;
    private final KeyMaterialMapper mapper;
    @Getter
    private final KeyEncryptor keyEncryptor;

    // --- Public API -------------------------------------------------

    public KeyMaterialDTO createKey(KeyMaterialDTO dto, String ownerId) {
        AppUser owner = getOwner(ownerId);
        KeyMaterial entity = mapper.toEntity(dto);
        entity.setOwner(owner);

        KeyMaterial saved = keyRepo.save(entity);
        logAudit("Key=" + saved.getName() + " Algorithm=" + saved.getAlgorithm(), owner, saved.getCreatedAt());

        return mapper.toDto(saved);
    }

    private void logAudit(String details, AppUser actor, Instant timestamp) {
        auditRepo.save(AuditLog.builder()
                .action("KEY_CREATED")
                .details(details)
                .actor(actor)
                .requestId(UUID.randomUUID().toString())
                .createdAt(timestamp)
                .verified(true)
                .build());
    }

    public Map<String, KeyMaterialDTO> generateKey(String algorithm, int keySize, String namePrefix, String ownerId) {
        AppUser owner = getOwner(ownerId);
        String normalized = algorithm.toUpperCase(Locale.ROOT);

        try {
            if (CryptoUtil.isAlgorithmSupported("symmetric", normalized)) {
                // --- SYMMETRIC ---
                CryptoAlgorithm algoEnum = CryptoAlgorithm.valueOf(normalized);
                if (!CryptoUtil.isValidKeySize(algoEnum, keySize))
                    throw new UnsupportedAlgorithmException("Invalid key size for " + normalized + ": " + keySize);

                SecretKey secretKey = CryptoUtil.generateSymmetricKey(normalized, keySize);
                String encrypted = keyEncryptor.encrypt(secretKey.getEncoded());

                KeyMaterial entry = KeyMaterial.builder()
                        .name(namePrefix)
                        .purpose("Confidentiality")
                        .keyType(KeyType.SYMMETRIC)
                        .algorithm(algoEnum)
                        .keyRef("kms:internal:" + UUID.randomUUID())
                        .encodedKey(encrypted)
                        .owner(owner)
                        .deprecated(false)
                        .createdAt(Instant.now())
                        .build();

                KeyMaterial saved = keyRepo.save(entry);
                logAudit(AuditAction.KEY_CREATED, "Key=" + saved.getName() + " Algo=" + normalized + " Size=" + keySize, owner);

                return Map.of("symmetric", mapper.toDto(saved));

            } else if (CryptoUtil.isAlgorithmSupported("asymmetric", normalized)
                    || CryptoUtil.isAlgorithmSupported("signature", normalized)) {
                // --- ASYMMETRIC ---
                KeyPair pair = CryptoUtil.generateAsymmetricKeyPair(normalized, keySize);
                Instant now = Instant.now();

                String pubRef = "kms:internal:" + UUID.randomUUID();
                String privRef = "kms:internal:" + UUID.randomUUID();

                String pubB64 = Base64.getEncoder().encodeToString(pair.getPublic().getEncoded());
                String privEnc = keyEncryptor.encrypt(pair.getPrivate().getEncoded());

                KeyMaterial pub = KeyMaterial.builder()
                        .name(namePrefix + "_PUBLIC")
                        .purpose("Authenticity")
                        .keyType(KeyType.ASYMMETRIC_PUBLIC)
                        .algorithm(CryptoAlgorithm.valueOf(normalized))
                        .keyRef(pubRef)
                        .encodedKey(pubB64)
                        .owner(owner)
                        .deprecated(false)
                        .createdAt(now)
                        .build();

                KeyMaterial priv = KeyMaterial.builder()
                        .name(namePrefix + "_PRIVATE")
                        .purpose("Signature")
                        .keyType(KeyType.ASYMMETRIC_PRIVATE)
                        .algorithm(CryptoAlgorithm.valueOf(normalized))
                        .keyRef(privRef)
                        .encodedKey(privEnc)
                        .owner(owner)
                        .deprecated(false)
                        .createdAt(now)
                        .build();

                keyRepo.save(pub);
                keyRepo.save(priv);

                logAudit(AuditAction.KEY_CREATED, "Asymmetric keypair=" + normalized + " size=" + keySize, owner);

                return Map.of(
                        "public", mapper.toDto(pub),
                        "private", mapper.toDto(priv)
                );
            }

            throw new UnsupportedAlgorithmException("Algorithm category not supported: " + algorithm);

        } catch (Exception e) {
            throw new KeyManagementException("Failed to generate key for " + algorithm + ": " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public SecretKey getSecretKey(Long keyId) throws Exception {
        KeyMaterial key = keyRepo.findById(keyId)
                .orElseThrow(() -> new KeyNotFoundException(keyId));
        if (key.getKeyType() != KeyType.SYMMETRIC) {
            throw new IllegalArgumentException("Clé non symétrique : " + keyId);
        }
        byte[] plain = keyEncryptor.decrypt(key.getEncodedKey());
        return new SecretKeySpec(plain, 0, plain.length, key.getAlgorithm().name());
    }

    @Transactional(readOnly = true)
    public SecretKey getSecretKeyByRef(String keyRef) throws Exception {
        KeyMaterial key = keyRepo.findByKeyRef(keyRef)
                .orElseThrow(() -> new IllegalArgumentException("Clé introuvable : " + keyRef));
        byte[] plain = keyEncryptor.decrypt(key.getEncodedKey());
        return new SecretKeySpec(plain, 0, plain.length, key.getAlgorithm().name());
    }

    @Transactional(readOnly = true)
    public PublicKey getPublicKey(String keyRef) {
        KeyMaterial km = keyRepo.findByKeyRef(keyRef)
                .orElseThrow(() -> new KeyNotFoundException(keyRef));
        if (km.getKeyType() != KeyType.ASYMMETRIC_PUBLIC) {
            throw new IllegalArgumentException("Clé non publique : " + keyRef);
        }
        try {
            byte[] keyBytes = Base64.getDecoder().decode(km.getEncodedKey());
            KeyFactory kf = CryptoUtil.getKeyFactory(km.getAlgorithm().name());
            return kf.generatePublic(new X509EncodedKeySpec(keyBytes));
        } catch (Exception e) {
            throw new IllegalStateException("Impossible de reconstruire la clé publique : " + keyRef, e);
        }
    }

    @Transactional(readOnly = true)
    public PrivateKey getPrivateKey(String keyRef) {
        KeyMaterial km = keyRepo.findByKeyRef(keyRef)
                .orElseThrow(() -> new KeyNotFoundException(keyRef));
        if (km.getKeyType() != KeyType.ASYMMETRIC_PRIVATE) {
            throw new IllegalArgumentException("Clé non privée : " + keyRef);
        }
        try {
            byte[] decrypted = keyEncryptor.decrypt(km.getEncodedKey());
            KeyFactory kf = CryptoUtil.getKeyFactory(km.getAlgorithm().name());
            return kf.generatePrivate(new PKCS8EncodedKeySpec(decrypted));
        } catch (Exception e) {
            throw new IllegalStateException("Impossible de reconstruire la clé privée : " + keyRef, e);
        }
    }

    @Transactional(readOnly = true)
    public KeyMaterial findByIdOrThrow(Long keyId) {
        return keyRepo.findById(keyId)
                .orElseThrow(() -> new KeyNotFoundException(keyId));
    }

    @Transactional(readOnly = true)
    public KeyMaterial findByKeyRefOrThrow(String privateKeyRef) {
        return keyRepo.findByKeyRef(privateKeyRef)
                .orElseThrow(() -> new KeyNotFoundException(privateKeyRef));
    }

    @Transactional(readOnly = true)
    public KeyMaterialDTO findById(Long id) {
        KeyMaterial key = keyRepo.findById(id).orElseThrow(() -> new KeyNotFoundException(id));
        return mapper.toDto(key);
    }

    @Transactional(readOnly = true)
    public KeyMaterialDTO findByKeyRef(String keyRef) {
        KeyMaterial key = keyRepo.findByKeyRef(keyRef)
                .orElseThrow(() -> new KeyRefNotFoundException(keyRef));
        return mapper.toDto(key);
    }

    @Transactional(readOnly = true)
    public List<KeyMaterialDTO> findByOwner(String ownerId) {
        AppUser owner = getOwner(ownerId);
        return keyRepo.findByOwner(owner).stream().map(mapper::toDto).toList();
    }

    public KeyMaterialDTO deprecateKey(Long keyId) {
        KeyMaterial km = keyRepo.findById(keyId).orElseThrow(() -> new KeyNotFoundException(keyId));
        km.setDeprecated(true);
        KeyMaterial saved = keyRepo.save(km);
        logAudit(AuditAction.KEY_DEPRECATED, "Key=" + saved.getName(), saved.getOwner());
        return mapper.toDto(saved);
    }

    // -------------------- helpers --------------------

    public String encryptKeyToBase64(byte[] plaintext) throws Exception {
        return keyEncryptor.encrypt(plaintext);
    }

    public byte[] decryptKeyFromBase64(String ciphertext) throws Exception {
        return keyEncryptor.decrypt(ciphertext);
    }

    private AppUser getOwner(String ownerId) {
        return userRepo.findById(ownerId).orElseThrow(() -> new KeyOwnerNotFoundException(ownerId));
    }

    private void logAudit(AuditAction action, String details, AppUser actor) {
        AuditLog a = AuditLog.builder()
                .action(action.name())
                .details(details)
                .actor(actor)
                .verified(true)
                .requestId(UUID.randomUUID().toString())
                .createdAt(Instant.now())
                .build();
        auditRepo.save(a);
    }

}
