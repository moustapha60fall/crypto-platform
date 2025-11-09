package tdsi2025.mcs.exception;

public class UnsupportedAlgorithmException extends KeyManagementException {
    public UnsupportedAlgorithmException(String algo) { super("Unsupported algorithm: " + algo); }
}
