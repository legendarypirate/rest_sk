import {
  AUTH_PASSWORD_MAX_LENGTH,
  AUTH_PASSWORD_MIN_LENGTH,
} from './constants';
import { emailLocalPart } from './email';

export type PasswordPolicyIssue =
  | 'TOO_SHORT'
  | 'TOO_LONG'
  | 'MISSING_LOWER'
  | 'MISSING_UPPER'
  | 'MISSING_DIGIT'
  | 'CONTAINS_IDENTIFIER';

export function passwordPolicyIssues(
  password: string,
  identifier?: string,
): PasswordPolicyIssue[] {
  const issues: PasswordPolicyIssue[] = [];

  if (password.length < AUTH_PASSWORD_MIN_LENGTH) {
    issues.push('TOO_SHORT');
  }

  if (password.length > AUTH_PASSWORD_MAX_LENGTH) {
    issues.push('TOO_LONG');
  }

  if (!/[a-z]/.test(password)) {
    issues.push('MISSING_LOWER');
  }

  if (!/[A-Z]/.test(password)) {
    issues.push('MISSING_UPPER');
  }

  if (!/\d/.test(password)) {
    issues.push('MISSING_DIGIT');
  }

  if (identifier) {
    const haystack = password.toLowerCase();
    const email = identifier.toLowerCase().trim();
    const local = emailLocalPart(email).toLowerCase();

    const containsEmail = email.length >= 3 && haystack.includes(email);
    const containsLocal =
      local.length >= AUTH_PASSWORD_MIN_LENGTH && haystack.includes(local);

    if (containsEmail || containsLocal) {
      issues.push('CONTAINS_IDENTIFIER');
    }
  }

  return issues;
}

export function assertPasswordPolicy(
  password: string,
  identifier?: string,
): void {
  const issues = passwordPolicyIssues(password, identifier);

  if (issues.length > 0) {
    throw Object.assign(new Error('Password does not meet policy'), {
      issues,
    });
  }
}
