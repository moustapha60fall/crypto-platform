package tdsi2025.mcs.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import tdsi2025.mcs.dto.AuditLogDTO;
import tdsi2025.mcs.services.AuditLogService;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
@Validated
public class AuditLogController {

    private final AuditLogService auditService;

    @GetMapping
    public ResponseEntity<Page<AuditLogDTO>> getAllLogs(Pageable pageable) {
        return ResponseEntity.ok(auditService.findAll(pageable));
    }

    @GetMapping("/user/{actorId}")
    public ResponseEntity<List<AuditLogDTO>> getLogsByActor(@PathVariable String actorId) {
        return ResponseEntity.ok(auditService.findByActor(actorId));
    }

    @GetMapping("/action/{action}")
    public ResponseEntity<List<AuditLogDTO>> getLogsByAction(@PathVariable String action) {
        return ResponseEntity.ok(auditService.findByAction(action));
    }

    @GetMapping("/between")
    public ResponseEntity<List<AuditLogDTO>> getLogsBetween(
            @RequestParam Instant start,
            @RequestParam Instant end
    ) {
        return ResponseEntity.ok(auditService.findBetween(start, end));
    }

    @PostMapping
    public ResponseEntity<AuditLogDTO> createLog(@Valid @RequestBody AuditLogDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(auditService.createLog(dto));
    }

    @GetMapping("/stats/actions")
    public ResponseEntity<Map<String, Long>> getActionStats() {
        return ResponseEntity.ok(auditService.countByAction());
    }
}
