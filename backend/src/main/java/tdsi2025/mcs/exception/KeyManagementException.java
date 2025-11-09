package tdsi2025.mcs.exception;

public class KeyManagementException extends RuntimeException {
    public KeyManagementException(String msg) { super(msg); }
    public KeyManagementException(String msg, Throwable t) { super(msg, t); }
}
