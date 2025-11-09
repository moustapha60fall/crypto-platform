package tdsi2025.mcs.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import tdsi2025.mcs.dto.CryptoResponse;
import tdsi2025.mcs.exception.CryptoOperationException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CryptoOperationException.class)
    public ResponseEntity<CryptoResponse<?>> handleCryptoError(CryptoOperationException ex) {
        log.error("❌ Crypto operation error: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(CryptoResponse.builder()
                        .success(false)
                        .errorCode("CRYPTO_OPERATION_FAILED")
                        .message(ex.getMessage())
                        .build());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<CryptoResponse<?>> handleBadRequest(IllegalArgumentException ex) {
        log.warn("⚠️ Invalid input: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(CryptoResponse.builder()
                        .success(false)
                        .errorCode("INVALID_INPUT")
                        .message(ex.getMessage())
                        .build());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<CryptoResponse<?>> handleUnexpected(Exception ex) {
        log.error("💥 Unexpected error: ", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(CryptoResponse.builder()
                        .success(false)
                        .errorCode("INTERNAL_ERROR")
                        .message("Erreur interne du service : " + ex.getMessage())
                        .build());
    }
}

