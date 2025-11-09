package tdsi2025.mcs.interfaces;

/**
 * Envelope encryption contract: encrypt/decrypt raw key bytes.
 * In production this should call a KMS/HSM (AWS KMS, Google KMS, Azure KeyVault, or on-prem HSM).
 */
public interface KeyEncryptor {
    /** encrypts plaintext bytes -> base64 encoded ciphertext (includes IV/metadata) */
    String encrypt(byte[] plaintext) throws Exception;

    /** decrypts base64 encoded ciphertext -> plaintext bytes */
    byte[] decrypt(String base64Ciphertext) throws Exception;
}
