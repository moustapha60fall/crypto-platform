package tdsi2025.mcs.crypto;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import tdsi2025.mcs.dto.AsymmetricCryptoDTO;
import tdsi2025.mcs.dto.CryptoOperationDTO;
import tdsi2025.mcs.dto.FileCryptoResponseDTO;
import tdsi2025.mcs.enums.*;
import tdsi2025.mcs.exception.CryptoOperationException;
import tdsi2025.mcs.model.AppUser;
import tdsi2025.mcs.model.KeyMaterial;
import tdsi2025.mcs.security.CurrentUserProvider;
import tdsi2025.mcs.services.CryptoOperationService;
import tdsi2025.mcs.services.KeyMaterialService;
import tdsi2025.mcs.util.CryptoUtil;

import javax.crypto.Cipher;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.Key;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.util.Base64;

@Service
@RequiredArgsConstructor
@Transactional
public class AsymmetricCryptoService {

    private final KeyMaterialService keyMaterialService;
    private final CryptoOperationService cryptoOperationService;
    private final CurrentUserProvider currentUserProvider;

    @Value("${app.upload-dir}")
    private String uploadDirPath;

    // ==========================================================
    // 🔒 / 🔓 Chiffrement / Déchiffrement Base64
    // ==========================================================
    public AsymmetricCryptoDTO encrypt(AsymmetricCryptoDTO dto) throws CryptoOperationException {
        return processBase64(dto, Cipher.ENCRYPT_MODE, CryptoPrimitiveType.ENCRYPTION);
    }

    public AsymmetricCryptoDTO decrypt(AsymmetricCryptoDTO dto) throws CryptoOperationException {
        return processBase64(dto, Cipher.DECRYPT_MODE, CryptoPrimitiveType.DECRYPTION);
    }

    private AsymmetricCryptoDTO processBase64(AsymmetricCryptoDTO dto, int opMode, CryptoPrimitiveType primitive)
            throws CryptoOperationException {
        AppUser actor = currentUserProvider.getCurrentUser();

        try {
            // --- Validation de base
            if (dto == null)
                throw new IllegalArgumentException("DTO cannot be null");
            if (dto.getAlgorithm() == null)
                throw new IllegalArgumentException("Algorithm is required");

            CryptoAlgorithm algo = dto.getAlgorithm();
            PaddingScheme padding = (dto.getPadding() != null) ? dto.getPadding() : PaddingScheme.OAEP;

            // ✅ Toujours lire inputData
            String b64Input = dto.getInputData();
            if (b64Input == null || b64Input.isBlank())
                throw new IllegalArgumentException("Input data (base64) is required");

            byte[] inputBytes = Base64.getDecoder().decode(b64Input);

            // --- Récupération clé
            Key key;
            String keyRef = (opMode == Cipher.ENCRYPT_MODE) ? dto.getPublicKeyRef() : dto.getPrivateKeyRef();
            KeyMaterial keyMaterial = keyMaterialService.findByKeyRefOrThrow(keyRef);

            if (opMode == Cipher.ENCRYPT_MODE) {
                key = keyMaterialService.getPublicKey(keyRef);
            } else {
                key = keyMaterialService.getPrivateKey(keyRef);
            }

            // --- Construction du Cipher
            Cipher cipher = CryptoUtil.buildAsymmetricCipher(algo.name(), padding);
            cipher.init(opMode, key);

            byte[] result = cipher.doFinal(inputBytes);

            // --- Encodage Base64 pour encrypt / UTF-8 pour decrypt
            String outputData = (opMode == Cipher.ENCRYPT_MODE)
                    ? Base64.getEncoder().encodeToString(result)
                    : new String(result, StandardCharsets.UTF_8);

            // --- Audit / log
            logOperation(primitive, algo, inputBytes.length, outputData, actor, keyMaterial.getId());

            // --- Construction réponse
            return AsymmetricCryptoDTO.builder()
                    .keyRef(dto.getKeyRef())
                    .algorithm(algo)
                    .publicKeyRef(dto.getPublicKeyRef())
                    .privateKeyRef(dto.getPrivateKeyRef())
                    .padding(padding)
                    .inputData(dto.getInputData())
                    .outputData(outputData)
                    .performedById(actor.getId())
                    .build();

        } catch (Exception e) {
            throw new CryptoOperationException("Erreur " + primitive + " asymétrique : " + e.getMessage());
        }
    }

    private void logOperation(CryptoPrimitiveType primitive, CryptoAlgorithm algo, int inputLength,
                              String output, AppUser actor, Long keyMaterialId) {
        String metadata = "algo=" + algo + ", input_bytes=" + inputLength;

        cryptoOperationService.createOperation(
                CryptoOperationDTO.builder()
                        .serviceType(CryptoServiceType.CONFIDENTIALITY)
                        .primitiveType(primitive)
                        .algorithm(algo)
                        .status(OperationStatus.SUCCESS)
                        .metadata(metadata)
                        .performedById(actor.getId())
                        .keyMaterialId(keyMaterialId)
                        .build(),
                null,
                output
        );
    }

    // ==========================================================
    // 🔒 / 🔓 Chiffrement / Déchiffrement Fichiers
    // ==========================================================
    public FileCryptoResponseDTO encryptUploadedFile(String publicKeyRef, MultipartFile file,
                                                     CryptoAlgorithm algorithm, PaddingScheme padding)
            throws CryptoOperationException {
        return processUploadedFile(publicKeyRef, file, algorithm, padding, Cipher.ENCRYPT_MODE);
    }

