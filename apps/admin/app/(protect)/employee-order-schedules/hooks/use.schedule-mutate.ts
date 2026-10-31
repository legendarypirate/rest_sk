'use client';

import { toast } from '@packages/ui/components/sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/lib/api-error';
import {
  createEmployeeOrderSchedule,
  deleteEmployeeOrderSchedule,
  updateEmployeeOrderSchedule,
} from '@/services/employee-meals/employee-meals.service';
import type { UpsertEmployeeOrderScheduleDto } from '@/types/employee-meals/employee-meal.dto';

import { schedulesQueryKey } from './use.schedules';

export function useScheduleMutate() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: schedulesQueryKey });
  };
  const create = useMutation({
    mutationFn: (dto: UpsertEmployeeOrderScheduleDto) => createEmployeeOrderSchedule(dto),
    onSuccess: invalidate,
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  const update = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpsertEmployeeOrderScheduleDto }) =>
      updateEmployeeOrderSchedule(id, dto),
    onSuccess: invalidate,
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteEmployeeOrderSchedule(id),
    onSuccess: invalidate,
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  return { create, update, remove };
}
