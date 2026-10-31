export abstract class AuthNotificationPort {
  abstract sendPasswordReset(input: {
    email: string;
    token: string;
  }): Promise<void>;

  abstract sendEmailVerification(input: {
    email: string;
    code: string;
  }): Promise<void>;
}
