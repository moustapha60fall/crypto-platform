package tdsi2025.mcs.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DHKeyPairDTO {
    private String publicKeyBase64;
    private String privateKeyBase64;
}

