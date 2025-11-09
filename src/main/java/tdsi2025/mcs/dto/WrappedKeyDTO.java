package tdsi2025.mcs.dto;

import lombok.*;
import tdsi2025.mcs.enums.CryptoAlgorithm;
import tdsi2025.mcs.enums.PaddingScheme;
import tdsi2025.mcs.enums.WrappingMode;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WrappedKeyDTO {

    private WrappingMode wrappingMode;
    private CryptoAlgorithm algorithm;     // RSA ou AES
    private PaddingScheme padding;         // OAEP, PKCS5Padding, etc.
    private String wrappingKeyRef;         // Référence de la clé utilisée pour envelopper
    private String targetKeyRef;           // Référence de la clé à envelopper
    private String targetKeyType;          // "AES", "DES", etc.

    private String wrappedKeyBase64;       // Résultat de l’enveloppement
    private String unwrappedKeyBase64;     // Résultat du désenveloppement

    private CryptoAlgorithm targetKeyAlgorithm;
    private String performedById;
}
