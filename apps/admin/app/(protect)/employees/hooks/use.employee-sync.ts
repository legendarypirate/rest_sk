'use client';

import { toast } from '@packages/ui/components/sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/lib/api-error';
import { syncEmployees } from '@/services/employees/employees.service';

import { employeesQueryKey } from './use.employees';

export function useEmployeeSync() {
  const queryClient = useQueryClient();

  const sync = useMutation({
    mutationFn: () => syncEmployees(),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: employeesQueryKey });
      void queryClient.invalidateQueries({ queryKey: ['integrations'] });

      if (!result.integrations) {
        toast.error('Идэвхтэй интеграци олдсонгүй');
        return;
      }

      const failed = result.failed ?? 0;
      toast.success(
        failed > 0
          ? `${result.saved} ажилтан хадгалагдлаа. ${failed} интеграци амжилтгүй.`
          : `${result.saved} ажилтан хадгалагдлаа`,
      );
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  return { sync };
}
