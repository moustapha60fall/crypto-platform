package tdsi2025.mcs.exception;

public class KeyNotFoundException extends KeyManagementException {
    public KeyNotFoundException(Long id) { super("Key not found: " + id); }
    public KeyNotFoundException(String ref) { super("Key not found: " + ref); }
}

