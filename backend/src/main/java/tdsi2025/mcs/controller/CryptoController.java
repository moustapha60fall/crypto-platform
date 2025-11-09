package tdsi2025.mcs.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tdsi2025.mcs.crypto.*;
import tdsi2025.mcs.dto.*;
import tdsi2025.mcs.enums.*;
import tdsi2025.mcs.exception.CryptoOperationException;
import tdsi2025.mcs.util.CryptoUtil;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/crypto")
@RequiredArgsConstructor
public class CryptoController {

    private final SymmetricCryptoService symmetricService;
    private final AsymmetricCryptoService asymmetricService;
    private final SignatureService signatureService;
    private final HashingService hashService;
    private final KeyWrappingService keyWrappingService;

    @Value("${app.upload-dir}")
    private String uploadDir;

    // ------------------------------
    // Symmetric endpoints
    // ------------------------------
    @PostMapping("/symmetric/encrypt")
    public ResponseEntity<CryptoResponse<SymmetricCryptoDTO>> encryptSymmetric(
            @Valid @RequestBody SymmetricCryptoDTO dto
    ) throws CryptoOperationException {
        SymmetricCryptoDTO response = symmetricService.encrypt(dto);
        return ResponseBuilder.success("Texte chiffré avec succès", response);
    }

    @PostMapping("/symmetric/decrypt")
    public ResponseEntity<CryptoResponse<SymmetricCryptoDTO>> decryptSymmetric(
            @Valid @RequestBody SymmetricCryptoDTO dto
    ) throws CryptoOperationException {
        SymmetricCryptoDTO response = symmetricService.decrypt(dto);
        return ResponseBuilder.success("Texte déchiffré avec succès", response);
    }

