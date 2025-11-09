package tdsi2025.mcs.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import tdsi2025.mcs.dto.CryptoOperationDTO;
import tdsi2025.mcs.enums.CryptoPrimitiveType;
import tdsi2025.mcs.enums.CryptoServiceType;
import tdsi2025.mcs.services.CryptoOperationService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/crypto-ops")
@RequiredArgsConstructor
@Validated
public class CryptoOperationController {

    private final CryptoOperationService cryptoService;

    @GetMapping
    public ResponseEntity<Page<CryptoOperationDTO>> getAllOperations(Pageable pageable) {
        return ResponseEntity.ok(cryptoService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CryptoOperationDTO> getOperationById(@PathVariable Long id) {
        return ResponseEntity.ok(cryptoService.findById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CryptoOperationDTO>> getOperationsByUser(@PathVariable String userId) {
        return ResponseEntity.ok(cryptoService.findByUser(userId));
    }

    @GetMapping("/key/{keyId}")
    public ResponseEntity<List<CryptoOperationDTO>> getOperationsByKey(@PathVariable Long keyId) {
        return ResponseEntity.ok(cryptoService.findByKey(keyId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOperation(@PathVariable Long id) {
        cryptoService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats/primitive")
    public ResponseEntity<Map<CryptoPrimitiveType, Long>> getPrimitiveStats() {
        return ResponseEntity.ok(cryptoService.countByPrimitiveType());
    }

    @GetMapping("/stats/service")
    public ResponseEntity<Map<CryptoServiceType, Long>> getServiceStats() {
        return ResponseEntity.ok(cryptoService.countByServiceType());
    }
}

