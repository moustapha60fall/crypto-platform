package tdsi2025.mcs.crypto;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tdsi2025.mcs.dto.CryptoOperationDTO;
import tdsi2025.mcs.dto.KeyMaterialDTO;
import tdsi2025.mcs.dto.WrappedKeyDTO;
import tdsi2025.mcs.enums.*;
import tdsi2025.mcs.exception.CryptoOperationException;
import tdsi2025.mcs.model.AppUser;
import tdsi2025.mcs.model.KeyMaterial;
import tdsi2025.mcs.security.CurrentUserProvider;
import tdsi2025.mcs.services.CryptoOperationService;
import tdsi2025.mcs.services.KeyMaterialService;
import tdsi2025.mcs.util.CryptoUtil;

import javax.crypto.Cipher;
import java.security.Key;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class KeyWrappingService {

    private final KeyMaterialService keyMaterialService;
    private final CryptoOperationService cryptoOperationService;
    private final CurrentUserProvider currentUserProvider;

    // ==========================================================
    // 🔒 WRAP / UNWRAP PUBLIC API
    // ==========================================================

    public WrappedKeyDTO wrapKey(WrappedKeyDTO dto) throws CryptoOperationException {
        return processWrapping(dto, Cipher.WRAP_MODE, CryptoPrimitiveType.KEY_WRAPPING);
    }

    public WrappedKeyDTO unwrapKey(WrappedKeyDTO dto) throws CryptoOperationException {
        return processWrapping(dto, Cipher.UNWRAP_MODE, CryptoPrimitiveType.KEY_UNWRAPPING);
    }

    // ==========================================================
    // 🔧 CORE LOGIC
    // ==========================================================

    private WrappedKeyDTO processWrapping(WrappedKeyDTO dto, int opMode, CryptoPrimitiveType primitive)
            throws CryptoOperationException {

        AppUser actor = currentUserProvider.getCurrentUser();
        log.info("🚀 Début processWrapping [{}] - Primitive: {}", (opMode == Cipher.WRAP_MODE ? "WRAP" : "UNWRAP"), primitive);

        if (dto == null)
            throw new IllegalArgumentException("DTO cannot be null");
        if (dto.getAlgorithm() == null)
            throw new IllegalArgumentException("Algorithm is required");

        CryptoAlgorithm algo = dto.getAlgorithm();
        PaddingScheme padding = dto.getPadding() != null ? dto.getPadding() : PaddingScheme.OAEP;
        KeyMaterial wrappingKm = keyMaterialService.findByKeyRefOrThrow(dto.getWrappingKeyRef());

        try {
            if (opMode == Cipher.WRAP_MODE) {
                return doWrap(dto, algo, padding, wrappingKm, actor, primitive);
            } else {
                return doUnwrap(dto, algo, padding, wrappingKm, actor, primitive);
            }
        } catch (Exception e) {
            log.error("❌ Erreur lors de processWrapping (primitive={})", primitive, e);
            throw new CryptoOperationException("Erreur " + primitive + " : " + e.getMessage());
        }
    }

    // ==========================================================
    // 🔒 WRAP
    // ==========================================================

    private WrappedKeyDTO doWrap(WrappedKeyDTO dto, CryptoAlgorithm algo, PaddingScheme padding,
                                 KeyMaterial wrappingKm, AppUser actor, CryptoPrimitiveType primitive) throws Exception {

        log.info("🔒 Mode WRAP - TargetKeyRef={} | WrappingKeyRef={}",
                dto.getTargetKeyRef(), dto.getWrappingKeyRef());

        // 1️⃣ Récupération de la clé à envelopper
        Key keyToWrap = keyMaterialService.getSecretKeyByRef(dto.getTargetKeyRef());
        if (keyToWrap == null)
            throw new CryptoOperationException("Clé cible introuvable : " + dto.getTargetKeyRef());

        log.debug("Clé à envelopper : Algo={}, Format={}", keyToWrap.getAlgorithm(), keyToWrap.getFormat());

        // 2️⃣ Récupération de la clé d’enveloppement (publique ou secrète)
        Key wrappingKey = (algo == CryptoAlgorithm.RSA)
                ? keyMaterialService.getPublicKey(dto.getWrappingKeyRef())
                : keyMaterialService.getSecretKeyByRef(dto.getWrappingKeyRef());

        if (wrappingKey == null)
            throw new CryptoOperationException("Clé d’enveloppement introuvable : " + dto.getWrappingKeyRef());

        log.debug("Clé d’enveloppement : Type={}, Format={}", wrappingKey.getAlgorithm(), wrappingKey.getFormat());

        // 3️⃣ Construction du cipher
        Cipher cipher = CryptoUtil.buildAsymmetricOrSymmetricCipher(algo, padding);
        cipher.init(Cipher.WRAP_MODE, wrappingKey);

        // 4️⃣ Enveloppement
        byte[] wrapped = cipher.wrap(keyToWrap);
        String wrappedB64 = Base64.getEncoder().encodeToString(wrapped);
        log.info("✅ Clé enveloppée avec succès ({})", algo);

        // 5️⃣ Audit + DTO
        logOperation(primitive, algo, actor, dto.getTargetKeyRef(), wrappedB64, wrappingKm.getId());

        return WrappedKeyDTO.builder()
                .algorithm(algo)
                .padding(padding)
                .wrappingKeyRef(dto.getWrappingKeyRef())
                .targetKeyRef(dto.getTargetKeyRef())
                .wrappedKeyBase64(wrappedB64)
                .performedById(actor.getId())
                .build();
    }

    // ==========================================================
    // 🔓 UNWRAP
    // ==========================================================

    private WrappedKeyDTO doUnwrap(WrappedKeyDTO dto, CryptoAlgorithm algo, PaddingScheme padding,
                                   KeyMaterial wrappingKm, AppUser actor, CryptoPrimitiveType primitive) throws Exception {

        log.info("🔓 Mode UNWRAP - WrappingKeyRef={}", dto.getWrappingKeyRef());

        byte[] wrappedBytes = Base64.getDecoder().decode(dto.getWrappedKeyBase64());

        // 1️⃣ Récupération de la clé de déballage (privée ou secrète)
        Key unwrappingKey = (algo == CryptoAlgorithm.RSA)
                ? keyMaterialService.getPrivateKey(dto.getWrappingKeyRef())
                : keyMaterialService.getSecretKeyByRef(dto.getWrappingKeyRef());

        if (unwrappingKey == null)
            throw new CryptoOperationException("Clé de déballage introuvable : " + dto.getWrappingKeyRef());

        log.debug("Clé de déballage : Type={}, Format={}", unwrappingKey.getAlgorithm(), unwrappingKey.getFormat());

        // 2️⃣ Préparation du cipher
        Cipher cipher = CryptoUtil.buildAsymmetricOrSymmetricCipher(algo, padding);
        cipher.init(Cipher.UNWRAP_MODE, unwrappingKey);

        int keyTypeCode = switch (dto.getTargetKeyType()) {
            case "PUBLIC_KEY" -> Cipher.PUBLIC_KEY;
            case "PRIVATE_KEY" -> Cipher.PRIVATE_KEY;
            default -> Cipher.SECRET_KEY;
        };

        log.debug("Type cible={} | Algorithme cible={}", keyTypeCode, dto.getTargetKeyAlgorithm());

        // 3️⃣ Déballage
        Key unwrappedKey = cipher.unwrap(
                wrappedBytes,
                dto.getTargetKeyAlgorithm() != null
                        ? dto.getTargetKeyAlgorithm().name()
                        : CryptoAlgorithm.AES.name(),
                keyTypeCode
        );

        if (unwrappedKey == null)
            throw new CryptoOperationException("Erreur lors du déballage (clé NULL)");

        String unwrappedB64 = Base64.getEncoder().encodeToString(unwrappedKey.getEncoded());
        log.info("✅ Clé déballée avec succès ({})", algo);

        // 4️⃣ Création du nouvel enregistrement KeyMaterial
        KeyMaterialDTO newKey = keyMaterialService.createKey(
                KeyMaterialDTO.builder()
                        .keyRef("KM-" + UUID.randomUUID())
                        .name("UnwrappedKey-" + System.currentTimeMillis())
                        .algorithm(dto.getTargetKeyAlgorithm() != null
                                ? dto.getTargetKeyAlgorithm()
                                : CryptoAlgorithm.AES)
                        .encodedKey(unwrappedB64)
                        .keyType(KeyType.fromCipherCode(keyTypeCode))
                        .purpose("UNWRAPPED_FROM_" + dto.getWrappingKeyRef())
                        .ownerId(actor.getId())
                        .createdAt(Instant.now())
                        .deprecated(false)
                        .build(),
                actor.getId()
        );

        log.info("🆕 Nouveau KeyMaterial créé - Ref={}", newKey.getKeyRef());

        // 5️⃣ Audit + DTO
        logOperation(primitive, algo, actor, newKey.getKeyRef(), unwrappedB64, wrappingKm.getId());

        return WrappedKeyDTO.builder()
                .algorithm(algo)
                .padding(padding)
                .wrappingKeyRef(dto.getWrappingKeyRef())
                .targetKeyRef(newKey.getKeyRef())
                .unwrappedKeyBase64(unwrappedB64)
                .performedById(actor.getId())
                .build();
    }

    // ==========================================================
    // 🧾 AUDIT & OPERATION LOGGING
    // ==========================================================

    private void logOperation(CryptoPrimitiveType primitive, CryptoAlgorithm algo, AppUser actor,
                              String targetKeyRef, String outputB64, Long keyMaterialId) {

        String metadata = "algorithm=" + algo + ", targetKey=" + targetKeyRef;

        // Pour éviter conflit SQL, map KEY_WRAPPING/UNWRAPPING vers ENCRYPT/DECRYPT
        CryptoPrimitiveType dbType = switch (primitive) {
            case KEY_WRAPPING -> CryptoPrimitiveType.ENCRYPTION;
            case KEY_UNWRAPPING -> CryptoPrimitiveType.DECRYPTION;
            default -> primitive;
        };

        cryptoOperationService.createOperation(
                CryptoOperationDTO.builder()
                        .serviceType(CryptoServiceType.KEY_MANAGEMENT)
                        .primitiveType(dbType)
                        .algorithm(algo)
                        .status(OperationStatus.SUCCESS)
                        .metadata(metadata)
                        .performedById(actor.getId())
                        .keyMaterialId(keyMaterialId)
                        .build(),
                null,
                outputB64
        );
    }
}
