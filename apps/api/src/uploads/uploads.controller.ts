import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiNoContentResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '@/iam';
import type { AuthenticatedUser } from '@/iam/auth.types';

import { DiscardUploadDto } from './dto/uploads.dto';
import {
  UploadsCommandService,
  type UploadedFilePayload,
} from './uploads.command.service';

@ApiTags('uploads')
@ApiBearerAuth()
@Controller('uploads')
export class UploadsController {
  constructor(private readonly commands: UploadsCommandService) {}

  @Post('images')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 25 * 1024 * 1024 },
    }),
  )
  upload(
    @UploadedFile() file: UploadedFilePayload,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.commands.upload(actor, file);
  }

  @Post('images/discard')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  discard(
    @Body() body: DiscardUploadDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.commands.discard(actor, body.publicId);
  }
}
