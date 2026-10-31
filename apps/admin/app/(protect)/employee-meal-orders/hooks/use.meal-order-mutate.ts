'use client';

import { toast } from '@packages/ui/components/sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/lib/api-error';
import {
  createEmployeeMealOrder,
  deleteEmployeeMealOrder,
  updateEmployeeMealOrder,
} from '@/services/employee-meals/employee-meals.service';
import type {
  CreateEmployeeMealOrderDto,
  UpdateEmployeeMealOrderDto,
} from '@/types/employee-meals/employee-meal.dto';

import { mealDaysQueryKey } from '../../employee-meal-days/hooks/use.meal-days';
import { mealOrdersQueryKey } from './use.meal-orders';

export function useMealOrderMutate() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: mealOrdersQueryKey });
    void queryClient.invalidateQueries({ queryKey: mealDaysQueryKey });
  };
  const create = useMutation({
    mutationFn: (dto: CreateEmployeeMealOrderDto) => createEmployeeMealOrder(dto),
    onSuccess: invalidate,
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  const update = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateEmployeeMealOrderDto }) =>
      updateEmployeeMealOrder(id, dto),
    onSuccess: () => {
      toast.success('Төлөв шинэчлэгдлээ');
      invalidate();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteEmployeeMealOrder(id),
    onSuccess: invalidate,
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  return { create, update, remove };
}
