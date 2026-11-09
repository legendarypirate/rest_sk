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
