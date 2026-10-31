import { Module } from '@nestjs/common';

import { RolePermissionsCommandService } from './role-permissions.command.service';
import { RolePermissionsQueryService } from './role-permissions.query.service';
import { RolesCommandService } from './roles.command.service';
import { RolesController } from './roles.controller';
import { RolesQueryService } from './roles.query.service';

@Module({
  controllers: [RolesController],
  providers: [
    RolesQueryService,
    RolesCommandService,
    RolePermissionsQueryService,
    RolePermissionsCommandService,
  ],
  exports: [
    RolesQueryService,
    RolesCommandService,
    RolePermissionsQueryService,
    RolePermissionsCommandService,
  ],
})
export class RolesModule {}
