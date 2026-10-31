import { AUTH_ACCESS_COOKIE, AUTH_REFRESH_COOKIE } from './constants';
import { AUTH_ROUTES, authUrl } from './routes';
import type {
  AuthApiError,
  AuthenticatedResponse,
  AuthLoginResponse,
  AuthSession,
  AuthUser,
  BackupCodesResponse,
  MfaChallengeResponse,
  TotpSetupResponse,
} from './types';
import type {
  EmailResendRequest,
  EmailVerifyRequest,
  LoginRequest,
  LogoutRequest,
  MfaDisableRequest,
  MfaTotpConfirmRequest,
  MfaVerifyRequest,
  PasswordChangeRequest,
  PasswordForgotRequest,
  PasswordResetRequest,
  RefreshRequest,
  RegisterRequest,
} from './schemas';

export type AuthClientConfig = {
  baseUrl: string;
  getAccessToken?: () => string | null | Promise<string | null>;
  onTokens?: (tokens: AuthenticatedResponse['tokens']) => void;
  fetch?: typeof fetch;
};

export class AuthClientError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AuthClientError';
  }
}

function isAuthApiError(value: unknown): value is AuthApiError {
  return (
    !!value &&
    typeof value === 'object' &&
    'statusCode' in value &&
    'code' in value &&
    'message' in value
  );
}

export function createAuthClient(config: AuthClientConfig) {
  const dispatcher = config.fetch ?? fetch;

  async function request<T>(
    method: string,
    path: string,
    body?: unknown,
    accessToken?: string | null,
  ): Promise<T> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    const token = accessToken ?? (await config.getAccessToken?.());

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await dispatcher(authUrl(path, config.baseUrl), {
      method,
      headers,
      credentials: 'include',
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (response.status === 204) {
      return undefined as T;
    }

    const payload = (await response.json().catch(() => null)) as unknown;

    if (!response.ok) {
      if (isAuthApiError(payload)) {
        throw new AuthClientError(
          payload.statusCode,
          payload.code,
          payload.message,
        );
      }

      throw new AuthClientError(
        response.status,
        response.status === 404 ? 'NOT_FOUND' : 'BAD_REQUEST',
        `Request failed (${response.status})`,
      );
    }

    return payload as T;
  }

  async function authenticated(
    method: string,
    path: string,
    body?: unknown,
    accessToken?: string | null,
  ): Promise<AuthenticatedResponse> {
    const result = await request<AuthenticatedResponse>(
      method,
      path,
      body,
      accessToken,
    );
    config.onTokens?.(result.tokens);
    return result;
  }

  return {
    login(input: LoginRequest) {
      return request<AuthLoginResponse>('POST', AUTH_ROUTES.login, input);
    },
    refresh(input: RefreshRequest = {}) {
      return authenticated('POST', AUTH_ROUTES.refresh, input);
    },
    logout(input: LogoutRequest = {}) {
      return request<void>('POST', AUTH_ROUTES.logout, input);
    },
    register(input: RegisterRequest) {
      return request<void>('POST', AUTH_ROUTES.register, input);
    },
    me() {
      return request<AuthUser>('GET', AUTH_ROUTES.me);
    },
    sessions() {
      return request<AuthSession[]>('GET', AUTH_ROUTES.sessions);
    },
    revokeSession(id: string) {
      return request<void>('DELETE', AUTH_ROUTES.session(id));
    },
    revokeOtherSessions() {
      return request<void>('POST', AUTH_ROUTES.revokeOtherSessions);
    },
    forgotPassword(input: PasswordForgotRequest) {
      return request<void>('POST', AUTH_ROUTES.passwordForgot, input);
    },
    resetPassword(input: PasswordResetRequest) {
      return request<void>('POST', AUTH_ROUTES.passwordReset, input);
    },
    changePassword(input: PasswordChangeRequest) {
      return request<void>('POST', AUTH_ROUTES.passwordChange, input);
    },
    verifyEmail(input: EmailVerifyRequest) {
      return request<void>('POST', AUTH_ROUTES.emailVerify, input);
    },
    resendEmailVerification(input: EmailResendRequest) {
      return request<void>('POST', AUTH_ROUTES.emailResend, input);
    },
    verifyMfa(input: MfaVerifyRequest) {
      return authenticated('POST', AUTH_ROUTES.mfaVerify, input);
    },
    setupTotp() {
      return request<TotpSetupResponse>('POST', AUTH_ROUTES.mfaTotpSetup);
    },
    confirmTotp(input: MfaTotpConfirmRequest) {
      return request<BackupCodesResponse>(
        'POST',
        AUTH_ROUTES.mfaTotpConfirm,
        input,
      );
    },
    disableMfa(input: MfaDisableRequest) {
      return request<void>('POST', AUTH_ROUTES.mfaDisable, input);
    },
    isMfaChallenge(
      value: AuthLoginResponse,
    ): value is MfaChallengeResponse {
      return value.mfaRequired;
    },
    cookies: {
      access: AUTH_ACCESS_COOKIE,
      refresh: AUTH_REFRESH_COOKIE,
    },
  };
}

export type AuthClient = ReturnType<typeof createAuthClient>;
