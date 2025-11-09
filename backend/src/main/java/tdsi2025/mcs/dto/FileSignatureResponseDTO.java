package tdsi2025.mcs.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import tdsi2025.mcs.enums.CryptoPrimitiveType;

@Data
@AllArgsConstructor
@Builder
public class FileSignatureResponseDTO {
    private String inputFile;   // Nom du fichier d'entrée
    private String outputFile;  // Nom du fichier résultant (signé ou vérifié)
    private String signature;  // Signature Base64/Hex (si sign)
    private boolean verified;  // Résultat de vérification (si verify)
    private CryptoPrimitiveType operation; // SIGNATURE ou VERIFICATION
}
