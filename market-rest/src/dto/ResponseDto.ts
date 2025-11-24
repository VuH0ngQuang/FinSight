export interface ResponseDto<T = unknown> {
    success: boolean;
    errorCode: number;
    errorMessage: string | null;
    data: T | null;
}

