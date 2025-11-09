package tdsi2025.mcs.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class FileCryptoResponseDTO {
    private String inputFile;
    private String outputFile;
    private String operation;
}
