'use client';

import { toast } from '@packages/ui/components/sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/lib/api-error';
import {
  createEmployeeMealDay,
  deleteEmployeeMealDay,
  updateEmployeeMealDay,
} from '@/services/employee-meals/employee-meals.service';
import type { UpsertEmployeeMealDayDto } from '@/types/employee-meals/employee-meal.dto';

import { mealDaysQueryKey } from './use.meal-days';

export function useMealDayMutate() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: mealDaysQueryKey });
  };
  const create = useMutation({
    mutationFn: (dto: UpsertEmployeeMealDayDto) => createEmployeeMealDay(dto),
    onSuccess: invalidate,
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  const update = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpsertEmployeeMealDayDto }) =>
      updateEmployeeMealDay(id, dto),
    onSuccess: invalidate,
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteEmployeeMealDay(id),
    onSuccess: invalidate,
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  return { create, update, remove };
}