    public FileCryptoResponseDTO decryptUploadedFile(String privateKeyRef, MultipartFile file,
                                                     CryptoAlgorithm algorithm, PaddingScheme padding)
            throws CryptoOperationException {
        return processUploadedFile(privateKeyRef, file, algorithm, padding, Cipher.DECRYPT_MODE);
    }

    private FileCryptoResponseDTO processUploadedFile(String keyRef, MultipartFile file,
                                                      CryptoAlgorithm algorithm, PaddingScheme padding, int opMode)
            throws CryptoOperationException {
        try {
            Path uploadDir = Paths.get(uploadDirPath);
            if (!Files.exists(uploadDir)) Files.createDirectories(uploadDir);

            String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
            Path tempInput = Files.createTempFile("crypto_input_asymmetric", "_" + originalName);
            Path tempOutput = Files.createTempFile("crypto_output_asymmetric", ".txt");
            file.transferTo(tempInput);

            processFile(keyRef, tempInput.toString(), tempOutput.toString(), algorithm, padding, opMode);

            String outputFileName = (opMode == Cipher.ENCRYPT_MODE ? "enc_" : "dec_")
                    + System.currentTimeMillis() + ".txt";
            Path finalOutput = uploadDir.resolve(outputFileName);
            Files.move(tempOutput, finalOutput, StandardCopyOption.REPLACE_EXISTING);
            tempInput.toFile().deleteOnExit();

            return new FileCryptoResponseDTO(originalName, outputFileName,
                    opMode == Cipher.ENCRYPT_MODE ? "ENCRYPTION" : "DECRYPTION");

        } catch (IOException e) {
            throw new CryptoOperationException("Erreur d’accès au fichier : " + e.getMessage());
        }
    }

    // ----------------------------
    // 🔧 Processus commun
    // ----------------------------
    private void processFile(String keyRef, String inputFile, String outputFile,
                             CryptoAlgorithm algorithm, PaddingScheme padding, int opMode)
            throws CryptoOperationException {
        AppUser actor = currentUserProvider.getCurrentUser();

        try (FileInputStream fis = new FileInputStream(inputFile);
             FileOutputStream fos = new FileOutputStream(outputFile)) {

            KeyMaterial keyMaterial = keyMaterialService.findByKeyRefOrThrow(keyRef);

            Cipher cipher = CryptoUtil.buildAsymmetricCipher(algorithm.name(), padding);
            int keySizeBytes;

            if (opMode == Cipher.ENCRYPT_MODE) {
                PublicKey publicKey = keyMaterialService.getPublicKey(keyRef);
                cipher.init(Cipher.ENCRYPT_MODE, publicKey);
                keySizeBytes = publicKey.getEncoded().length;
            } else {
                PrivateKey privateKey = keyMaterialService.getPrivateKey(keyRef);
                cipher.init(Cipher.DECRYPT_MODE, privateKey);
                keySizeBytes = privateKey.getEncoded().length;
            }

            // --- Détermination de la taille des blocs RSA ---
            int blockSize = (opMode == Cipher.ENCRYPT_MODE)
                    ? (keySizeBytes - 42) // marge OAEP
                    : keySizeBytes;

            byte[] inputBuffer = new byte[blockSize];
            int bytesRead;

            while ((bytesRead = fis.read(inputBuffer)) != -1) {
                byte[] block = cipher.doFinal(inputBuffer, 0, bytesRead);
                fos.write(block);
            }

            logOperationFile(opMode, inputFile, outputFile, actor, algorithm, keyMaterial.getId());

        } catch (Exception e) {
            throw new CryptoOperationException("Erreur de chiffrement/déchiffrement asymétrique : " + e.getMessage());
        }
    }

    private void logOperationFile(int opMode, String input, String output,
                                  AppUser actor, CryptoAlgorithm algorithm, Long keyMaterialId) {
        long size = new File(input).exists() ? new File(input).length() : -1L;
        cryptoOperationService.createOperation(
                CryptoOperationDTO.builder()
                        .serviceType(CryptoServiceType.CONFIDENTIALITY)
                        .primitiveType(opMode == Cipher.ENCRYPT_MODE
                                ? CryptoPrimitiveType.ENCRYPTION
                                : CryptoPrimitiveType.DECRYPTION)
                        .algorithm(algorithm)
                        .status(OperationStatus.SUCCESS)
                        .metadata("File=" + input + " → " + output + " (" + size + " bytes)")
                        .performedById(actor.getId())
                        .keyMaterialId(keyMaterialId)
                        .build(),
                input, output
        );
    }

    public String interpretAsymmetricError(Exception e, CryptoPrimitiveType primitive) {
        String rawMessage = e.getMessage();
        if (rawMessage != null) {
            if (rawMessage.contains("too much data for RSA block")) {
                return "Le texte à chiffrer est trop long pour la clé RSA utilisée. Utilisez une plus petite portion ou un chiffrement hybride.";
            }
            if (rawMessage.contains("Bad padding")) {
                return "Échec du déchiffrement : mauvais padding. Vérifiez algorithme et schéma de remplissage.";
            }
            if (rawMessage.contains("Invalid key")) {
                return "Clé invalide ou incompatible avec l’algorithme choisi.";
            }
        }
        return "Erreur " + primitive.name().toLowerCase() + " asymétrique : " + rawMessage;
    }

}
