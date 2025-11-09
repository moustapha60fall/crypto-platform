package tdsi2025.mcs.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import tdsi2025.mcs.crypto.PbeService;
import tdsi2025.mcs.dto.DerivedKeyDTO;
import tdsi2025.mcs.dto.KeyMaterialDTO;
import tdsi2025.mcs.dto.KeyShareDTO;
import tdsi2025.mcs.enums.KeyType;
import tdsi2025.mcs.security.CurrentUserProvider;
import tdsi2025.mcs.services.KeyMaterialService;
import tdsi2025.mcs.services.KeyShareService;
import tdsi2025.mcs.util.CryptoUtil;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/keys")
@RequiredArgsConstructor
@Validated
public class KeyMaterialController {

    private final KeyMaterialService keyService;
    private final CurrentUserProvider currentUserProvider;
    private final PbeService pbeService;
    private final KeyShareService keyShareService;

    // ----------------------------
    // 🔐 Génération automatique de clé (symétrique / asymétrique)
    // ----------------------------
    @PostMapping("/generate")
    public ResponseEntity<?> generateKey(
            @RequestParam String algorithm,
            @RequestParam(required = false, defaultValue = "0") int size,
            @RequestParam(required = false, defaultValue = "default-key") String name,
            @RequestParam String ownerId
    ) {
        try {
            var result = keyService.generateKey(algorithm, size, name, ownerId);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/derive")
    public ResponseEntity<KeyMaterialDTO> deriveKey(@Valid @RequestBody DerivedKeyDTO dto) throws Exception {
            KeyMaterialDTO derivedKey = pbeService.deriveKeyFromMaster(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(derivedKey);
    }

    // ----------------------------
    // 🔎 Récupération d'une clé par ID
    // ----------------------------
    @GetMapping("/{id}")
    public ResponseEntity<KeyMaterialDTO> getKeyById(@PathVariable Long id) {
        return ResponseEntity.ok(keyService.findById(id));
    }

    // ----------------------------
    // 🔎 Récupération d'une clé par keyRef
    // ----------------------------
    @GetMapping("/ref/{keyRef}")
    public ResponseEntity<KeyMaterialDTO> getByKeyRef(@PathVariable String keyRef) {
        return ResponseEntity.ok(keyService.findByKeyRef(keyRef));
    }

    // ----------------------------
    // 📜 Liste des clés
    // ----------------------------
    @GetMapping("/all")
    public ResponseEntity<List<KeyMaterialDTO>> getAll() {
        String userId = currentUserProvider.getCurrentUser().getId();
        return ResponseEntity.ok(keyService.findByOwner(userId));
    }

    // ----------------------------
    // 👤 Clés par propriétaire
    // ----------------------------
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<KeyMaterialDTO>> getByOwner(@PathVariable String ownerId) {
        return ResponseEntity.ok(keyService.findByOwner(ownerId));
    }

    // ----------------------------
    // ⚠️ Déprécier une clé
    // ----------------------------
    @PatchMapping("/{id}/deprecate")
    public ResponseEntity<KeyMaterialDTO> deprecate(@PathVariable Long id) {
        return ResponseEntity.ok(keyService.deprecateKey(id));
    }

    // ----------------------------
    // 📚 Liste d’algorithmes disponibles par type
    // ----------------------------
    @GetMapping("/../algorithms/{category}")
    public ResponseEntity<List<String>> getAlgorithms(@PathVariable String category) {
        return ResponseEntity.ok(CryptoUtil.listAlgorithmsByCategory(category));
    }

    // ----------------------------
    // 📦 Liste les clés symétriques disponibles pour l’utilisateur courant
    // ----------------------------
    @GetMapping("/keys")
    public ResponseEntity<List<KeyMaterialDTO>> getSymmetricKeysForCurrentUser() {
        String userId = currentUserProvider.getCurrentUser().getId();
        List<KeyMaterialDTO> keys = keyService.findByOwner(userId).stream()
                .filter(k -> k.getKeyType() == KeyType.SYMMETRIC)
                .toList();
        return ResponseEntity.ok(keys);
    }

    @GetMapping("/priv")
    public ResponseEntity<List<KeyMaterialDTO>> getASymmetricKeysPrivForCurrentUser() {
        String userId = currentUserProvider.getCurrentUser().getId();
        List<KeyMaterialDTO> keys = keyService.findByOwner(userId).stream()
                .filter(k -> k.getKeyType() == KeyType.ASYMMETRIC_PRIVATE)
                .toList();
        return ResponseEntity.ok(keys);
    }

    @GetMapping("/pub")
    public ResponseEntity<List<KeyMaterialDTO>> getASymmetricKeysPubForCurrentUser() {
        String userId = currentUserProvider.getCurrentUser().getId();
        List<KeyMaterialDTO> keys = keyService.findByOwner(userId).stream()
                .filter(k -> k.getKeyType() == KeyType.ASYMMETRIC_PUBLIC)
                .toList();
        return ResponseEntity.ok(keys);
    }

    @PostMapping("/share")
    public ResponseEntity<KeyShareDTO> shareKey(@RequestBody KeyShareDTO dto) {
        KeyShareDTO result = keyShareService.save(dto);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/shares")
    public ResponseEntity<Map<String, List<KeyShareDTO>>> getAllSharesForUser(@RequestParam String userId) {
        List<KeyShareDTO> sharedByMe = keyShareService.getSharesByOwner(userId);
        List<KeyShareDTO> sharedWithMe = keyShareService.getSharesByUser(userId);

        Map<String, List<KeyShareDTO>> result = new HashMap<>();
        result.put("sharedByMe", sharedByMe);
        result.put("sharedWithMe", sharedWithMe);

        return ResponseEntity.ok(result);
    }


    @GetMapping("/shared-with-me/{userId}")
    public ResponseEntity<List<KeyShareDTO>> getKeysSharedWithMe(@PathVariable String userId) {
        List<KeyShareDTO> shares = keyShareService.getSharesByUser(userId);
        return ResponseEntity.ok(shares);
    }

    @GetMapping("/shared-by-me/{userId}")
    public ResponseEntity<List<KeyShareDTO>> getKeysSharedByMe(@PathVariable String userId) {
        List<KeyShareDTO> shares = keyShareService.getSharesByOwner(userId);
        return ResponseEntity.ok(shares);
    }

}
