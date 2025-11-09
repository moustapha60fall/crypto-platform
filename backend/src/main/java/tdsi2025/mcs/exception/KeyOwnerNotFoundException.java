package tdsi2025.mcs.exception;

public class KeyOwnerNotFoundException extends KeyManagementException {
    public KeyOwnerNotFoundException(String ownerId) { super("Owner not found: " + ownerId); }
}
