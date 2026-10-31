'use client';

import { toast } from '@packages/ui/components/sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/lib/api-error';
import {
  createEmployeeMealType,
  deleteEmployeeMealType,
  updateEmployeeMealType,
} from '@/services/employee-meals/employee-meals.service';
import type { UpsertEmployeeMealTypeDto } from '@/types/employee-meals/employee-meal.dto';

import { mealTypesQueryKey } from './use.meal-types';

export function useMealTypeMutate() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: mealTypesQueryKey });
  };
  const create = useMutation({
    mutationFn: (dto: UpsertEmployeeMealTypeDto) => createEmployeeMealType(dto),
    onSuccess: invalidate,
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  const update = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpsertEmployeeMealTypeDto }) =>
      updateEmployeeMealType(id, dto),
    onSuccess: invalidate,
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteEmployeeMealType(id),
    onSuccess: invalidate,
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  return { create, update, remove };
}
