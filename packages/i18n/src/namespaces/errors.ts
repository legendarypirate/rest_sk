import { AuthErrorCode } from '@packages/auth';
import { AppErrorCode } from '@packages/types';

import type { Locale } from '../types';

type ErrorCode = AppErrorCode | AuthErrorCode;

const errorMessages = {
  en: {
    [AppErrorCode.NOT_FOUND]: 'The requested resource was not found.',
    [AppErrorCode.CONFLICT]: 'This resource already exists.',
    [AppErrorCode.VERSION_CONFLICT]:
      'This record was updated by another request.',
    [AppErrorCode.HAS_DEPENDENTS]:
      'Remove or move what this contains before deleting it.',
    [AppErrorCode.INVALID_PARENT]:
      'That parent is not available. Choose one from the same branch.',
    [AppErrorCode.PARENT_CYCLE]:
      'That would nest this item inside itself. Choose a parent outside its own branch.',
    [AppErrorCode.INVALID_PREREQUISITE]:
      'That prerequisite is not available. Choose a published item other than this one.',
    [AppErrorCode.PREREQUISITE_CYCLE]:
      'That requirement would loop back here. Choose something this item does not already depend on.',
    [AppErrorCode.BAD_REQUEST]: 'The request is invalid.',
    [AppErrorCode.MEAL_WINDOW_CLOSED]:
      'Employee meal ordering is closed for this meal type right now.',
    [AppErrorCode.FORBIDDEN]: 'You do not have access.',
    [AppErrorCode.UNAUTHORIZED]: 'You are not authorized.',
    [AppErrorCode.RATE_LIMITED]: 'Too many requests. Please try again later.',
    [AppErrorCode.INTEGRATION_ERROR]: 'An upstream service error occurred.',
    [AppErrorCode.INTERNAL_SERVER_ERROR]: 'An unexpected error occurred.',
    [AuthErrorCode.INVALID_CREDENTIALS]: 'Email or password is incorrect.',
    [AuthErrorCode.ACCOUNT_LOCKED]: 'This account is temporarily locked.',
    [AuthErrorCode.ACCOUNT_DISABLED]: 'This account is disabled.',
    [AuthErrorCode.EMAIL_NOT_VERIFIED]: 'Email is not verified.',
    [AuthErrorCode.MUST_CHANGE_PASSWORD]: 'You must change your password.',
    [AuthErrorCode.PASSWORD_EXPIRED]: 'Your password has expired.',
    [AuthErrorCode.SESSION_EXPIRED]: 'Your session has expired.',
    [AuthErrorCode.TOKEN_REUSE]: 'This session is no longer valid.',
    [AuthErrorCode.DEVICE_BLOCKED]: 'This device is blocked.',
    [AuthErrorCode.MFA_REQUIRED]: 'Multi-factor authentication is required.',
    [AuthErrorCode.MFA_FAILED]: 'Invalid verification code.',
    [AuthErrorCode.MFA_NOT_ENABLED]:
      'Multi-factor authentication is not enabled.',
    [AuthErrorCode.WEAK_PASSWORD]: 'Password does not meet the policy.',
    [AuthErrorCode.PASSWORD_REUSED]: 'You cannot reuse a recent password.',
  },
  mn: {
    [AppErrorCode.NOT_FOUND]: 'Хүссэн өгөгдөл олдсонгүй.',
    [AppErrorCode.CONFLICT]: 'Энэ өгөгдөл аль хэдийн бүртгэлтэй байна.',
    [AppErrorCode.VERSION_CONFLICT]:
      'Энэ өгөгдлийг өөр хүсэлт шинэчилсэн байна.',
    [AppErrorCode.HAS_DEPENDENTS]:
      'Хамаарах бүртгэлийг эхлээд зөөж эсвэл архивласны дараа энэ бүртгэлийг архивлана уу.',
    [AppErrorCode.INVALID_PARENT]:
      'Энэ дээд түвшинг сонгох боломжгүй. Ижил салбараас сонгоно уу.',
    [AppErrorCode.PARENT_CYCLE]:
      'Ингэвэл өөрийн доор орох болно. Өөр салбараас дээд түвшин сонгоно уу.',
    [AppErrorCode.INVALID_PREREQUISITE]:
      'Энэ урьдчилсан шаардлагыг сонгох боломжгүй. Өөр идэвхтэй бүртгэл сонгоно уу.',
    [AppErrorCode.PREREQUISITE_CYCLE]:
      'Ингэвэл өөрийгөө шаардах болно. Хамааралгүй бүртгэл сонгоно уу.',
    [AppErrorCode.BAD_REQUEST]: 'Хүсэлт буруу байна.',
    [AppErrorCode.MEAL_WINDOW_CLOSED]:
      'Энэ хоолны захиалгын цаг хаагдсан байна.',
    [AppErrorCode.FORBIDDEN]: 'Хандах эрх байхгүй байна.',
    [AppErrorCode.UNAUTHORIZED]: 'Нэвтрэх эрх хүрэлцэхгүй байна.',
    [AppErrorCode.RATE_LIMITED]:
      'Хэт олон хүсэлт илгээлээ. Дараа дахин оролдоно уу.',
    [AppErrorCode.INTEGRATION_ERROR]: 'Гадаад системд алдаа гарлаа.',
    [AppErrorCode.INTERNAL_SERVER_ERROR]: 'Системийн алдаа гарлаа.',
    [AuthErrorCode.INVALID_CREDENTIALS]: 'Имэйл эсвэл нууц үг буруу байна.',
    [AuthErrorCode.ACCOUNT_LOCKED]: 'Бүртгэл түр түгжигдсэн байна.',
    [AuthErrorCode.ACCOUNT_DISABLED]: 'Бүртгэл идэвхгүй байна.',
    [AuthErrorCode.EMAIL_NOT_VERIFIED]: 'Имэйл хаяг баталгаажаагүй байна.',
    [AuthErrorCode.MUST_CHANGE_PASSWORD]: 'Нууц үгээ солих шаардлагатай.',
    [AuthErrorCode.PASSWORD_EXPIRED]: 'Нууц үгийн хугацаа дууссан байна.',
    [AuthErrorCode.SESSION_EXPIRED]: 'Холболтын хугацаа дууссан байна.',
    [AuthErrorCode.TOKEN_REUSE]: 'Энэ холболт хүчингүй болсон байна.',
    [AuthErrorCode.DEVICE_BLOCKED]:
      'Энэ төхөөрөмжөөр нэвтрэхийг хориглосон байна.',
    [AuthErrorCode.MFA_REQUIRED]: 'Нэмэлт баталгаажуулалт шаардлагатай.',
    [AuthErrorCode.MFA_FAILED]: 'Баталгаажуулах код буруу байна.',
    [AuthErrorCode.MFA_NOT_ENABLED]: 'Нэмэлт баталгаажуулалт идэвхжээгүй байна.',
    [AuthErrorCode.WEAK_PASSWORD]: 'Нууц үг шаардлага хангахгүй байна.',
    [AuthErrorCode.PASSWORD_REUSED]: 'Саяхны нууц үгээ дахин ашиглах боломжгүй.',
  },
} as const satisfies Record<Locale, Record<ErrorCode, string>>;

export function translateError(
  code: string | undefined,
  locale: Locale,
): string | undefined {
  if (!code) {
    return undefined;
  }

  const table = errorMessages[locale] as Record<string, string>;
  const fallback = errorMessages.en as Record<string, string>;
  return table[code] ?? fallback[code];
}
