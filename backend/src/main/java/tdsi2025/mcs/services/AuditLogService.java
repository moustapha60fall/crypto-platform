package tdsi2025.mcs.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import tdsi2025.mcs.dto.AuditLogDTO;
import tdsi2025.mcs.mapper.AuditLogMapper;
import tdsi2025.mcs.model.AppUser;
import tdsi2025.mcs.model.AuditLog;
import tdsi2025.mcs.repository.AppUserRepository;
import tdsi2025.mcs.repository.AuditLogRepository;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AuditLogService {

    private final AuditLogRepository auditRepo;
    private final AuditLogMapper mapper;
    private final AppUserRepository userRepo;

    /**
     * Récupère tous les logs (non paginés).
     */
    public List<AuditLogDTO> findAll() {
        return auditRepo.findAll().stream()
                .map(mapper::toDto)
                .toList();
    }

    /**
     * Récupère les logs paginés.
     */
    public Page<AuditLogDTO> findAll(Pageable pageable) {
        return auditRepo.findAll(pageable).map(mapper::toDto);
    }

    /**
     * Recherche par utilisateur.
     */
    public List<AuditLogDTO> findByActor(String actorId) {
        AppUser actor = userRepo.findById(actorId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable: " + actorId));
        return auditRepo.findByActor(actor).stream()
                .map(mapper::toDto)
                .toList();
    }

    /**
     * Recherche par action.
     */
    public List<AuditLogDTO> findByAction(String action) {
        return auditRepo.findByActionIgnoreCase(action).stream()
                .map(mapper::toDto)
                .toList();
    }

    /**
     * Recherche par période.
     */
    public List<AuditLogDTO> findBetween(Instant start, Instant end) {
        return auditRepo.findByCreatedAtBetween(start, end).stream()
                .map(mapper::toDto)
                .toList();
    }

    /**
     * Création manuelle d’un log.
     */
    public AuditLogDTO createLog(AuditLogDTO dto) {
        AppUser actor = userRepo.findById(dto.getActorId())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable: " + dto.getActorId()));

        AuditLog entity = mapper.toEntity(dto);
        entity.setActor(actor);
        entity.setCreatedAt(Instant.now());
        entity.setRequestId(UUID.randomUUID().toString());

        AuditLog saved = auditRepo.save(entity);
        return mapper.toDto(saved);
    }

    /**
     * Statistiques par action.
     */
    public Map<String, Long> countByAction() {
        return auditRepo.findAll().stream()
                .collect(Collectors.groupingBy(AuditLog::getAction, Collectors.counting()));
    }
}
