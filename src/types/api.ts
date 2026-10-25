import { PaginationMeta } from "./common";

export interface ApiResponse<T> {
  data: T;
  meta?: {
    correlationId: string;
    timestamp: string;
    pagination?: PaginationMeta;
  };
  error?: null;
}

export interface ApiErrorResponse {
  data: null;
  error: {
    code: string;
    messageEn: string;
    messageAr: string;
    correlationId: string;
    timestamp: string;
    fieldErrors?: Record<string, string>;
  };
}

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  correlationId?: string;
  skipSessionRefresh?: boolean;
}
