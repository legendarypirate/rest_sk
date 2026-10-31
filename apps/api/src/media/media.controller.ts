import {
  Body,
  Controller,
  Delete,
  Get,
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
import { RequirePermissions } from '@/iam/decorators/auth.decorators';
import { CurrentUser } from '@/iam/decorators/current-user.decorator';

import { ListMediaQueryDto, UpdateMediaDto, UploadMediaFieldsDto } from './dto/media.dto';
import { MediaCommandService } from './media.command.service';
import { MediaQueryService } from './media.query.service';
import type { MediaUploadFile } from './media.storage';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

@ApiTags('media')
@ApiBearerAuth()
@Controller('media')
export class MediaController {
  constructor(
    private readonly queries: MediaQueryService,
    private readonly commands: MediaCommandService,
  ) {}

  @Get()
  @RequirePermissions('platform:media:read')
  list(@Query() query: ListMediaQueryDto) {
    return this.queries.list(query);
  }

  @Get(':id')
  @RequirePermissions('platform:media:read')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.queries.getById(id);
  }

  @Post()
  @RequirePermissions('platform:media:add')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
        altText: { type: 'string' },
      },
    },
  })
  @ApiCreatedResponse()
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_IMAGE_BYTES } }),
  )
  upload(
    @UploadedFile() file: MediaUploadFile,
    @Body() body: UploadMediaFieldsDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.upload(
      actor,
      file,
      body.altText,
      authRequestContext(request),
    );
  }

  @Post(':id/discard')
  @RequirePermissions('platform:media:add')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  discard(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.commands.discardDraft(actor, id);
  }

  @Put(':id')
  @RequirePermissions('platform:media:edit')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateMediaDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.update(actor, id, body, authRequestContext(request));
  }

  @Delete(':id')
  @RequirePermissions('platform:media:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.remove(actor, id, authRequestContext(request));
  }
}
