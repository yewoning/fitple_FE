export interface ApiResponse<TData = undefined> {
  success: boolean;
  message: string;
  data?: TData;
}

/**
 * 전 엔드포인트 공통 에러 응답 형식 (400/403/404/500).
 */
export interface ApiErrorResponse {
  status: number;
  error: string;
  message: string;
}
