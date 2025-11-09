package tdsi2025.mcs.crypto;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tdsi2025.mcs.dto.KeyMaterialDTO;
import tdsi2025.mcs.enums.*;
import tdsi2025.mcs.interfaces.KeyEncryptor;
import tdsi2025.mcs.model.KeyMaterial;
import tdsi2025.mcs.services.KeyMaterialService;
import tdsi2025.mcs.util.CryptoUtil;

import javax.crypto.KeyAgreement;
import javax.crypto.spec.SecretKeySpec;
import java.security.*;
import java.security.spec.ECGenParameterSpec;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class KeyExchangeService {

    private final KeyMaterialService keyMaterialService;
    private final Logger log = LoggerFactory.getLogger(KeyExchangeService.class);
    private final KeyEncryptor keyEncryptor;

    // ==========================================================
    // 🔑 Récupération de la clé privée locale
    // ==========================================================
    @Transactional(readOnly = true)
    public PrivateKey getPrivateKey(String privateKeyRef) {
        KeyMaterial km = keyMaterialService.findByKeyRefOrThrow(privateKeyRef);

        if (km.getKeyType() != KeyType.ASYMMETRIC_PRIVATE) {
            throw new IllegalArgumentException("La clé n’est pas privée : " + privateKeyRef);
        }

        try {
            byte[] decrypted = keyEncryptor.decrypt(km.getEncodedKey());
            log.debug("Clé privée décryptée : {} bytes, alg={}", decrypted.length, km.getAlgorithm().name());
            KeyFactory kf = CryptoUtil.getKeyFactory(km.getAlgorithm().name());
            return kf.generatePrivate(new PKCS8EncodedKeySpec(decrypted));
        } catch (Exception e) {
            throw new IllegalStateException("Impossible de reconstruire la clé privée : " + privateKeyRef, e);
        }
    }

    // ==========================================================
    // 🔹 Reconstruction d’une clé publique à partir d’un encodage X.509
    // ==========================================================
    public PublicKey reconstructPublicKey(byte[] encodedPubKey) throws GeneralSecurityException {
        try {
            KeyFactory kf = KeyFactory.getInstance("DH");
            return kf.generatePublic(new X509EncodedKeySpec(encodedPubKey));
        } catch (InvalidKeySpecException e) {
            // Si DH échoue, tente ECDH
            KeyFactory kf = KeyFactory.getInstance("EC");
            return kf.generatePublic(new X509EncodedKeySpec(encodedPubKey));
        }
    }

    // ==========================================================
    // 🔄 Dérivation d’une clé partagée (DH/ECDH)
    // ==========================================================
    public SecretKeySpec deriveSharedSecret(PrivateKey privKey, PublicKey peerPubKey) throws GeneralSecurityException {
        KeyAgreement ka;

        if ("DH".equalsIgnoreCase(privKey.getAlgorithm())) {
            ka = KeyAgreement.getInstance("DH");
        } else if ("EC".equalsIgnoreCase(privKey.getAlgorithm()) || "ECDH".equalsIgnoreCase(privKey.getAlgorithm())) {
            ka = KeyAgreement.getInstance("ECDH");
        } else {
            throw new IllegalArgumentException("Algorithme non supporté pour la dérivation : " + privKey.getAlgorithm());
        }

        ka.init(privKey);
        ka.doPhase(peerPubKey, true);
        byte[] sharedSecret = ka.generateSecret();
        log.debug("Secret partagé généré : {} bytes", sharedSecret.length);

        // Dérivation d’une clé AES 256 bits via SHA-256
        MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
        byte[] keyBytes = sha256.digest(sharedSecret);
        return new SecretKeySpec(Arrays.copyOf(keyBytes, 32), "AES");
    }

    // ==========================================================
    // 🔑 Génération d’une paire de clés DH ou ECDH
    // ==========================================================
    public Map<String, KeyMaterialDTO> generateKeyExchangePair(String algorithm, String namePrefix, String ownerId)
            throws KeyManagementException {
        try {
            KeyPairGenerator kpg;
            CryptoAlgorithm algoEnum;

            if ("ECDH".equalsIgnoreCase(algorithm)) {
                kpg = KeyPairGenerator.getInstance("EC");
                kpg.initialize(new ECGenParameterSpec("secp256r1"));
                algoEnum = CryptoAlgorithm.ECC;
            } else {
                kpg = KeyPairGenerator.getInstance("DH");
                kpg.initialize(2048);
                algoEnum = CryptoAlgorithm.ELGAMAL;
            }

            KeyPair kp = kpg.generateKeyPair();
            Instant now = Instant.now();

            // Sérialisation
            String pubB64 = Base64.getEncoder().encodeToString(kp.getPublic().getEncoded());
            String privEnc = keyMaterialService.encryptKeyToBase64(kp.getPrivate().getEncoded());

            String pubRef = "kms:internal:" + UUID.randomUUID();
            String privRef = "kms:internal:" + UUID.randomUUID();

            KeyMaterialDTO pubDTO = KeyMaterialDTO.builder()
                    .name(namePrefix + "_PUB")
                    .purpose("Key Exchange")
                    .keyType(KeyType.ASYMMETRIC_PUBLIC)
                    .algorithm(algoEnum)
                    .keyRef(pubRef)
                    .encodedKey(pubB64)
                    .ownerId(ownerId)
                    .createdAt(now)
                    .build();

            KeyMaterialDTO privDTO = KeyMaterialDTO.builder()
                    .name(namePrefix + "_PRIV")
                    .purpose("Key Exchange")
                    .keyType(KeyType.ASYMMETRIC_PRIVATE)
                    .algorithm(algoEnum)
                    .keyRef(privRef)
                    .encodedKey(privEnc)
                    .ownerId(ownerId)
                    .createdAt(now)
                    .build();

            KeyMaterialDTO savedPub = keyMaterialService.createKey(pubDTO, ownerId);
            KeyMaterialDTO savedPriv = keyMaterialService.createKey(privDTO, ownerId);

            log.info("Paire de clés {} générée pour l’utilisateur {}", namePrefix, ownerId);
            return Map.of("public", savedPub, "private", savedPriv);

        } catch (Exception e) {
            throw new KeyManagementException("Erreur génération paire DH/ECDH : " + e.getMessage(), e);
        }
    }
}
