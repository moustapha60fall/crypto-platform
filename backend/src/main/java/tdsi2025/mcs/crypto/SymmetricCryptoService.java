package tdsi2025.mcs.crypto;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import tdsi2025.mcs.dto.CryptoOperationDTO;
import tdsi2025.mcs.dto.FileCryptoResponseDTO;
import tdsi2025.mcs.dto.SymmetricCryptoDTO;
import tdsi2025.mcs.enums.*;
import tdsi2025.mcs.exception.CryptoOperationException;
import tdsi2025.mcs.model.AppUser;
import tdsi2025.mcs.model.KeyMaterial;
import tdsi2025.mcs.security.CurrentUserProvider;
import tdsi2025.mcs.services.CryptoOperationService;
import tdsi2025.mcs.services.KeyMaterialService;
import tdsi2025.mcs.util.CryptoUtil;

import javax.crypto.Cipher;
import javax.crypto.CipherOutputStream;
import javax.crypto.SecretKey;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.GeneralSecurityException;
import java.util.Base64;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class SymmetricCryptoService {

    private final KeyMaterialService keyMaterialService;
    private final CryptoOperationService cryptoOperationService;
    private final CurrentUserProvider currentUserProvider;

    @Value("${app.upload-dir}")
    private String uploadDirPath;

    private static final int BUFFER_SIZE = 4096;

    // ==========================================================
    // 🔒 / 🔓 Chiffrement / Déchiffrement Base64
    // ==========================================================

    public SymmetricCryptoDTO encrypt(@Valid SymmetricCryptoDTO dto) throws CryptoOperationException {
        return processBase64(dto, Cipher.ENCRYPT_MODE, CryptoPrimitiveType.ENCRYPTION);
    }

    public SymmetricCryptoDTO decrypt(@Valid SymmetricCryptoDTO dto) throws CryptoOperationException {
        return processBase64(dto, Cipher.DECRYPT_MODE, CryptoPrimitiveType.DECRYPTION);
    }

    private SymmetricCryptoDTO processBase64(SymmetricCryptoDTO dto, int opMode, CryptoPrimitiveType primitive)
            throws CryptoOperationException {

        AppUser actor = currentUserProvider.getCurrentUser();
        long start = System.currentTimeMillis();

        try {
            if (dto == null) throw new IllegalArgumentException("Request DTO is null");
            if (dto.getAlgorithm() == null) throw new IllegalArgumentException("Algorithm is required");

            CryptoAlgorithm algo = dto.getAlgorithm();
            SymmetricMode mode = dto.getMode() != null ? dto.getMode() : SymmetricMode.CBC;
            PaddingScheme padding = dto.getPadding() != null ? dto.getPadding() : PaddingScheme.PKCS5Padding;

            // 🔧 Ajuste automatiquement le padding
            if (mode == SymmetricMode.GCM || mode == SymmetricMode.CCM || mode == SymmetricMode.CTR ||
                    algo == CryptoAlgorithm.RC4 || algo == CryptoAlgorithm.CHACHA20) {
                padding = PaddingScheme.NONE;
            }

            log.debug("=== 🔍 SymmetricCryptoService.processBase64 ===");
            log.debug("OpMode: {} | Algo: {} | Mode: {} | Padding: {} | KeyRef: {}",
                    (opMode == Cipher.ENCRYPT_MODE ? "ENCRYPT" : "DECRYPT"), algo, mode, padding, dto.getKeyRef());

            String b64Input = (opMode == Cipher.ENCRYPT_MODE) ? dto.getInputData() : dto.getOutputData();
            if (b64Input == null || b64Input.isBlank()) {
                throw new IllegalArgumentException("Input data (base64) is required for this operation");
            }

            byte[] inputBytes = Base64.getDecoder().decode(b64Input);
            log.debug("Input Base64 length: {} bytes -> decoded length: {}", b64Input.length(), inputBytes.length);

            // 🔹 IV / Nonce
            byte[] iv = null;
            if (CryptoUtil.requiresIV(mode)) {
                if (opMode == Cipher.ENCRYPT_MODE) {
                    iv = CryptoUtil.generateIV(algo.name(), mode);
                    log.debug("Generated IV: {} bytes | Hex: {}", iv.length, CryptoUtil.toHex(iv));
                } else {
                    iv = CryptoUtil.extractIV(algo.name(), mode, inputBytes);
                    log.debug("Extracted IV: {} bytes | Hex: {}", iv.length, CryptoUtil.toHex(iv));
                }
            }

            byte[] dataToProcess = (opMode == Cipher.DECRYPT_MODE && iv != null)
                    ? CryptoUtil.extractCipherText(algo.name(), mode, inputBytes)
                    : inputBytes;

            log.debug("DataToProcess length: {}", dataToProcess.length);

            // 🔹 Cipher setup
            Cipher cipher = prepareCipher(dto.getKeyRef(), algo, mode, opMode, iv, padding);

            // 🔹 Diagnostic avant doFinal()
            log.debug("Cipher provider: {} | Algorithm: {}", cipher.getProvider().getName(), cipher.getAlgorithm());

            byte[] result = cipher.doFinal(dataToProcess);
            log.debug("Result length after doFinal: {}", result.length);

            // 🔹 Combine IV + ciphertext pour export
            byte[] combined = (opMode == Cipher.ENCRYPT_MODE && iv != null)
                    ? CryptoUtil.concat(iv, result)
                    : result;

            String outputB64 = Base64.getEncoder().encodeToString(combined);
            long duration = System.currentTimeMillis() - start;

            KeyMaterial key = keyMaterialService.findByKeyRefOrThrow(dto.getKeyRef());
            logOperation(primitive, algo, mode, inputBytes.length, outputB64, actor, key, duration);

            log.debug("Operation duration: {} ms", duration);
            log.debug("=== ✅ Process completed successfully ===");

            return SymmetricCryptoDTO.builder()
                    .keyRef(dto.getKeyRef())
                    .algorithm(algo)
                    .mode(mode)
                    .padding(padding)
                    .inputData(opMode == Cipher.DECRYPT_MODE ? new String(result, StandardCharsets.UTF_8) : dto.getInputData())
                    .outputData(opMode == Cipher.ENCRYPT_MODE ? outputB64 : dto.getOutputData())
                    .performedById(actor.getId())
                    .build();

        } catch (IllegalArgumentException e) {
            log.error("❌ Paramètre invalide : {}", e.getMessage());
            throw new CryptoOperationException("Paramètre invalide : " + e.getMessage());
        } catch (GeneralSecurityException e) {
            log.error("❌ Erreur cryptographique : {}", e.getMessage(), e);
            throw new CryptoOperationException("Erreur cryptographique : " + e.getMessage());
        } catch (Exception e) {
            log.error("❌ Erreur interne : {}", e.getMessage(), e);
            throw new CryptoOperationException("Erreur interne : " + e.getMessage());
        }
    }

    private Cipher prepareCipher(String keyRef, CryptoAlgorithm algo, SymmetricMode mode,
                                 int opMode, byte[] iv, PaddingScheme padding) throws Exception {

        if (keyRef == null || keyRef.isBlank())
            throw new IllegalArgumentException("keyRef requis");

        SecretKey key = keyMaterialService.getSecretKeyByRef(keyRef);
        log.debug("Loaded SecretKey for ref={} | algo={} | keyLength={} bits",
                keyRef, key.getAlgorithm(), key.getEncoded().length * 8);

        // 🔧 Normalisation du nom d’algorithme
        String algorithm = switch (algo) {
            case TRIPLE_DES -> "DESede";
            case CHACHA20, CHACHA20_POLY1305 -> "ChaCha20";
            case RC4 -> "RC4";
            default -> "AES";
        };

        Cipher cipher = CryptoUtil.buildSymmetricCipher(algorithm, mode, opMode, key, iv, padding);
        log.debug("Cipher built -> {} | mode={} | padding={} | opMode={}",
                cipher.getAlgorithm(), mode, padding, (opMode == Cipher.ENCRYPT_MODE ? "ENCRYPT" : "DECRYPT"));

        return cipher;
    }

    private void logOperation(CryptoPrimitiveType primitive, CryptoAlgorithm algo, SymmetricMode mode,
                              int inputBytesLength, String outputB64, AppUser actor,
                              KeyMaterial key, long duration) {

        String metadata = String.format("algo=%s, mode=%s, input_bytes=%d, duration=%dms",
                algo, mode, inputBytesLength, duration);

        cryptoOperationService.createOperation(
                CryptoOperationDTO.builder()
                        .serviceType(CryptoServiceType.CONFIDENTIALITY)
                        .primitiveType(primitive)
                        .algorithm(algo)
                        .status(OperationStatus.SUCCESS)
                        .metadata(metadata)
                        .performedById(actor.getId())
                        .keyMaterialId(key.getId())
                        .build(),
                null, outputB64
        );
    }

    // ==========================================================
    // 🔒 / 🔓 Fichiers Uploadés
    // ==========================================================

    public FileCryptoResponseDTO encryptUploadedFile(Long keyId, MultipartFile file, SymmetricMode mode)
            throws CryptoOperationException {
        return processUploadedFile(keyId, file, mode, Cipher.ENCRYPT_MODE, "ENCRYPTION");
    }

    public FileCryptoResponseDTO decryptUploadedFile(Long keyId, MultipartFile file, SymmetricMode mode)
            throws CryptoOperationException {
        return processUploadedFile(keyId, file, mode, Cipher.DECRYPT_MODE, "DECRYPTION");
    }

    private FileCryptoResponseDTO processUploadedFile(Long keyId, MultipartFile file, SymmetricMode mode,
                                                      int opMode, String operation)
            throws CryptoOperationException {

        try {
            Path uploadDir = Paths.get(uploadDirPath);
            if (!Files.exists(uploadDir)) Files.createDirectories(uploadDir);

            String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
            Path tempInput = Files.createTempFile("crypto_input_", "_" + originalName);
            Path tempOutput = Files.createTempFile("crypto_output_", ".txt");

            file.transferTo(tempInput);
            processFile(keyId, tempInput.toString(), tempOutput.toString(), mode, opMode);

            String outputFileName = operation.toLowerCase() + "_" + System.currentTimeMillis() + ".txt";
            Path finalOutput = uploadDir.resolve(outputFileName);
            Files.move(tempOutput, finalOutput, StandardCopyOption.REPLACE_EXISTING);

            tempInput.toFile().deleteOnExit();

            return new FileCryptoResponseDTO(
                    tempInput.getFileName().toString(),
                    outputFileName,
                    operation
            );

        } catch (IOException e) {
            throw new CryptoOperationException("Erreur fichier uploadé : " + e.getMessage());
        }
    }

    private void processFile(Long keyId, String inputFile, String outputFile, SymmetricMode mode, int opMode)
            throws CryptoOperationException {
        AppUser actor = currentUserProvider.getCurrentUser();

        try {
            KeyMaterial km = keyMaterialService.findByIdOrThrow(keyId);
            if (km.getKeyType() != KeyType.SYMMETRIC)
                throw new IllegalArgumentException("Clé non symétrique : " + keyId);

            SecretKey key = keyMaterialService.getSecretKey(keyId);
            String algo = key.getAlgorithm();

            byte[] iv = (opMode == Cipher.ENCRYPT_MODE && CryptoUtil.requiresIV(mode))
                    ? CryptoUtil.generateIV(algo, mode)
                    : new byte[CryptoUtil.getIVLength(algo, mode)];

            try (FileInputStream fis = new FileInputStream(inputFile);
                 FileOutputStream fos = new FileOutputStream(outputFile)) {

                if (opMode == Cipher.DECRYPT_MODE && CryptoUtil.requiresIV(mode)) {
                    int read = fis.read(iv);
                    if (read < iv.length)
                        throw new EOFException("IV incomplet : " + read + "/" + iv.length);
                }

                if (opMode == Cipher.ENCRYPT_MODE && CryptoUtil.requiresIV(mode)) {
                    fos.write(iv);
                }

                PaddingScheme padding = (mode == SymmetricMode.GCM || algo.equalsIgnoreCase("RC4"))
                        ? PaddingScheme.NONE
                        : PaddingScheme.PKCS7Padding;

                Cipher cipher = CryptoUtil.buildSymmetricCipher(algo, mode, opMode, key, iv, padding);

                try (CipherOutputStream cos = new CipherOutputStream(fos, cipher)) {
                    byte[] buffer = new byte[BUFFER_SIZE];
                    int len;
                    while ((len = fis.read(buffer)) != -1) {
                        cos.write(buffer, 0, len);
                    }
                }
            }

            logOperationFile(opMode == Cipher.ENCRYPT_MODE ? "ENCRYPTION" : "DECRYPTION",
                    inputFile, outputFile, actor, algo, km);

        } catch (Exception e) {
            throw new CryptoOperationException("Échec traitement fichier: " + e.getMessage());
        }
    }

    private void logOperationFile(String operation, String input, String output, AppUser actor,
                                  String algo, KeyMaterial key) {
        long size = new File(input).exists() ? new File(input).length() : -1L;
        cryptoOperationService.createOperation(
                CryptoOperationDTO.builder()
                        .serviceType(CryptoServiceType.CONFIDENTIALITY)
                        .primitiveType(operation.equals("ENCRYPTION") ?
                                CryptoPrimitiveType.ENCRYPTION : CryptoPrimitiveType.DECRYPTION)
                        .algorithm(CryptoAlgorithm.valueOf(algo))
                        .status(OperationStatus.SUCCESS)
                        .metadata(String.format("file=%s → %s, size=%d bytes", input, output, size))
                        .performedById(actor.getId())
                        .keyMaterialId(key.getId())
                        .build(),
                input, output
        );
    }
}
