package tdsi2025.mcs.crypto;

import tdsi2025.mcs.dto.CryptoResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public final class ResponseBuilder {

    private ResponseBuilder() {
        // Empêche l’instanciation
    }

    // ✅ Réponse de succès (200 OK)
    public static <T> ResponseEntity<CryptoResponse<T>> success(String message, T data) {
        CryptoResponse<T> response = CryptoResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();

        return ResponseEntity.ok(response);
    }

    // ✅ Réponse de succès sans data (DELETE, etc.)
    public static ResponseEntity<CryptoResponse<Void>> success(String message) {
        CryptoResponse<Void> response = CryptoResponse.<Void>builder()
                .success(true)
                .message(message)
                .build();

        return ResponseEntity.ok(response);
    }

    // ⚠️ Erreur fonctionnelle ou utilisateur (400 BAD REQUEST)
    public static <T> ResponseEntity<CryptoResponse<T>> badRequest(String errorCode, String message) {
        CryptoResponse<T> response = CryptoResponse.<T>builder()
                .success(false)
                .errorCode(errorCode)
                .message(message)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // ⚠️ Erreur serveur (500 INTERNAL SERVER ERROR)
    public static <T> ResponseEntity<CryptoResponse<T>> serverError(String errorCode, String message) {
        CryptoResponse<T> response = CryptoResponse.<T>builder()
                .success(false)
                .errorCode(errorCode)
                .message(message)
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
