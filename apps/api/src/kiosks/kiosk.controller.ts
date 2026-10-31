import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { authRequestContext } from '@/iam/auth-request.context';
import type { AuthenticatedUser } from '@/iam/auth.types';
import { Public, RequirePermissions } from '@/iam/decorators/auth.decorators';
import { CurrentUser } from '@/iam/decorators/current-user.decorator';
import { KioskInstallerService } from '@/kiosks/kiosk-installer.service';
import {
  ensureKioskInstallerDir,
  KIOSK_INSTALLER_FILENAME,
  KIOSK_INSTALLER_MAX_BYTES,
} from '@/kiosks/kiosk-installer.storage';

import {
  ListDeviceEventsQueryDto,
  ListKioskDevicesQueryDto,
  ListKioskSessionsQueryDto,
  UpsertDeviceEventDto,
  UpsertKioskDeviceDto,
  UpsertKioskSessionDto,
} from './dto/kiosk.dto';
import { KioskCommandService } from '@/kiosks/kiosk.command.service';
import { KioskQueryService } from '@/kiosks/kiosk.query.service';

@ApiTags('kiosk')
@ApiBearerAuth()
@Controller('kiosk')
export class KioskCatalogController {
  constructor(
    private readonly queries: KioskQueryService,
    private readonly installer: KioskInstallerService,
  ) {}

  @Get('catalog')
  @Public()
  catalog() {
    return this.queries.listCatalog();
  }

  @Get('installer')
  @Header('Cache-Control', 'no-store')
  downloadInstaller() {
    return this.installer.stream();
  }

  @Get('installer/meta')
  installerMeta() {
    return this.installer.meta();
  }

  @Post('installer')
  @RequirePermissions('platform:kiosk-devices:edit')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: KIOSK_INSTALLER_MAX_BYTES },
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          callback(null, ensureKioskInstallerDir());
        },
        filename: (_req, _file, callback) => {
          callback(null, KIOSK_INSTALLER_FILENAME);
        },
      }),
    }),
  )
  uploadInstaller(
    @UploadedFile()
    file: { originalname?: string; mimetype?: string; size?: number },
  ) {
    return this.installer.assertUploaded(file);
  }
}

@ApiTags('kiosk-devices')
@ApiBearerAuth()
@Controller('kiosk-devices')
export class KioskDevicesController {
  constructor(
    private readonly queries: KioskQueryService,
    private readonly commands: KioskCommandService,
  ) {}

  @Get()
  @RequirePermissions('platform:kiosk-devices:read')
  list(@Query() query: ListKioskDevicesQueryDto) {
    return this.queries.listDevices(query);
  }

  @Get(':id')
  @RequirePermissions('platform:kiosk-devices:read')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.queries.getDevice(id);
  }

  @Post()
  @RequirePermissions('platform:kiosk-devices:add')
  @ApiCreatedResponse()
  create(@Body() body: UpsertKioskDeviceDto, @CurrentUser() actor: AuthenticatedUser, @Req() request: Request) {
    return this.commands.createDevice(actor, body, authRequestContext(request));
  }

  @Put(':id')
  @RequirePermissions('platform:kiosk-devices:edit')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpsertKioskDeviceDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.updateDevice(actor, id, body, authRequestContext(request));
  }

  @Delete(':id')
  @RequirePermissions('platform:kiosk-devices:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: AuthenticatedUser, @Req() request: Request) {
    return this.commands.removeDevice(actor, id, authRequestContext(request));
  }
}

@ApiTags('kiosk-sessions')
@ApiBearerAuth()
@Controller('kiosk-sessions')
export class KioskSessionsController {
  constructor(
    private readonly queries: KioskQueryService,
    private readonly commands: KioskCommandService,
  ) {}

  @Get()
  @RequirePermissions('platform:kiosk-sessions:read')
  list(@Query() query: ListKioskSessionsQueryDto) {
    return this.queries.listSessions(query);
  }

  @Get(':id')
  @RequirePermissions('platform:kiosk-sessions:read')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.queries.getSession(id);
  }

  @Post()
  @RequirePermissions('platform:kiosk-sessions:add')
  @ApiCreatedResponse()
  create(@Body() body: UpsertKioskSessionDto, @CurrentUser() actor: AuthenticatedUser, @Req() request: Request) {
    return this.commands.createSession(actor, body, authRequestContext(request));
  }

  @Put(':id')
  @RequirePermissions('platform:kiosk-sessions:edit')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpsertKioskSessionDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.updateSession(actor, id, body, authRequestContext(request));
  }

  @Delete(':id')
  @RequirePermissions('platform:kiosk-sessions:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: AuthenticatedUser, @Req() request: Request) {
    return this.commands.removeSession(actor, id, authRequestContext(request));
  }
}

@ApiTags('device-events')
@ApiBearerAuth()
@Controller('device-events')
export class DeviceEventsController {
  constructor(
    private readonly queries: KioskQueryService,
    private readonly commands: KioskCommandService,
  ) {}

  @Get()
  @RequirePermissions('platform:device-events:read')
  list(@Query() query: ListDeviceEventsQueryDto) {
    return this.queries.listEvents(query);
  }

  @Get(':id')
  @RequirePermissions('platform:device-events:read')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.queries.getEvent(id);
  }

  @Post()
  @RequirePermissions('platform:device-events:add')
  @ApiCreatedResponse()
  create(@Body() body: UpsertDeviceEventDto, @CurrentUser() actor: AuthenticatedUser, @Req() request: Request) {
    return this.commands.createEvent(actor, body, authRequestContext(request));
  }

  @Put(':id')
  @RequirePermissions('platform:device-events:edit')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpsertDeviceEventDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.updateEvent(actor, id, body, authRequestContext(request));
  }

  @Delete(':id')
  @RequirePermissions('platform:device-events:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: AuthenticatedUser, @Req() request: Request) {
    return this.commands.removeEvent(actor, id, authRequestContext(request));
  }
}
