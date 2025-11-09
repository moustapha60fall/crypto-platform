package tdsi2025.mcs.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import tdsi2025.mcs.dto.CryptoOperationDTO;
import tdsi2025.mcs.enums.CryptoPrimitiveType;
import tdsi2025.mcs.enums.CryptoServiceType;
import tdsi2025.mcs.exception.CryptoOperationNotFoundException;
import tdsi2025.mcs.mapper.CryptoOperationMapper;
import tdsi2025.mcs.model.AppUser;
import tdsi2025.mcs.model.AuditLog;
import tdsi2025.mcs.model.CryptoOperation;
import tdsi2025.mcs.model.KeyMaterial;
import tdsi2025.mcs.repository.AppUserRepository;
import tdsi2025.mcs.repository.AuditLogRepository;
import tdsi2025.mcs.repository.CryptoOperationRepository;
import tdsi2025.mcs.repository.KeyMaterialRepository;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CryptoOperationService {

    private final CryptoOperationRepository cryptoOperationRepo;
    private final AppUserRepository userRepo;
    private final KeyMaterialRepository keyRepo;
    private final AuditLogRepository auditRepo;
    private final CryptoOperationMapper mapper;

    /**
     * Crée et enregistre une opération cryptographique, avec audit automatique.
     */
    public void createOperation(CryptoOperationDTO dto, String inputEncrypted, String outputEncrypted) {
        AppUser performer = getUser(dto.getPerformedById());
        KeyMaterial key = getKey(dto.getKeyMaterialId());

        CryptoOperation entity = mapper.toEntity(dto);
        entity.setPerformedBy(performer);
        entity.setCreatedAt(Instant.now());
        entity.setInputDataEncrypted(inputEncrypted);
        entity.setOutputDataEncrypted(outputEncrypted);
        entity.setKeyMaterial(key);

        CryptoOperation saved = cryptoOperationRepo.save(entity);

        auditRepo.save(AuditLog.builder()
                .action("CRYPTO_OPERATION_" + dto.getServiceType())
                .details("Algorithm=" + dto.getAlgorithm() +
                        ", Primitive=" + dto.getPrimitiveType() +
                        ", KeyMaterialId=" + dto.getKeyMaterialId())
                .actor(performer)
                .requestId(UUID.randomUUID().toString())
                .createdAt(saved.getCreatedAt())
                .verified(true)
                .build());

        mapper.toDto(saved);
    }


    // 🔒 Internal helper
    private AppUser getUser(String userId) {
        return userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable: " + userId));
    }

    private KeyMaterial getKey(Long keyMaterialId) {
        if (keyMaterialId == null) return null;
        return keyRepo.findById(keyMaterialId)
                .orElseThrow(() -> new RuntimeException("Matériel de clé introuvable: " + keyMaterialId));
    }

    /**
     * Retourne les opérations paginées.
     */
    public Page<CryptoOperationDTO> findAll(Pageable pageable) {
        return cryptoOperationRepo.findAll(pageable).map(mapper::toDto);
    }

    /**
     * Retourne une opération par son ID.
     */
    public CryptoOperationDTO findById(Long id) {
        return cryptoOperationRepo.findById(id)
                .map(mapper::toDto)
                .orElseThrow(() -> new CryptoOperationNotFoundException(id));
    }

    /**
     * Supprime une opération par son ID.
     */
    public void deleteById(Long id) {
        CryptoOperation op = cryptoOperationRepo.findById(id)
                .orElseThrow(() -> new CryptoOperationNotFoundException(id));
        cryptoOperationRepo.delete(op);

        auditRepo.save(AuditLog.builder()
                .action("CRYPTO_OPERATION_DELETED")
                .details("Operation ID=" + id)
                .actor(op.getPerformedBy())
                .requestId(UUID.randomUUID().toString())
                .createdAt(Instant.now())
                .verified(true)
                .build());
    }

    /**
     * Recherche les opérations d’un utilisateur.
     */
    public List<CryptoOperationDTO> findByUser(String userId) {
        AppUser user = getUser(userId);
        return cryptoOperationRepo.findByPerformedBy(user)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    public List<CryptoOperationDTO> findByKey(Long keyId) {
        return cryptoOperationRepo.findByKeyMaterial_Id(keyId)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    /**
     * Statistiques par primitive.
     */
    public Map<CryptoPrimitiveType, Long> countByPrimitiveType() {
        return cryptoOperationRepo.findAll().stream()
                .collect(Collectors.groupingBy(CryptoOperation::getPrimitiveType, Collectors.counting()));
    }

    /**
     * Statistiques par service.
     */
    public Map<CryptoServiceType, Long> countByServiceType() {
        return cryptoOperationRepo.findAll().stream()
                .collect(Collectors.groupingBy(CryptoOperation::getServiceType, Collectors.counting()));
    }

}

