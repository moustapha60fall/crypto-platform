package tdsi2025.mcs.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tdsi2025.mcs.crypto.KeyExchangeService;
import tdsi2025.mcs.dto.KeyMaterialDTO;
import tdsi2025.mcs.security.CurrentUserProvider;
import javax.crypto.SecretKey;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.util.Base64;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/crypto/keyexchange")
@RequiredArgsConstructor
public class KeyExchangeController {

    private final KeyExchangeService keyExchangeService;
    private final CurrentUserProvider currentUserProvider;

    // ==========================================================
    // 🔑 Génération d’une paire de clés DH/ECDH
    // ==========================================================
    @PostMapping("/generate")
    public ResponseEntity<Map<String, KeyMaterialDTO>> generateKeyPair(
            @RequestParam String algorithm,
            @RequestParam String namePrefix) {
        try {
            String ownerId = currentUserProvider.getCurrentUser().getId();
            Map<String, KeyMaterialDTO> keyPair = keyExchangeService.generateKeyExchangePair(algorithm, namePrefix, ownerId);
            return ResponseEntity.ok(keyPair);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", KeyMaterialDTO.builder()
                            .name(e.getMessage())
                            .build()));
        }
    }

    // ==========================================================
    // 🔄 Dérivation de clé partagée (ex. Diffie-Hellman)
    // ==========================================================
    @PostMapping("/derive")
    public ResponseEntity<Map<String, String>> deriveSharedKey(
            @RequestParam String privateKeyRef,
            @RequestParam String peerPublicKeyBase64) {

        try {
            log.debug("Début dérivation clé partagée : privateKeyRef={}, peerPublicKeyBase64.length={}",
                    privateKeyRef, peerPublicKeyBase64.length());

            // 1️⃣ Récupération de la clé privée
            PrivateKey privKey = keyExchangeService.getPrivateKey(privateKeyRef);

            // 2️⃣ Reconstruction de la clé publique distante
            byte[] peerPubBytes = Base64.getDecoder().decode(peerPublicKeyBase64);
            PublicKey peerPubKey = keyExchangeService.reconstructPublicKey(peerPubBytes);

            // 3️⃣ Calcul de la clé partagée
            SecretKey sharedKey = keyExchangeService.deriveSharedSecret(privKey, peerPubKey);

            // 4️⃣ Encodage Base64 pour transmission
            String sharedKeyB64 = Base64.getEncoder().encodeToString(sharedKey.getEncoded());

            log.info("Clé partagée dérivée avec succès pour privateKeyRef={}", privateKeyRef);

            return ResponseEntity.ok(Map.of("sharedKey", sharedKeyB64));

        } catch (IllegalArgumentException e) {
            log.warn("Erreur reconstruction clé privée/public : {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Erreur dérivation clé partagée", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

}
