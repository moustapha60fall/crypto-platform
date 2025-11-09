package tdsi2025.mcs.interfaces;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.*;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.file.*;
import java.security.SecureRandom;
import java.util.Base64;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class AesGcmKeyEncryptor implements KeyEncryptor {

    private static final String AES_ALGO = "AES";
    private static final String AES_GCM = "AES/GCM/NoPadding";
    private static final int GCM_TAG_BITS = 128;
    private static final int GCM_IV_LEN = 12;
    private static final int MASTER_KEY_BITS = 256;

    private final SecureRandom rng = new SecureRandom();
    private SecretKey masterKey;

    // 🔧 Optionnel : clé maîtresse injectée via application.properties
    @Value("${kms.masterKeyBase64:}")
    private String configuredMasterKeyBase64;

    // 🔧 Emplacement du fichier local pour clé maître persistante
    private static final Path MASTER_KEY_PATH = Paths.get("kms-master.key");

    @PostConstruct
    public void init() throws Exception {
        // 1️⃣ Priorité à la configuration explicite (application.properties)
        if (configuredMasterKeyBase64 != null && !configuredMasterKeyBase64.isBlank()) {
            byte[] keyBytes = Base64.getDecoder().decode(configuredMasterKeyBase64);
            masterKey = new SecretKeySpec(keyBytes, AES_ALGO);
            log.info("✅ Clé maître chargée depuis la configuration (Base64).");
            return;
        }

        // 2️⃣ Sinon, tentative de lecture depuis un fichier local
        if (Files.exists(MASTER_KEY_PATH)) {
            try {
                byte[] keyBytes = Base64.getDecoder().decode(Files.readString(MASTER_KEY_PATH).trim());
                masterKey = new SecretKeySpec(keyBytes, AES_ALGO);
                log.info("✅ Clé maître chargée depuis le fichier local : {}", MASTER_KEY_PATH.toAbsolutePath());
                return;
            } catch (IOException e) {
                log.error("❌ Impossible de lire la clé maître persistante : {}", e.getMessage());
            }
        }

        // 3️⃣ Si aucune clé n’est trouvée, génération d’une nouvelle (⚠️ pour usage local/dev)
        log.warn("⚠️ Aucune clé maître trouvée — génération d’une nouvelle (usage DEV uniquement).");
        KeyGenerator kg = KeyGenerator.getInstance(AES_ALGO);
        kg.init(MASTER_KEY_BITS, rng);
        masterKey = kg.generateKey();

        try {
            Files.writeString(MASTER_KEY_PATH,
                    Base64.getEncoder().encodeToString(masterKey.getEncoded()),
                    StandardOpenOption.CREATE_NEW);
            log.info("💾 Nouvelle clé maître générée et sauvegardée : {}", MASTER_KEY_PATH.toAbsolutePath());
        } catch (IOException e) {
            log.error("⚠️ Impossible d’écrire la clé maître sur disque : {}", e.getMessage());
        }
    }

    // ==========================================================
    // 🔒 Chiffrement
    // ==========================================================
    @Override
    public String encrypt(byte[] plaintext) throws Exception {
        Cipher cipher = Cipher.getInstance(AES_GCM);
        byte[] iv = new byte[GCM_IV_LEN];
        rng.nextBytes(iv);
        GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_BITS, iv);
        cipher.init(Cipher.ENCRYPT_MODE, masterKey, spec);
        byte[] ciphertext = cipher.doFinal(plaintext);

        // [ IV || ciphertext+tag ]
        ByteBuffer buf = ByteBuffer.allocate(iv.length + ciphertext.length);
        buf.put(iv);
        buf.put(ciphertext);
        return Base64.getEncoder().encodeToString(buf.array());
    }

    // ==========================================================
    // 🔓 Déchiffrement
    // ==========================================================
    @Override
    public byte[] decrypt(String base64Ciphertext) throws Exception {
        try {
            byte[] combined = Base64.getDecoder().decode(base64Ciphertext);
            ByteBuffer buf = ByteBuffer.wrap(combined);

            byte[] iv = new byte[GCM_IV_LEN];
            buf.get(iv);
            byte[] cipher = new byte[buf.remaining()];
            buf.get(cipher);

            log.debug("🔑 Déchiffrement AES-GCM - IV: {}, CipherLen: {}, MasterKey present: {}",
                    Base64.getEncoder().encodeToString(iv),
                    cipher.length,
                    masterKey != null);

            Cipher c = Cipher.getInstance(AES_GCM);
            GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_BITS, iv);
            c.init(Cipher.DECRYPT_MODE, masterKey, spec);

            byte[] plaintext = c.doFinal(cipher);
            log.debug("✅ Déchiffrement réussi - PlaintextLen: {}", plaintext.length);
            return plaintext;

        } catch (AEADBadTagException e) {
            log.error("❌ AES-GCM Tag mismatch - possible cause: clé invalide ou données corrompues. Base64: {}",
                    base64Ciphertext, e);
            throw e;
        } catch (Exception e) {
            log.error("❌ Erreur déchiffrement AES-GCM", e);
            throw e;
        }
    }
}
