package tdsi2025.mcs.crypto;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tdsi2025.mcs.dto.CryptoOperationDTO;
import tdsi2025.mcs.dto.FileSignatureResponseDTO;
import tdsi2025.mcs.dto.SignatureDTO;
import tdsi2025.mcs.enums.*;
import tdsi2025.mcs.exception.CryptoOperationException;
import tdsi2025.mcs.model.AppUser;
import tdsi2025.mcs.model.KeyMaterial;
import tdsi2025.mcs.security.CurrentUserProvider;
import tdsi2025.mcs.services.CryptoOperationService;
import tdsi2025.mcs.services.KeyMaterialService;
import tdsi2025.mcs.util.CryptoUtil;

import java.io.FileInputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.security.*;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SignatureService {

    private static final int BUFFER_SIZE = 8192;

    private final KeyMaterialService keyMaterialService;
    private final CryptoOperationService cryptoOperationService;
    private final CurrentUserProvider currentUserProvider;

    @Value("${app.upload-dir}")
    private String uploadDirPath;

    // -------------------------
// SIGN MESSAGE (corrigé)
// -------------------------
    public SignatureDTO signMessage(SignatureDTO dto) throws CryptoOperationException {
        AppUser actor = currentUserProvider.getCurrentUser();
        try {
            validateSignDtoForSign(dto);

            // récupère la clé privée
            PrivateKey privateKey = keyMaterialService.getPrivateKey(dto.getPrivateKeyRef());
            KeyMaterial keyMaterial = keyMaterialService.findByKeyRefOrThrow(dto.getPrivateKeyRef());

            // résolution du nom JCA (ex: SHA256withRSA)
            String jcaAlgo = CryptoUtil.getSignatureAlgorithm(dto.getAlgorithm(), dto.getHashFunction());

            // normalisation du texte
            String normalizedMessage = normalizeText(dto.getMessage());

            // calcul du hash du message pour audit/debug
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(normalizedMessage.getBytes(StandardCharsets.UTF_8));
            String hashHex = HexFormat.of().formatHex(hashBytes);
            log.debug("🧩 [SIGN] SHA-256(message) = {}", hashHex);

            // initialisation du signataire
            Signature signer = Signature.getInstance(jcaAlgo);
            signer.initSign(privateKey);
            signer.update(normalizedMessage.getBytes(StandardCharsets.UTF_8));

            // génération de la signature
            byte[] sigBytes = signer.sign();
            String encodedSig = Base64.getEncoder().encodeToString(sigBytes);
            dto.setSignature(encodedSig);
            dto.setPerformedById(actor.getId());

            // log/audit
            logOperation(
                    CryptoPrimitiveType.SIGNATURE,
                    dto.getAlgorithm(),
                    normalizedMessage,
                    encodedSig,
                    actor,
                    true,
                    dto.getHashFunction(),
                    keyMaterial.getId()
            );

            return dto;

        } catch (Exception e) {
            log.warn("Erreur signature message: {}", e.getMessage());
            throw new CryptoOperationException("Échec de la signature : " + e.getMessage());
        }
    }

    // -------------------------
// VERIFY MESSAGE (corrigé)
// -------------------------
    public boolean verifyMessage(SignatureDTO dto) throws CryptoOperationException {
        AppUser actor = currentUserProvider.getCurrentUser();
        try {
            if (dto == null) throw new IllegalArgumentException("DTO required");
            if (dto.getPublicKeyRef() == null || dto.getPublicKeyRef().isBlank())
                throw new IllegalArgumentException("publicKeyRef required");
            if (dto.getSignature() == null || dto.getSignature().isBlank())
                throw new IllegalArgumentException("signature required");

            // récupération de la clé publique
            PublicKey publicKey = keyMaterialService.getPublicKey(dto.getPublicKeyRef());
            KeyMaterial keyMaterial = keyMaterialService.findByKeyRefOrThrow(dto.getPublicKeyRef());
            String jcaAlgo = CryptoUtil.getSignatureAlgorithm(dto.getAlgorithm(), dto.getHashFunction());

            // normalisation du texte
            String normalizedMessage = normalizeText(dto.getMessage());

            // calcul du hash du message pour audit/debug
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(normalizedMessage.getBytes(StandardCharsets.UTF_8));
            String hashHex = HexFormat.of().formatHex(hashBytes);
            log.debug("🧩 [VERIFY] SHA-256(message) = {}", hashHex);

            // initialisation du vérificateur
            Signature verifier = Signature.getInstance(jcaAlgo);
            verifier.initVerify(publicKey);
            verifier.update(normalizedMessage.getBytes(StandardCharsets.UTF_8));

            // décodage Base64 et vérification
            byte[] sigBytes = Base64.getDecoder().decode(dto.getSignature());
            boolean valid = verifier.verify(sigBytes);

            // log/audit
            logOperation(
                    CryptoPrimitiveType.VERIFICATION,
                    dto.getAlgorithm(),
                    normalizedMessage,
                    dto.getSignature(),
                    actor,
                    valid,
                    dto.getHashFunction(),
                    keyMaterial.getId()
            );

            log.info("✅ Vérification de signature : {}", valid ? "VALIDE" : "INVALIDE");
            return valid;

        } catch (SignatureException se) {
            throw new CryptoOperationException("Erreur de vérification (SignatureException): " + se.getMessage());
        } catch (Exception e) {
            throw new CryptoOperationException("Erreur de vérification : " + e.getMessage());
        }
    }

    // -------------------------
// Utilitaire de normalisation du texte
// -------------------------
    private static String normalizeText(String input) {
        if (input == null) return "";
        return input
                .replace("\r\n", "\n")   // uniformiser les retours de ligne Windows
                .replace("\r", "\n")     // éliminer les CR restants
                .trim();                 // enlever les espaces ou lignes vides
    }

    // -------------------------
    // SIGN FILE
    // -------------------------
    public FileSignatureResponseDTO signFile(String privateKeyRef,
                                             String inputFile,
                                             CryptoAlgorithm algorithm,
                                             HashFunction hashFunction) throws CryptoOperationException {
        AppUser actor = currentUserProvider.getCurrentUser();

        Path inPath = Paths.get(inputFile);
        if (!Files.exists(inPath)) throw new CryptoOperationException("Fichier introuvable: " + inputFile);

        try {
            PrivateKey privateKey = keyMaterialService.getPrivateKey(privateKeyRef);
            KeyMaterial keyMaterial = keyMaterialService.findByKeyRefOrThrow(privateKeyRef);
            String jcaAlgo = CryptoUtil.getSignatureAlgorithm(algorithm, hashFunction);

            Signature signer = Signature.getInstance(jcaAlgo);
            signer.initSign(privateKey);

            try (FileInputStream fis = new FileInputStream(inPath.toFile())) {
                byte[] buffer = new byte[BUFFER_SIZE];
                int len;
                while ((len = fis.read(buffer)) != -1) {
                    signer.update(buffer, 0, len);
                }
            }

            byte[] sigBytes = signer.sign();
            String encodedSig = Base64.getEncoder().encodeToString(sigBytes); // Base64 uniquement

            // Prepare output file
            Path uploadDir = Paths.get(uploadDirPath);
            if (!Files.exists(uploadDir)) Files.createDirectories(uploadDir);
            String outputFileName = "sig_" + System.currentTimeMillis() + ".txt";
            Path outPath = uploadDir.resolve(outputFileName);
            Files.writeString(outPath, encodedSig, StandardCharsets.UTF_8, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

            logOperationFile(CryptoPrimitiveType.SIGNATURE, algorithm, inPath.toString(), outPath.toString(), actor, true, hashFunction, keyMaterial.getId());

            return FileSignatureResponseDTO.builder()
                    .inputFile(inPath.getFileName().toString())
                    .outputFile(outputFileName)
                    .signature(encodedSig)
                    .operation(CryptoPrimitiveType.SIGNATURE)
                    .build();

        } catch (Exception e) {
            log.error("Erreur signFile: {}", e.getMessage(), e);
            throw new CryptoOperationException("Échec signature fichier: " + e.getMessage());
        }
    }

    // -------------------------
    // VERIFY FILE
    // -------------------------
    public FileSignatureResponseDTO verifyFile(String publicKeyRef,
                                               String inputFile,
                                               String providedSignature,
                                               CryptoAlgorithm algorithm,
                                               HashFunction hashFunction) throws CryptoOperationException {
        AppUser actor = currentUserProvider.getCurrentUser();

        Path inPath = Paths.get(inputFile);
        if (!Files.exists(inPath)) throw new CryptoOperationException("Fichier introuvable: " + inputFile);

        try {
            PublicKey publicKey = keyMaterialService.getPublicKey(publicKeyRef);
            KeyMaterial keyMaterial = keyMaterialService.findByKeyRefOrThrow(publicKeyRef);

            String jcaAlgo = CryptoUtil.getSignatureAlgorithm(algorithm, hashFunction);

            Signature verifier = Signature.getInstance(jcaAlgo);
            verifier.initVerify(publicKey);

            try (FileInputStream fis = new FileInputStream(inPath.toFile())) {
                byte[] buffer = new byte[BUFFER_SIZE];
                int len;
                while ((len = fis.read(buffer)) != -1) {
                    verifier.update(buffer, 0, len);
                }
            }

            // décodage Base64 uniquement
            byte[] sigBytes = Base64.getDecoder().decode(providedSignature);
            boolean valid = verifier.verify(sigBytes);

            logOperationFile(CryptoPrimitiveType.VERIFICATION,
                    algorithm, inPath.toString(), "(signature-check)", actor, valid, hashFunction, keyMaterial.getId());

            return FileSignatureResponseDTO.builder()
                    .inputFile(inPath.getFileName().toString())
                    .outputFile("(signature-check)")
                    .verified(valid)
                    .operation(CryptoPrimitiveType.VERIFICATION)
                    .build();

        } catch (SignatureException se) {
            throw new CryptoOperationException("Erreur de vérification (SignatureException): " + se.getMessage());
        } catch (Exception e) {
            log.error("Erreur verifyFile: {}", e.getMessage(), e);
            throw new CryptoOperationException("Échec vérification fichier: " + e.getMessage());
        }
    }

    // -------------------------
    // Logging helpers (audit)
    // -------------------------
    private void logOperation(CryptoPrimitiveType type,
                              CryptoAlgorithm algo,
                              String input,
                              String output,
                              AppUser actor,
                              boolean success,
                              HashFunction hashFunction,
                              Long keyMaterialId) {
        try {
            String metadata = String.format("algo=%s, hash=%s, msgLen=%d, sigLen=%d, success=%s, ts=%s",
                    algo, hashFunction, (input == null ? 0 : input.length()), (output == null ? 0 : output.length()), success, Instant.now());

            cryptoOperationService.createOperation(
                    CryptoOperationDTO.builder()
                            .serviceType(CryptoServiceType.AUTHENTICITY)
                            .primitiveType(type)
                            .algorithm(algo)
                            .status(success ? OperationStatus.SUCCESS : OperationStatus.FAILURE)
                            .metadata(metadata)
                            .performedById(actor.getId())
                            .keyMaterialId(keyMaterialId)
                            .build(),
                    input,
                    output
            );
        } catch (Exception e) {
            log.warn("Erreur audit signature: {}", e.getMessage());
        }
    }

    private void logOperationFile(CryptoPrimitiveType type,
                                  CryptoAlgorithm algo,
                                  String inputFile,
                                  String outputFile,
                                  AppUser actor,
                                  boolean success,
                                  HashFunction hashFunction,
                                  Long keyMaterialId) {
        try {
            String metadata = String.format("algo=%s, hash=%s, file=%s, out=%s, success=%s, ts=%s",
                    algo, hashFunction, inputFile, outputFile, success, Instant.now());

            cryptoOperationService.createOperation(
                    CryptoOperationDTO.builder()
                            .serviceType(CryptoServiceType.AUTHENTICITY)
                            .primitiveType(type)
                            .algorithm(algo)
                            .status(success ? OperationStatus.SUCCESS : OperationStatus.FAILURE)
                            .metadata(metadata)
                            .performedById(actor.getId())
                            .keyMaterialId(keyMaterialId)
                            .build(),
                    inputFile,
                    outputFile
            );
        } catch (Exception e) {
            log.warn("Erreur audit signature fichier: {}", e.getMessage());
        }
    }

    // -------------------------
    // Validation
    // -------------------------
    private void validateSignDtoForSign(SignatureDTO dto) {
        if (dto == null) throw new IllegalArgumentException("SignatureDTO required");
        if (dto.getMessage() == null || dto.getMessage().isBlank()) throw new IllegalArgumentException("Message required");
        if (dto.getPrivateKeyRef() == null || dto.getPrivateKeyRef().isBlank()) throw new IllegalArgumentException("privateKeyRef required");
        if (dto.getAlgorithm() == null) throw new IllegalArgumentException("algorithm required");
    }
}
