package tdsi2025.mcs.exception;

public class KeyRefNotFoundException extends RuntimeException {
    public KeyRefNotFoundException(String keyRef) {
        super("Clé introuvable avec keyRef: " + keyRef);
    }
}
