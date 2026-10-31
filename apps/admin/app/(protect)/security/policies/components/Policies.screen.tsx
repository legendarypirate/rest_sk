'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@packages/ui/components/card';
import type { SecurityPolicySnapshot } from '@packages/types';

import { getApiErrorMessage } from '@/lib/api-error';

import { useSecurityPolicies } from '../hooks';
import {
  formatDurationLabel,
  formatDurationMs,
  formatYesNo,
} from '../lib/labels';

function PolicyRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="gap-4 py-3 flex items-start justify-between border-b last:border-b-0">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        {hint ? (
          <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>
        ) : null}
      </div>
      <div className="text-sm font-medium shrink-0 tabular-nums">{value}</div>
    </div>
  );
}

function PolicyCards({ policy }: { policy: SecurityPolicySnapshot }) {
  return (
    <div className="gap-4 md:grid-cols-2 grid">
      <Card>
        <CardHeader>
          <CardTitle>Нууц үг</CardTitle>
          <CardDescription>
            Шинэ болон солих үед шалгагдах дүрэм
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PolicyRow
            label="Хамгийн бага урт"
            value={`${policy.password.minLength} тэмдэгт`}
          />
          <PolicyRow
            label="Хамгийн их урт"
            value={`${policy.password.maxLength} тэмдэгт`}
          />
          <PolicyRow
            label="Түүхийн хязгаар"
            value={`${policy.password.historyLimit} нууц үг`}
            hint="Сүүлийн нууц үгүүдийг дахин ашиглахыг хориглоно"
          />
          <PolicyRow
            label="Жижиг үсэг"
            value={formatYesNo(policy.password.requireLowercase)}
          />
          <PolicyRow
            label="Том үсэг"
            value={formatYesNo(policy.password.requireUppercase)}
          />
          <PolicyRow
            label="Тоо"
            value={formatYesNo(policy.password.requireDigit)}
          />
          <PolicyRow
            label="Имэйл/нэр хориглох"
            value={formatYesNo(policy.password.forbidIdentifier)}
            hint="Нууц үгэнд имэйл эсвэл нэвтрэх нэр оруулахыг хориглоно"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Түгжээ</CardTitle>
          <CardDescription>
            Буруу нууц үг олон удаа оруулахад түр түгжинэ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PolicyRow
            label="Амжилтгүй оролдлого"
            value={`${policy.lockout.threshold} удаа`}
          />
          <PolicyRow
            label="Анхны түгжээ"
            value={`${policy.lockout.baseMinutes} минут`}
          />
          <PolicyRow
            label="Хамгийн их түгжээ"
            value={`${policy.lockout.maxMinutes} минут`}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Сесс</CardTitle>
          <CardDescription>Нэвтэрсэн төхөөрөмж, токены хугацаа</CardDescription>
        </CardHeader>
        <CardContent>
          <PolicyRow
            label="Идэвхтэй сесс"
            value={`${policy.session.maxActiveSessions} төхөөрөмж`}
          />
          <PolicyRow
            label="Хандалтын токен"
            value={formatDurationLabel(policy.session.accessTokenTtl)}
          />
          <PolicyRow
            label="Сэргээх токен"
            value={formatDurationLabel(policy.session.refreshTokenTtl)}
          />
          <PolicyRow
            label="Secure cookie"
            value={formatYesNo(policy.session.cookieSecure)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Нэмэлт баталгаажуулалт</CardTitle>
          <CardDescription>TOTP, нөөц код, имэйл код</CardDescription>
        </CardHeader>
        <CardContent>
          <PolicyRow
            label="MFA сорилтын хугацаа"
            value={formatDurationMs(policy.mfa.challengeTtlMs)}
          />
          <PolicyRow
            label="MFA оролдлого"
            value={`${policy.mfa.maxAttempts} удаа`}
          />
          <PolicyRow
            label="TOTP мөчлөг"
            value={`${policy.mfa.totpPeriodSeconds} секунд`}
          />
          <PolicyRow label="TOTP орон" value={`${policy.mfa.totpDigits}`} />
          <PolicyRow
            label="Нөөц код"
            value={`${policy.mfa.backupCodeCount} код`}
          />
          <PolicyRow
            label="Имэйл код"
            value={`${policy.emailCode.length} орон / ${formatDurationMs(policy.emailCode.ttlMs)}`}
          />
          <PolicyRow
            label="Нууц үг сэргээх"
            value={formatDurationMs(policy.passwordReset.ttlMs)}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export function PoliciesScreen() {
  const policies = useSecurityPolicies();

  return (
    <div className="min-h-0 flex flex-1 flex-col">
      <div className="px-4 py-3 border-b">
        <h1 className="text-lg font-semibold">Хамгаалалтын бодлого</h1>
        <p className="text-sm text-muted-foreground">
          Одоо серверт мөрдөж буй нууц үг, түгжээ, сесс, MFA дүрэм
        </p>
      </div>

      <div className="min-h-0 px-4 flex-1 overflow-auto">
        {policies.isPending ? (
          <div className="min-h-48 text-sm flex items-center justify-center text-muted-foreground">
            Уншиж байна…
          </div>
        ) : policies.isError ? (
          <div className="min-h-48 text-sm flex items-center justify-center text-destructive">
            {getApiErrorMessage(policies.error)}
          </div>
        ) : policies.data ? (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Эдгээр утга серверийн тохиргооноос ирнэ. Өөрчлөхөд API дахин
              эхлүүлэх шаардлагатай.
            </p>
            <PolicyCards policy={policies.data} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