    // ------------------------------
    // Symmetric endpoints (Files)
    // ------------------------------
    @PostMapping(value = "/symmetric/encryptFile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FileCryptoResponseDTO> encryptSymmetricFile(
            @RequestParam Long keyId,
            @RequestParam(defaultValue = "CBC") SymmetricMode mode,
            @RequestPart("file") MultipartFile file
    ) throws CryptoOperationException {
        FileCryptoResponseDTO response = symmetricService.encryptUploadedFile(keyId, file, mode);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/symmetric/decryptFile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FileCryptoResponseDTO> decryptSymmetricFile(
            @RequestParam Long keyId,
            @RequestParam(defaultValue = "CBC") SymmetricMode mode,
            @RequestPart("file") MultipartFile file
    ) throws CryptoOperationException {
        FileCryptoResponseDTO response = symmetricService.decryptUploadedFile(keyId, file, mode);
        return ResponseEntity.ok(response);
    }

    // ------------------------------
    // Asymmetric endpoints
    // ------------------------------
    @PostMapping("/asymmetric/encrypt")
    public ResponseEntity<CryptoResponse<AsymmetricCryptoDTO>> encryptAsymmetric(
            @RequestBody AsymmetricCryptoDTO dto) {

        try {
            AsymmetricCryptoDTO result = asymmetricService.encrypt(dto);
            return ResponseBuilder.success("Chiffrement RSA effectué avec succès ✅", result);

        } catch (CryptoOperationException e) {
            log.warn("Erreur de chiffrement RSA : {}", e.getMessage());
            String interpreted = asymmetricService.interpretAsymmetricError(e, CryptoPrimitiveType.ENCRYPTION);
            return ResponseBuilder.badRequest("ASYM_ENCRYPT_ERROR", interpreted);

        } catch (Exception e) {
            log.error("Erreur interne lors du chiffrement RSA : {}", e.getMessage());
            return ResponseBuilder.serverError("ASYM_ENCRYPT_UNEXPECTED", "Erreur interne du chiffrement RSA.");
        }
    }

    @PostMapping("/asymmetric/decrypt")
    public ResponseEntity<CryptoResponse<AsymmetricCryptoDTO>> decryptAsymmetric(
            @RequestBody AsymmetricCryptoDTO dto) {

        try {
            AsymmetricCryptoDTO result = asymmetricService.decrypt(dto);
            return ResponseBuilder.success("Déchiffrement RSA effectué avec succès ✅", result);

        } catch (CryptoOperationException e) {
            log.warn("Erreur de déchiffrement RSA : {}", e.getMessage());
            String interpreted = asymmetricService.interpretAsymmetricError(e, CryptoPrimitiveType.DECRYPTION);
            return ResponseBuilder.badRequest("ASYM_DECRYPT_ERROR", interpreted);

        } catch (Exception e) {
            log.error("Erreur interne lors du déchiffrement RSA : {}", e.getMessage());
            return ResponseBuilder.serverError("ASYM_DECRYPT_UNEXPECTED", "Erreur interne du déchiffrement RSA.");
        }
    }

    @PostMapping("/asymmetric/encryptFile")
    public ResponseEntity<FileCryptoResponseDTO> encryptAsymmetricFile(
            @RequestParam String publicKeyRef,
            @RequestPart("file") MultipartFile file,
            @RequestParam CryptoAlgorithm algorithm,
            PaddingScheme padding
    ) throws CryptoOperationException {
        FileCryptoResponseDTO response = asymmetricService.encryptUploadedFile(publicKeyRef, file, algorithm, padding);
        return ResponseEntity.ok(response);

    }

    @PostMapping("/asymmetric/decryptFile")
    public ResponseEntity<FileCryptoResponseDTO> decryptAsymmetricFile(
            @RequestParam String privateKeyRef,
            @RequestPart("file") MultipartFile file,
            @RequestParam CryptoAlgorithm algorithm,
            PaddingScheme padding
    ) throws CryptoOperationException {
        FileCryptoResponseDTO response = asymmetricService.decryptUploadedFile(privateKeyRef, file, algorithm, padding);
        return ResponseEntity.ok(response);
    }

    // ------------------------------
    // Signature endpoints
    // ------------------------------
    @PostMapping("/signature/sign")
    public ResponseEntity<SignatureDTO> signMessage(@RequestBody SignatureDTO dto) throws CryptoOperationException {
        SignatureDTO result = signatureService.signMessage(dto);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/signature/verify")
    public ResponseEntity<Map<String, Boolean>> verifyMessage(@RequestBody SignatureDTO dto) throws CryptoOperationException {
        boolean valid = signatureService.verifyMessage(dto);
        return ResponseEntity.ok(Collections.singletonMap("isValid", valid));
    }

    // ------------------------------
    // Signature endpoints (Files)
    // ------------------------------
    @PostMapping(value = "/signature/signFile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FileSignatureResponseDTO> signFile(
            @RequestParam String privateKeyRef,
            @RequestPart("file") MultipartFile file,
            @RequestParam CryptoAlgorithm algorithm,
            @RequestParam HashFunction hashFunction
    ) throws IOException, CryptoOperationException {

        // Sauvegarde temporaire du fichier MultipartFile
        Path tempFile = Files.createTempFile("upload-", file.getOriginalFilename());
        Files.write(tempFile, file.getBytes());

        FileSignatureResponseDTO response = signatureService.signFile(
                privateKeyRef, tempFile.toString(), algorithm, hashFunction
        );

        Files.deleteIfExists(tempFile); // Nettoyage
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/signature/verifyFile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FileSignatureResponseDTO> verifyFile(
            @RequestParam String publicKeyRef,
            @RequestPart("file") MultipartFile file,
            @RequestParam String providedSignature,
            @RequestParam CryptoAlgorithm algorithm,
            @RequestParam HashFunction hashFunction
    ) throws IOException, CryptoOperationException {

        Path tempFile = Files.createTempFile("upload-", file.getOriginalFilename());
        Files.write(tempFile, file.getBytes());

        FileSignatureResponseDTO response = signatureService.verifyFile(
                publicKeyRef, tempFile.toString(), providedSignature, algorithm, hashFunction
        );

        Files.deleteIfExists(tempFile); // Nettoyage
        return ResponseEntity.ok(response);
    }

    // ------------------------------
    // Hashing endpoints
    // ------------------------------
    @PostMapping("/hash/message")
    public ResponseEntity<String> hashMessage(
            @RequestParam String message,
            @RequestParam HashFunction hashFunction
    ) throws CryptoOperationException {
        String result = hashService.hash(message, hashFunction);
        return ResponseEntity.ok(result);
    }

    @PostMapping(value = "/hash/file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FileCryptoResponseDTO> hashFile(
            @RequestPart("file") MultipartFile file,
            @RequestParam HashFunction hashFunction
    ) throws CryptoOperationException {
        FileCryptoResponseDTO result = hashService.hashFile(file, hashFunction);
        return ResponseEntity.ok(result);
    }

    // ------------------------------
    // HMAC endpoints
    // ------------------------------
    @PostMapping("/hmac/message")
    public ResponseEntity<String> computeHmacMessage(
            @RequestParam String message,
            @RequestParam Long keyId,
            @RequestParam HashFunction hashFunction
    ) throws CryptoOperationException {
        String result = hashService.computeHmac(message, keyId, hashFunction);
        return ResponseEntity.ok(result);
    }

    @PostMapping(value = "/hmac/file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FileCryptoResponseDTO> computeHmacFile(
            @RequestPart("file") MultipartFile file,
            @RequestParam Long keyId,
            @RequestParam HashFunction hashFunction
    ) throws CryptoOperationException {
        FileCryptoResponseDTO result = hashService.computeHmacFile(file, keyId, hashFunction);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/wrap")
    public ResponseEntity<WrappedKeyDTO> wrapKey(@RequestBody @Valid WrappedKeyDTO dto) throws CryptoOperationException {
        return ResponseEntity.ok(keyWrappingService.wrapKey(dto));
    }

    @PostMapping("/unwrap")
    public ResponseEntity<WrappedKeyDTO> unwrapKey(@RequestBody @Valid WrappedKeyDTO dto) throws CryptoOperationException {
        return ResponseEntity.ok(keyWrappingService.unwrapKey(dto));
    }

    // ------------------------------
    // Return available algorithms
    // ------------------------------
    @GetMapping("/algorithms/{category}")
    public List<String> getAlgorithms(@PathVariable String category) {
        return CryptoUtil.listAlgorithmsByCategory(category);
    }

    @GetMapping("/signature/algorithms")
    public ResponseEntity<?> listSignatureAlgorithms() {
        return ResponseEntity.ok(CryptoAlgorithm.values());
    }

    @GetMapping("/hash/functions")
    public ResponseEntity<?> listHashFunctions() {
        return ResponseEntity.ok(HashFunction.values());
    }


    @GetMapping("/files/download/{fileName}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) throws IOException {
        Path filePath = Paths.get(uploadDir).resolve(fileName);
        if (!Files.exists(filePath)) {
            throw new FileNotFoundException("Fichier introuvable : " + filePath.toAbsolutePath());
        }

        Resource resource = new UrlResource(filePath.toUri());
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(resource);
    }
}
