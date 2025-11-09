package tdsi2025.mcs.exception;

public class KeyNotFoundException extends RuntimeException {
    public KeyNotFoundException(Long id) {
        super("Clé introuvable avec l'id: " + id);
    }
}

