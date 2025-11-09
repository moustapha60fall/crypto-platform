package tdsi2025.mcs.exception;

public class CryptoOperationNotFoundException extends RuntimeException {
    public CryptoOperationNotFoundException(Long id) {
        super("Opération cryptographique introuvable avec l'id: " + id);
    }
}
