export interface CryptoResponse<T> {
    success: boolean;
    errorCode?: string;
    message: string;
    data?: T;
}
