import {
  lookupByEmployeeCode,
  normalizeEmployeeCode,
  registerEmployeeCodeKeys,
} from '@/common/utils/employee-code';

export type MealOrderEmployeeView = {
  id: string;
  firstName: string;
  lastName: string;
  vehicle?: unknown;
};

export type MealOrderEmployeeIndex = {
  byId: Map<string, MealOrderEmployeeView>;
  byCode: Map<string, MealOrderEmployeeView>;
};

export function mergeMealOrderEmployeeIndex(
  left: MealOrderEmployeeIndex,
  right: MealOrderEmployeeIndex,
): MealOrderEmployeeIndex {
  const byId = new Map(left.byId);
  const byCode = new Map(left.byCode);

  for (const [id, view] of right.byId) {
    const existing = byId.get(id);
    if (!existing || !employeeNameFromParts(existing)) {
      byId.set(id, view);
    }
  }

  for (const [key, view] of right.byCode) {
    const existing = byCode.get(key);
    if (!existing || !employeeNameFromParts(existing)) {
      byCode.set(key, view);
    }
  }

  return { byId, byCode };
}

export function buildMealOrderEmployeeIndex(
  employees: Array<
    MealOrderEmployeeView & {
      employeeCode: string | null;
    }
  >,
): MealOrderEmployeeIndex {
  const byId = new Map<string, MealOrderEmployeeView>();
  const byCode = new Map<string, MealOrderEmployeeView>();

  for (const employee of employees) {
    byId.set(employee.id, {
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      vehicle: employee.vehicle,
    });
    const code = employee.employeeCode?.trim();
    if (!code) continue;
    registerEmployeeCodeKeys(byCode, code, byId.get(employee.id)!);
  }

  return { byId, byCode };
}

export function resolveMealOrderEmployee(input: {
  employeeId: string | null;
  employeeCode: string;
  employee: { firstName: string; lastName: string; vehicle?: unknown } | null;
  index: MealOrderEmployeeIndex;
}): MealOrderEmployeeView | null {
  if (input.employeeId) {
    const byId = input.index.byId.get(input.employeeId);
    if (byId && employeeNameFromParts(byId)) {
      return byId;
    }
  }

  const byCode = lookupByEmployeeCode(input.index.byCode, input.employeeCode);
  if (byCode && employeeNameFromParts(byCode)) {
    return byCode;
  }

  if (input.employee && employeeNameFromParts(input.employee)) {
    return {
      id: input.employeeId ?? '',
      firstName: input.employee.firstName,
      lastName: input.employee.lastName,
      vehicle: input.employee.vehicle,
    };
  }

  return byCode ?? input.index.byId.get(input.employeeId ?? '') ?? null;
}

export function employeeNameFromParts(input: {
  firstName: string;
  lastName: string;
}) {
  const name = `${input.lastName} ${input.firstName}`.trim();
  if (!name || name === '—' || name === '— —') {
    return null;
  }
  return name;
}

export function readMetadataEmployeeName(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null;
  }
  const raw = (metadata as { employeeDisplayName?: unknown }).employeeDisplayName;
  if (typeof raw !== 'string') {
    return null;
  }
  const name = raw.trim();
  return name.length > 0 ? name : null;
}

export function employeeDisplayNameMetadata(
  employee: { firstName: string; lastName: string } | null | undefined,
) {
  if (!employee) {
    return undefined;
  }
  const name = employeeNameFromParts(employee);
  if (!name) {
    return undefined;
  }
  return { employeeDisplayName: name };
}

export function codesNeedingEmployeeLookup(
  rows: Array<{ employeeCode: string; employeeId: string | null }>,
) {
  return [
    ...new Set(
      rows
        .map((row) => normalizeEmployeeCode(row.employeeCode))
        .filter((code) => code.length > 0),
    ),
  ];
}

export function codesMissingMealOrderEmployeeName(
  rows: Array<{
    employeeCode: string;
    employeeId: string | null;
    metadata?: unknown;
    employee: { firstName: string; lastName: string } | null;
  }>,
  index: MealOrderEmployeeIndex,
) {
  const missing: string[] = [];
  for (const row of rows) {
    if (readMetadataEmployeeName(row.metadata)) {
      continue;
    }
    const resolved = resolveMealOrderEmployee({
      employeeId: row.employeeId,
      employeeCode: row.employeeCode,
      employee: row.employee,
      index,
    });
    if (employeeNameFromParts(resolved ?? row.employee)) {
      continue;
    }
    const code = normalizeEmployeeCode(row.employeeCode);
    if (code.length > 0) {
      missing.push(code);
    }
  }
  return [...new Set(missing)];
}
