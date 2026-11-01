import { Injectable } from '@nestjs/common';
import { AuditAction } from '@generated/prisma/client';

import { AuditCommandService } from '@/audit';
import { NotFoundAppException } from '@/common/exceptions';
import type { AuthRequestContext } from '@/iam/auth-request.context';
import type { AuthenticatedUser } from '@/iam/auth.types';
import { PrismaService } from '@/prisma/prisma.service';

import type { UpdateEmployeeStatusDto } from './dto/employees.dto';
import { EmployeesQueryService } from './employees.query.service';

@Injectable()
export class EmployeesCommandService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queries: EmployeesQueryService,
    private readonly audit: AuditCommandService,
  ) {}

  async updateStatus(
    actor: AuthenticatedUser,
    id: string,
    input: UpdateEmployeeStatusDto,
    context: AuthRequestContext,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.employee.findFirst({ where: { id, deletedAt: null } });
      if (!existing) throw new NotFoundAppException();
      if (existing.status === input.status) {
        return;
      }

      await tx.employee.update({
        where: { id },
        data: { status: input.status, rowVersion: { increment: 1 } },
      });
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.UPDATE,
        resourceType: 'employee',
        resourceId: id,
        before: { status: existing.status },
        after: { status: input.status },
      });
    });

    return this.queries.getById(id);
  }
}
