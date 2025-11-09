package tdsi2025.mcs.enums;

import javax.crypto.Cipher;

public enum KeyType {
    SYMMETRIC,
    ASYMMETRIC_PUBLIC,
    ASYMMETRIC_PRIVATE;

    /**
     * Convertit le code de type de clé Cipher (SECRET_KEY, PUBLIC_KEY, PRIVATE_KEY)
     * en type de clé interne KeyType.
     */
    public static KeyType fromCipherCode(int cipherCode) {
        return switch (cipherCode) {
            case Cipher.SECRET_KEY -> SYMMETRIC;
            case Cipher.PUBLIC_KEY -> ASYMMETRIC_PUBLIC;
            case Cipher.PRIVATE_KEY -> ASYMMETRIC_PRIVATE;
            default -> throw new IllegalArgumentException("Type de clé inconnu (cipherCode=" + cipherCode + ")");
        };
    }

    /**
     * Renvoie le code Cipher correspondant au KeyType.
     * (utile si tu veux faire l’inverse)
     */
    public int toCipherCode() {
        return switch (this) {
            case SYMMETRIC -> Cipher.SECRET_KEY;
            case ASYMMETRIC_PUBLIC -> Cipher.PUBLIC_KEY;
            case ASYMMETRIC_PRIVATE -> Cipher.PRIVATE_KEY;
        };
    }
}

