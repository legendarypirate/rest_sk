import { Module } from '@nestjs/common';

import { UserRolesCommandService } from './user-roles.command.service';
import { UserRolesQueryService } from './user-roles.query.service';
import { UsersCommandService } from './users.command.service';
import { UsersController } from './users.controller';
import { UsersQueryService } from './users.query.service';

@Module({
  controllers: [UsersController],
  providers: [
    UsersQueryService,
    UsersCommandService,
    UserRolesQueryService,
    UserRolesCommandService,
  ],
  exports: [
    UsersQueryService,
    UsersCommandService,
    UserRolesQueryService,
    UserRolesCommandService,
  ],
})
export class UsersModule {}
