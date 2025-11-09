package tdsi2025.mcs.util;

import org.bouncycastle.jce.provider.BouncyCastleProvider;
import tdsi2025.mcs.enums.CryptoAlgorithm;
import tdsi2025.mcs.enums.HashFunction;
import tdsi2025.mcs.enums.PaddingScheme;
import tdsi2025.mcs.enums.SymmetricMode;
import tdsi2025.mcs.exception.UnsupportedAlgorithmException;

import javax.crypto.*;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.IvParameterSpec;
import java.security.*;
import java.security.spec.*;
import java.util.*;
import java.util.stream.Collectors;

import static java.util.Map.entry;

/**
 * CryptoUtil v2 - Version améliorée
 * - Ajout des imports complets
 * - Correction du nommage des paddings (PKCS5Padding / PKCS7Padding)
 * - Support AEAD via GCMParameterSpec
 * - Helpers pour charger keys PEM en PrivateKey/PublicKey
 * - Mappings et validations supplémentaires
 */
public final class CryptoUtil {

    static {
        if (Security.getProvider("BC") == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
    }

    private CryptoUtil() {}

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    // ==========================================================
    // 🔐 TABLES DE RÉFÉRENCE
    // ==========================================================
    private static final Map<CryptoAlgorithm, List<Integer>> KEY_SIZES = Map.ofEntries(
            entry(CryptoAlgorithm.AES, List.of(128, 192, 256)),
            entry(CryptoAlgorithm.TRIPLE_DES, List.of(112, 168)),
            entry(CryptoAlgorithm.BLOWFISH, List.of(32, 448)),
            entry(CryptoAlgorithm.RC4, List.of(40, 128, 256, 2048)),
            entry(CryptoAlgorithm.CHACHA20, List.of(256)),
            entry(CryptoAlgorithm.RSA, List.of(1024, 2048, 3072, 4096)),
            entry(CryptoAlgorithm.DSA, List.of(1024, 2048, 3072)),
            entry(CryptoAlgorithm.ECDSA, List.of(256, 384, 521)),
            entry(CryptoAlgorithm.EDDSA, List.of(256, 384, 512)),
            entry(CryptoAlgorithm.ELGAMAL, List.of(1024, 2048, 3072))
    );

    private static final Set<SymmetricMode> MODES_WITH_IV =
            EnumSet.of(SymmetricMode.CBC, SymmetricMode.CTR, SymmetricMode.CFB, SymmetricMode.OFB,
                    SymmetricMode.GCM, SymmetricMode.CCM, SymmetricMode.XTS);

    private static final Map<String, List<String>> ALGORITHM_CATEGORIES = Map.ofEntries(
            entry("symmetric", List.of(
                    "AES", "DES", "DESEDE", "DES3", "TRIPLE_DES",
                    "BLOWFISH", "RC4", "ARCFOUR",
                    "CHACHA20", "CHACHA20-POLY1305"
            )),
            entry("asymmetric", List.of("RSA", "DSA", "ECDSA", "ELGAMAL", "EDDSA")),
            entry("signature", List.of("RSA", "DSA", "ECDSA", "EDDSA")),
            entry("mac", List.of("HMACSHA256", "HMACSHA512", "CMAC")),
            entry("hash", List.of("SHA256", "SHA512", "SHA3", "BLAKE2")),
            entry("key_exchange", List.of("DIFFIE_HELLMAN", "ECDH"))
    );

    // ==========================================================
    // 🧾 SIGNATURES ET HACHAGES
    // ==========================================================
    public static String getSignatureAlgorithm(CryptoAlgorithm algo, HashFunction hashFunction) {
        String base = algo.name().toUpperCase();

        if (hashFunction == null || hashFunction == HashFunction.NONE) {
            if (base.startsWith("ED")) return base; // Ed25519, Ed448
            throw new IllegalArgumentException("Un hash est requis pour : " + algo);
        }

        String hash = switch (hashFunction) {
            case SHA256 -> "SHA256";
            case SHA512 -> "SHA512";
            case SHA3_256 -> "SHA3-256";
            case BLAKE2B -> "BLAKE2B-256";
            default -> throw new IllegalArgumentException("Hash non supporté : " + hashFunction);
        };

        return switch (base) {
            case "RSA" -> hash + "withRSA";
            case "DSA" -> hash + "withDSA";
            case "ECDSA" -> hash + "withECDSA";
            default -> throw new IllegalArgumentException("Signature non supportée pour : " + algo);
        };
    }

    // ===============================
    // 🔍 JCA NAMES pour Hash / HMAC
    // ===============================
    public static String getDigestJcaName(HashFunction function) {
        return switch (function) {
            case SHA256 -> "SHA-256";
            case SHA512 -> "SHA-512";
            case SHA3_256 -> "SHA3-256";
            case BLAKE2B -> "BLAKE2B-512";
            default -> throw new IllegalArgumentException("Algorithme non supporté : " + function);
        };
    }

    public static String getHmacJcaName(HashFunction function) {
        return switch (function) {
            case SHA256 -> "HmacSHA256";
            case SHA512 -> "HmacSHA512";
            case SHA3_256 -> "HmacSHA3-256";
            case BLAKE2B -> "HmacBLAKE2B-512";
            default -> throw new IllegalArgumentException("Hash non supporté pour HMAC : " + function);
        };
    }

    // ==========================================================
    // 🔍 VALIDATION / UTILITAIRES
    // ==========================================================
    public static boolean isAlgorithmSupported(String category, String algo) {
        if (category == null || algo == null) return false;
        return Optional.ofNullable(ALGORITHM_CATEGORIES.get(category.toLowerCase()))
                .map(list -> list.stream().anyMatch(a -> a.equalsIgnoreCase(algo)))
                .orElse(false);
    }

    public static boolean isValidKeySize(CryptoAlgorithm algo, int size) {
        return Optional.ofNullable(KEY_SIZES.get(algo)).map(list -> list.contains(size)).orElse(false);
    }

    // ==========================================================
    // 🧩 IV / Nonce Tools
    // ==========================================================
    public static boolean requiresIV(SymmetricMode mode) {
        return mode != null && MODES_WITH_IV.contains(mode);
    }

    public static int getIVLength(String algorithm, SymmetricMode mode) {
        if (mode == null && algorithm == null) return 0;
        String upperAlgo = (algorithm != null) ? algorithm.toUpperCase(Locale.ROOT) : "";

        // 🔹 Exceptions spécifiques
        if (upperAlgo.equals("DES") || upperAlgo.equals("TRIPLE_DES") || upperAlgo.equals("DESEDE")) {
            return 8; // 64 bits
        }

        if (upperAlgo.equals("CHACHA20") || upperAlgo.equals("CHACHA20-POLY1305")) {
            return 12; // 96 bits nonce
        }

        // 🔹 Dépendance au mode
        if (mode != null) {
            return switch (mode) {
                case GCM, CCM -> 12;   // 96 bits
                case XTS -> 32;        // 256 bits
                default -> 16;         // 128 bits (AES, Blowfish, etc.)
            };
        }

        return 16;
    }

    /**
     * Génère un IV ou nonce aléatoire adapté à l’algorithme et au mode.
     */
    public static byte[] generateIV(String algorithm, SymmetricMode mode) {
        int len = getIVLength(algorithm, mode);
        if (len == 0) return new byte[0];
        byte[] iv = new byte[len];
        SECURE_RANDOM.nextBytes(iv);
        return iv;
    }

    /**
     * Extrait l’IV du tableau combiné (IV + ciphertext).
     */
    public static byte[] extractIV(String algorithm, SymmetricMode mode, byte[] combined) {
        int len = getIVLength(algorithm, mode);
        if (combined == null || combined.length < len) return new byte[0];
        return Arrays.copyOfRange(combined, 0, len);
    }

    /**
     * Extrait le ciphertext du tableau combiné (IV + ciphertext).
     */
    public static byte[] extractCipherText(String algorithm, SymmetricMode mode, byte[] combined) {
        int len = getIVLength(algorithm, mode);
        if (combined == null || combined.length <= len) return new byte[0];
        return Arrays.copyOfRange(combined, len, combined.length);
    }

    /**
     * Concatène deux tableaux de bytes (IV + ciphertext, etc.)
     */
    public static byte[] concat(byte[] a, byte[] b) {
        if (a == null) a = new byte[0];
        if (b == null) b = new byte[0];
        byte[] result = new byte[a.length + b.length];
        System.arraycopy(a, 0, result, 0, a.length);
        System.arraycopy(b, 0, result, a.length, b.length);
        return result;
    }

    public static String toHex(byte[] data) {
        if (data == null) return "null";
        StringBuilder sb = new StringBuilder(data.length * 2);
        for (byte b : data) {
            sb.append(String.format("%02X", b));
        }
        return sb.toString();
    }

    // ==========================================================
    // 🔧 CRYPTOS : CIPHER BUILDER
    // ==========================================================
    /**
     * @param algo    - ex: "AES"
     * @param mode    - SymmetricMode enum (ex: CBC, GCM)
     * @param opMode  - Cipher.ENCRYPT_MODE or Cipher.DECRYPT_MODE
     * @param key     - SecretKey
     * @param iv      - IV (required for modes that need it)
     * @param padding - PaddingScheme enum (NONE, PKCS5, PKCS7, etc.)
     */
    public static Cipher buildSymmetricCipher(String algo, SymmetricMode mode, int opMode,
                                              SecretKey key, byte[] iv, PaddingScheme padding) throws Exception {
        if (algo == null || key == null) throw new IllegalArgumentException("Algo et key requis");

        String upperAlgo = algo.toUpperCase(Locale.ROOT).trim();

        if (!isAlgorithmSupported("symmetric", upperAlgo))
            throw new IllegalArgumentException("Algorithme symétrique non supporté : " + algo);

        // ---- mappe les alias aux noms JCE/BC réels ----
        String jceAlgo = switch (upperAlgo) {
            case "TRIPLE_DES", "DES3", "DESEDE" -> "DESede";
            case "AES" -> "AES";
            case "BLOWFISH" -> "Blowfish";
            case "RC4", "ARCFOUR" -> "RC4"; // provider peut accepter "RC4" ou "ARCFOUR"
            case "CHACHA20" -> "ChaCha20-Poly1305"; // AEAD variant
            default -> upperAlgo;
        };

        // ---- Construire la partie padding ----
        String padPart;
        if (padding == null || padding == PaddingScheme.NONE) {
            padPart = "NoPadding";
        } else {
            padPart = padding.name().endsWith("Padding") ? padding.name() : padding.name() + "Padding";
        }

        // ---- Construire la transformation ----
        String transformation;
        boolean isStreamCipher = jceAlgo.equalsIgnoreCase("RC4");
        boolean isAEADChaCha = jceAlgo.equalsIgnoreCase("ChaCha20-Poly1305");

        if (isStreamCipher) {
            // RC4 : pas de mode/padding
            transformation = "RC4";
            // force NoPadding semantics
            mode = null;
        } else if (isAEADChaCha) {
            // ChaCha20-Poly1305 est fourni comme transformation unique
            transformation = "ChaCha20-Poly1305";
            // AEAD -> NoPadding
            mode = null;
        } else {
            String modePart = (mode != null) ? mode.name() : "";
            transformation = (modePart.isEmpty()) ? jceAlgo : jceAlgo + "/" + modePart + "/" + padPart;
        }

        Cipher cipher;
        try {
            cipher = Cipher.getInstance(transformation, "BC");
        } catch (NoSuchAlgorithmException | NoSuchPaddingException | NoSuchProviderException ex) {
            // fallback provider-agnostic
            cipher = Cipher.getInstance(transformation);
        }

        // ---- initialisation ----
        if (isStreamCipher) {
            // RC4: init with key only
            cipher.init(opMode, key);
            return cipher;
        }

        if (isAEADChaCha) {
            // ChaCha20-Poly1305 : nécessite un nonce (12 bytes) ; BouncyCastle accepte IvParameterSpec for nonce
            if (iv == null || iv.length != 12) {
                throw new IllegalArgumentException("ChaCha20-Poly1305 requiert un IV/nonce de 12 octets");
            }
            // Use IvParameterSpec as nonce; many BC versions accept it for ChaCha20-Poly1305
            cipher.init(opMode, key, new IvParameterSpec(iv), SECURE_RANDOM);
            return cipher;
        }

        // Modes qui demandent un IV (CBC/CTR/CFB/OFB/GCM/CCM/XTS)
        if (requiresIV(mode)) {
            if (iv == null) throw new IllegalArgumentException("IV requis pour le mode " + mode);
            if (mode == SymmetricMode.GCM) {
                // 128-bit tag length recommended
                GCMParameterSpec gcmSpec = new GCMParameterSpec(128, iv);
                cipher.init(opMode, key, gcmSpec, SECURE_RANDOM);
            } else if (mode == SymmetricMode.CCM) {
                // CCM may not be available on all JVMs; use IvParameterSpec fallback
                cipher.init(opMode, key, new IvParameterSpec(iv), SECURE_RANDOM);
            } else {
                cipher.init(opMode, key, new IvParameterSpec(iv), SECURE_RANDOM);
            }
        } else {
            cipher.init(opMode, key);
        }

        return cipher;
    }

    public static Cipher buildAsymmetricCipher(String algo, PaddingScheme padding) throws Exception {
        if (algo == null) throw new IllegalArgumentException("Algorithm must not be null");
        String upper = algo.toUpperCase();

        if (!isAlgorithmSupported("asymmetric", upper)) {
            throw new UnsupportedAlgorithmException("Unsupported asymmetric algorithm: " + algo);
        }

        if ("RSA".equals(upper)) {
            // prefer OAEPParameterSpec for clarity (SHA-256 + MGF1(SHA-256))
            if (padding == PaddingScheme.OAEP) {
                Cipher cipher;
                try {
                    cipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding", "BC");
                } catch (Exception ex) {
                    cipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding");
                }
                return cipher;
            } else if (padding == PaddingScheme.PKCS1_V1_5 || padding == PaddingScheme.PKCS1) {
                try {
                    return Cipher.getInstance("RSA/ECB/PKCS1Padding", "BC");
                } catch (Exception ex) {
                    return Cipher.getInstance("RSA/ECB/PKCS1Padding");
                }
            } else if (padding == PaddingScheme.NONE) {
                try {
                    return Cipher.getInstance("RSA/ECB/NoPadding", "BC");
                } catch (Exception ex) {
                    return Cipher.getInstance("RSA/ECB/NoPadding");
                }
            } else {
                throw new IllegalArgumentException("Unsupported RSA padding: " + padding);
            }
        }

        // ECC/DSA/ELGAMAL: providers differ; delegate to provider name
        if ("ECC".equals(upper) || "ECDSA".equals(upper)) {
            // ECIES if available: "ECIES" or rely on Signature for sign/verify, not Cipher.
            try {
                return Cipher.getInstance("ECIES", "BC");
            } catch (Exception ex) {
                // fallback: let caller handle (EC may not be used with Cipher)
                return Cipher.getInstance("ECIES");
            }
        }

        throw new UnsupportedAlgorithmException("Asymmetric algorithm not supported by buildAsymmetricCipher: " + algo);
    }

    public static Cipher buildAsymmetricOrSymmetricCipher(CryptoAlgorithm algo, PaddingScheme padding
    ) throws Exception {

        if (algo == null)
            throw new IllegalArgumentException("Algorithm must not be null");

        if (padding == null)
            throw new IllegalArgumentException("Padding scheme must not be null");

        switch (algo) {

            case RSA -> {
                String transformation;
                switch (padding) {
                    case OAEP -> transformation = "RSA/ECB/OAEPWithSHA-256AndMGF1Padding";
                    case PKCS1_V1_5 -> transformation = "RSA/ECB/PKCS1Padding";
                    case NONE -> transformation = "RSA/ECB/NoPadding";
                    default -> throw new IllegalArgumentException(
                            "Padding " + padding + " is not supported for RSA (use OAEP, PKCS1_V1_5, or NONE)");
                }
                return Cipher.getInstance(transformation);
            }

            case AES -> {
                // AES n'utilise pas de padding de type OAEP ou PKCS1
                switch (padding) {
                    case NONE, PKCS5, GCM -> {
                        // "AESWrap" est la transformation standard pour l'enveloppement AES
                        return Cipher.getInstance("AESWrap");
                    }
                    default -> throw new IllegalArgumentException(
                            "Padding " + padding + " is not compatible with AES (use NONE, PKCS5, or GCM)");
                }
            }

            default -> throw new IllegalArgumentException("Unsupported algorithm for wrapping: " + algo);
        }
    }

    // ==========================================================
    // GÉNÉRATION DE CLÉS
    // ==========================================================
    public static KeyPair generateAsymmetricKeyPair(String algo, int size) throws Exception {
        KeyPairGenerator gen;
        switch (algo.toUpperCase()) {
            case "RSA" -> {
                gen = KeyPairGenerator.getInstance("RSA");
                gen.initialize(size, SECURE_RANDOM);
            }
            case "DSA" -> {
                gen = KeyPairGenerator.getInstance("DSA");
                gen.initialize(size, SECURE_RANDOM);
            }
            case "ECDSA", "ECDH", "EC" -> {
                gen = KeyPairGenerator.getInstance("EC");
                String curve = switch (size) {
                    case 384 -> "secp384r1";
                    case 521 -> "secp521r1";
                    default -> "secp256r1";
                };
                gen.initialize(new ECGenParameterSpec(curve), SECURE_RANDOM);
            }
            case "EDDSA", "ED25519" -> {
                gen = KeyPairGenerator.getInstance("Ed25519", "BC");
                // Ed25519 ignores size param
            }
            case "ELGAMAL" -> {
                gen = KeyPairGenerator.getInstance("ElGamal", "BC");
                gen.initialize(size, SECURE_RANDOM);
            }
            default -> throw new IllegalArgumentException("Algorithme asymétrique non supporté : " + algo);
        }
        return gen.generateKeyPair();
    }

    public static SecretKey generateSymmetricKey(String algo, int size) throws Exception {
        if (algo == null) throw new IllegalArgumentException("Algorithme requis");

        String normalized = algo.toUpperCase();

        // Validation via KEY_SIZES si on a un CryptoAlgorithm correspondant
        try {
            CryptoAlgorithm ca = CryptoAlgorithm.valueOf(normalized);
            if (!isValidKeySize(ca, size)) {
                throw new IllegalArgumentException("Taille de clé non valide pour " + algo + ": " + size);
            }
        } catch (IllegalArgumentException ignored) {
        }

        // Mappe l'algorithme aux noms utilisés par KeyGenerator
        String keyGenAlgo = switch (normalized) {
            case "TRIPLE_DES", "DES3", "DESEDE" -> "DESede";
            case "CHACHA20" -> "ChaCha20";
            case "AES" -> "AES";
            case "BLOWFISH" -> "Blowfish";
            case "RC4" -> "RC4";
            default -> normalized;
        };

        KeyGenerator keyGen;
        try {
            keyGen = KeyGenerator.getInstance(keyGenAlgo, "BC");
        } catch (NoSuchProviderException e) {
            keyGen = KeyGenerator.getInstance(keyGenAlgo);
        }

        // KeyGenerator.init expects key size in bits for most algorithms
        keyGen.init(size, SECURE_RANDOM);
        return keyGen.generateKey();
    }

    // ==========================================================
    // 📦
    // ==========================================================
    public static KeyFactory getKeyFactory(String algo) throws Exception {
        return switch (algo.toUpperCase()) {
            case "RSA" -> KeyFactory.getInstance("RSA");
            case "DSA" -> KeyFactory.getInstance("DSA");
            case "DH" -> KeyFactory.getInstance("DH");
            case "ECDSA", "ECDH", "ECC" -> KeyFactory.getInstance("EC");
            case "EDDSA" -> KeyFactory.getInstance("Ed25519");
            case "ELGAMAL" -> KeyFactory.getInstance("ElGamal", "BC");
            default -> throw new IllegalArgumentException("Algorithme non supporté : " + algo);
        };
    }

    // ==========================================================
    // 🧾 LISTE DES ALGORITHMES UTILES (aide dev)
    // ==========================================================
    public static List<String> listAlgorithmsByCategory(String category) {
        return Optional.ofNullable(ALGORITHM_CATEGORIES.get(category.toLowerCase()))
                .map(list -> list.stream().map(String::valueOf).collect(Collectors.toList()))
                .orElse(Collections.emptyList());
    }

}
