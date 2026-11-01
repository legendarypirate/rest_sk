'use client';

import { toast } from '@packages/ui/components/sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { EmployeeStatus } from '@packages/types';

import { getApiErrorMessage } from '@/lib/api-error';
import { updateEmployeeStatus } from '@/services/employees/employees.service';

import { employeesQueryKey } from './use.employees';

export function useEmployeeMutate() {
  const queryClient = useQueryClient();

  const changeStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: EmployeeStatus }) =>
      updateEmployeeStatus(id, { status }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: employeesQueryKey });
      toast.success('Төлөв шинэчлэгдлээ.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  return { changeStatus };
}
