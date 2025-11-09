package tdsi2025.mcs.dto;

import lombok.*;

@Data
@Builder
public class CryptoResponse<T> {
    private boolean success;
    private String errorCode;
    private String message;
    private T data;
}
