package tdsi2025.mcs.crypto;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import tdsi2025.mcs.dto.CryptoOperationDTO;
import tdsi2025.mcs.dto.FileCryptoResponseDTO;
import tdsi2025.mcs.dto.KeyMaterialDTO;
import tdsi2025.mcs.enums.*;
import tdsi2025.mcs.exception.CryptoOperationException;
import tdsi2025.mcs.model.AppUser;
import tdsi2025.mcs.security.CurrentUserProvider;
import tdsi2025.mcs.services.CryptoOperationService;
import tdsi2025.mcs.services.KeyMaterialService;
import tdsi2025.mcs.util.CryptoUtil;

import javax.crypto.Mac;
import javax.crypto.SecretKey;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.util.Base64;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class HashingService {

    private static final int BUFFER_SIZE = 8192;

    private final CryptoOperationService cryptoOperationService;
    private final CurrentUserProvider currentUserProvider;
    private final KeyMaterialService keyMaterialService;

    @Value("${app.upload-dir}")
    private String uploadDirPath;

    // -------------------------
    // HASH MESSAGE (Base64 only)
    // -------------------------
    public String hash(String message, HashFunction hashFunction) throws CryptoOperationException {
        AppUser actor = currentUserProvider.getCurrentUser();
        validateMessage(message);

        try {
            String jcaAlgo = CryptoUtil.getDigestJcaName(hashFunction);
            MessageDigest md = MessageDigest.getInstance(jcaAlgo);
            byte[] digest = md.digest(message.getBytes(StandardCharsets.UTF_8));

            String encoded = Base64.getEncoder().encodeToString(digest); // Base64 only
            logOperationHash(hashFunction, message, encoded, actor);

            return encoded;
        } catch (Exception e) {
            logOperationHash(hashFunction, message, "ERROR", actor);
            throw new CryptoOperationException("Erreur lors du calcul du hash : " + e.getMessage());
        }
    }

    // -------------------------
    // HASH FILE (Base64 only)
    // -------------------------
    public FileCryptoResponseDTO hashFile(MultipartFile file, HashFunction hashFunction) throws CryptoOperationException {
        AppUser actor = currentUserProvider.getCurrentUser();

        if (file == null || file.isEmpty()) {
            throw new CryptoOperationException("Fichier vide ou non fourni.");
        }

        try {
            // 📁 Création du dossier upload
            Path uploadDir = Paths.get(uploadDirPath).toAbsolutePath().normalize();
            Files.createDirectories(uploadDir);

            // 🧾 Nom sécurisé
            String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
            String safeName = Paths.get(originalName).getFileName().toString().replaceAll("[^a-zA-Z0-9._-]", "_");

            // 📦 Fichier temporaire
            Path tempInput = Files.createTempFile("hash_input_", "_" + safeName);
            file.transferTo(tempInput.toFile());

            // 🔐 Hashing
            String jcaAlgo = CryptoUtil.getDigestJcaName(hashFunction);
            MessageDigest md = MessageDigest.getInstance(jcaAlgo);

            try (InputStream is = Files.newInputStream(tempInput)) {
                byte[] buffer = new byte[BUFFER_SIZE];
                int len;
                while ((len = is.read(buffer)) != -1) {
                    md.update(buffer, 0, len);
                }
            }

            byte[] digest = md.digest();
            String encoded = Base64.getEncoder().encodeToString(digest);

            // 📄 Sauvegarde du hash dans un fichier
            String outputFileName = "hash_" + System.currentTimeMillis() + ".txt";
            Path finalOutput = uploadDir.resolve(outputFileName);
            Files.writeString(finalOutput, encoded);

            // 🧹 Nettoyage
            Files.deleteIfExists(tempInput);

            logOperationHash(hashFunction, finalOutput.toString(), encoded, actor);

            // 📦 Réponse DTO
            return FileCryptoResponseDTO.builder()
                    .inputFile(safeName)
                    .outputFile(outputFileName)
                    .operation("HASH")
                    .build();

        } catch (Exception e) {
            logOperationHash(hashFunction, file.getOriginalFilename(), "ERROR", actor);
            throw new CryptoOperationException("Erreur lors du hash du fichier : " + e.getMessage());
        }
    }

    // -------------------------
    // COMPUTE HMAC MESSAGE (Base64 only)
    // -------------------------
    public String computeHmac(String message, Long keyId, HashFunction hashFunction) throws CryptoOperationException {
        AppUser actor = currentUserProvider.getCurrentUser();
        validateMessage(message);

        try {
            SecretKey sk = keyMaterialService.getSecretKey(keyId);
            String algo = CryptoUtil.getHmacJcaName(hashFunction);

            Mac mac = Mac.getInstance(algo);
            mac.init(sk);
            byte[] result = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));

            String encoded = Base64.getEncoder().encodeToString(result); // Base64 only
            logOperationHmac(hashFunction, message, encoded, actor, keyId);

            return encoded;
        } catch (Exception e) {
            logOperationHmac(hashFunction, message, "ERROR", actor, keyId);
            throw new CryptoOperationException("Erreur lors du calcul HMAC : " + e.getMessage());
        }
    }

    // -------------------------
    // COMPUTE HMAC FILE (Base64 only)
    // -------------------------
    public FileCryptoResponseDTO computeHmacFile(MultipartFile file, Long keyId, HashFunction hashFunction)
            throws CryptoOperationException {

        AppUser actor = currentUserProvider.getCurrentUser();

        if (file == null || file.isEmpty()) {
            throw new CryptoOperationException("Fichier vide ou non fourni.");
        }

        try {
            // 📁 Création du dossier upload
            Path uploadDir = Paths.get(uploadDirPath).toAbsolutePath().normalize();
            Files.createDirectories(uploadDir);

            // 🧾 Nom sécurisé
            String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
            String safeName = Paths.get(originalName).getFileName().toString().replaceAll("[^a-zA-Z0-9._-]", "_");

            // 📦 Fichier temporaire
            Path tempInput = Files.createTempFile("hmac_input_", "_" + safeName);
            file.transferTo(tempInput.toFile());

            // 🔐 HMAC computation
            SecretKey sk = keyMaterialService.getSecretKey(keyId);
            String algo = CryptoUtil.getHmacJcaName(hashFunction);

            Mac mac = Mac.getInstance(algo);
            mac.init(sk);

            try (InputStream is = Files.newInputStream(tempInput)) {
                byte[] buffer = new byte[BUFFER_SIZE];
                int len;
                while ((len = is.read(buffer)) != -1) {
                    mac.update(buffer, 0, len);
                }
            }

            byte[] result = mac.doFinal();
            String encoded = Base64.getEncoder().encodeToString(result);

            // 📄 Sauvegarde du HMAC dans un fichier texte
            String outputFileName = "hmac_" + System.currentTimeMillis() + ".txt";
            Path finalOutput = uploadDir.resolve(outputFileName);
            Files.writeString(finalOutput, encoded);

            // 🧹 Nettoyage du temporaire
            Files.deleteIfExists(tempInput);

            // 🪵 Log opération
            logOperationHmac(hashFunction, finalOutput.toString(), encoded, actor, keyId);

            KeyMaterialDTO key = keyMaterialService.findById(keyId);

            // 📦 Réponse DTO
            return FileCryptoResponseDTO.builder()
                    .inputFile(safeName)
                    .outputFile(outputFileName)
                    .operation("HMAC")
                    .build();

        } catch (Exception e) {
            logOperationHmac(hashFunction, file.getOriginalFilename(), "ERROR", actor, keyId);
            throw new CryptoOperationException("Erreur lors du calcul HMAC du fichier : " + e.getMessage());
        }
    }

    // -------------------------
    // Logging HASH
    // -------------------------
    private void logOperationHash(HashFunction hashFunction, String input, String output, AppUser actor) {
        try {
            cryptoOperationService.createOperation(
                    CryptoOperationDTO.builder()
                            .serviceType(CryptoServiceType.INTEGRITY)
                            .primitiveType(CryptoPrimitiveType.HASHING)
                            .algorithm(CryptoAlgorithm.valueOf(hashFunction.name()))
                            .status(OperationStatus.SUCCESS)
                            .metadata("input=" + input + ", length=" + (input != null ? input.length() : 0))
                            .performedById(actor.getId())
                            .build(),
                    input, output
            );
        } catch (Exception e) {
            log.warn("⚠️ Échec du log de hash : {}", e.getMessage());
        }
    }

    // -------------------------
    // Logging HMAC
    // -------------------------
    private void logOperationHmac(HashFunction hashFunction, String input, String output, AppUser actor, Long keyId) {

        KeyMaterialDTO key = keyMaterialService.findById(keyId);

        try {
            cryptoOperationService.createOperation(
                    CryptoOperationDTO.builder()
                            .serviceType(CryptoServiceType.INTEGRITY)
                            .primitiveType(CryptoPrimitiveType.HASHING)
                            .algorithm(CryptoAlgorithm.valueOf(hashFunction.name()))
                            .status(OperationStatus.SUCCESS)
                            .metadata("input=" + input + ", length=" + (input != null ? input.length() : 0) + ", type=HMAC")
                            .performedById(actor.getId())
                            .keyMaterialId(key.getId())
                            .build(),
                    input, output
            );
        } catch (Exception e) {
            log.warn("⚠️ Échec du log HMAC : {}", e.getMessage());
        }
    }

    // -------------------------
    // Validation des entrées
    // -------------------------
    private void validateMessage(String message) {
        if (message == null || message.isBlank()) {
            throw new IllegalArgumentException("Message requis pour le hash/HMAC");
        }
    }
}
