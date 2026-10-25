import { ApiResponse, ApiErrorResponse, RequestOptions } from "@/types/api";

export class ApiError extends Error {
  public status: number;
  public code: string;
  public correlationId: string;
  public messageAr: string;
  public fieldErrors?: Record<string, string>;

  constructor(
    status: number,
    code: string,
    messageEn: string,
    messageAr: string,
    correlationId: string,
    fieldErrors?: Record<string, string>
  ) {
    super(messageEn);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.correlationId = correlationId;
    this.messageAr = messageAr;
    this.fieldErrors = fieldErrors;
  }
}

class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;
  private authTokenGetter?: () => string | null;
  private onSessionExpired?: () => void;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
    this.defaultTimeout = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS) || 15000;
  }

  public setAuthTokenGetter(getter: () => string | null) {
    this.authTokenGetter = getter;
  }

  public setSessionExpiredHandler(handler: () => void) {
    this.onSessionExpired = handler;
  }

  private generateCorrelationId(): string {
    return `hosp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  public async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const correlationId = options.correlationId || this.generateCorrelationId();
    const timeout = options.timeoutMs || this.defaultTimeout;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    // Merge external abort signal if provided
    if (options.signal) {
      options.signal.addEventListener("abort", () => controller.abort());
    }

    const headers = new Headers(options.headers || {});
    headers.set("Content-Type", "application/json");
    headers.set("X-Correlation-ID", correlationId);

    if (this.authTokenGetter) {
      const token = this.authTokenGetter();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    const url = endpoint.startsWith("http")
      ? endpoint
      : `${this.baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(id);

      if (response.status === 401) {
        if (this.onSessionExpired && !options.skipSessionRefresh) {
          this.onSessionExpired();
        }
        throw new ApiError(
          401,
          "SESSION_EXPIRED",
          "Clinical session has expired. Please re-authenticate.",
          "انتهت جلسة العمل السريرية. يرجى إعادة تسجيل الدخول.",
          correlationId
        );
      }

      if (!response.ok) {
        let errJson: Partial<ApiErrorResponse> = {};
        try {
          errJson = await response.json();
        } catch {
          // Non-JSON response
        }

        const messageEn =
          errJson.error?.messageEn ||
          response.statusText ||
          "Clinical request failed";
        const messageAr =
          errJson.error?.messageAr || "فشل تنفيذ الطلب السريري في النظام";
        const code = errJson.error?.code || `HTTP_${response.status}`;

        throw new ApiError(
          response.status,
          code,
          messageEn,
          messageAr,
          correlationId,
          errJson.error?.fieldErrors
        );
      }

      const result: ApiResponse<T> = await response.json();
      return result;
    } catch (err: unknown) {
      clearTimeout(id);
      if (err instanceof ApiError) {
        throw err;
      }

      const isAbort = err instanceof DOMException && err.name === "AbortError";
      throw new ApiError(
        isAbort ? 408 : 500,
        isAbort ? "REQUEST_TIMEOUT" : "NETWORK_ERROR",
        isAbort
          ? "The clinical request timed out. Please verify system connectivity."
          : (err as Error)?.message || "A network error occurred while communicating with the hospital gateway.",
        isAbort
          ? "انتهت مهلة الطلب السريري. يرجى التحقق من اتصال الشبكة الطبية."
          : "حدث خطأ في شبكة الاتصال أثناء الاتصال ببوابة المستشفى.",
        correlationId
      );
    }
  }

  public get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  public post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public put<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
