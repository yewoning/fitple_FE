export interface ApiResponse<TData = undefined> {
  success: boolean;
  message: string;
  data?: TData;
}
