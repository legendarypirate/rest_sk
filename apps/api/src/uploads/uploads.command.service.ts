import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import {
  holdsAllPermissions,
  PLATFORM_SUPER_ADMIN_SLUG,
} from '@packages/types';

import {
  BadGatewayAppException,
  BadRequestAppException,
  ForbiddenAppException,
} from '@/common/exceptions';
import type { AuthenticatedUser } from '@/iam/auth.types';

const UPLOAD_PERMISSIONS = [
  'platform:blocks:add',
  'platform:blocks:edit',
] as const;

const RESOURCE_TYPES = ['image', 'video', 'raw'] as const;

type CloudinaryResourceType = (typeof RESOURCE_TYPES)[number];

export type UploadedFilePayload = {
  buffer: Buffer;
  mimetype: string;
};

@Injectable()
export class UploadsCommandService {
  private readonly folder: string;

  constructor(config: ConfigService) {
    const cloudName = config.get<string>('cloudinary.cloudName') ?? '';
    const apiKey = config.get<string>('cloudinary.apiKey') ?? '';
    const apiSecret = config.get<string>('cloudinary.apiSecret') ?? '';
    this.folder = config.get<string>('cloudinary.folder') ?? 'food_order';

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  async upload(actor: AuthenticatedUser, file?: UploadedFilePayload) {
    this.assertCanUpload(actor);

    if (!file?.buffer?.length) {
      throw new BadRequestAppException();
    }

    const cloudName = cloudinary.config().cloud_name;
    if (!cloudName) {
      throw new BadGatewayAppException();
    }

    const resourceType = resourceTypeFromMime(file.mimetype);

    try {
      const uploaded = await uploadBuffer(file, {
        folder: `${this.folder}/blocks`,
        resourceType,
      });

      return {
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
      };
    } catch {
      throw new BadGatewayAppException();
    }
  }

  async discard(actor: AuthenticatedUser, publicId: string) {
    this.assertCanUpload(actor);

    const id = publicId.trim();
    if (!id) {
      throw new BadRequestAppException();
    }

    for (const resourceType of RESOURCE_TYPES) {
      const result = await cloudinary.uploader.destroy(id, {
        resource_type: resourceType,
      });

      if (result.result === 'ok' || result.result === 'not found') {
        return;
      }
    }
  }

  private assertCanUpload(actor: AuthenticatedUser) {
    if (
      actor.roles.includes(PLATFORM_SUPER_ADMIN_SLUG) ||
      holdsAllPermissions(actor.permissions) ||
      UPLOAD_PERMISSIONS.some((permission) =>
        actor.permissions.includes(permission),
      )
    ) {
      return;
    }

    throw new ForbiddenAppException();
  }
}

function resourceTypeFromMime(mime: string): CloudinaryResourceType {
  if (mime.startsWith('image/')) {
    return 'image';
  }
  if (mime.startsWith('video/') || mime.startsWith('audio/')) {
    return 'video';
  }
  return 'raw';
}

function uploadBuffer(
  file: UploadedFilePayload,
  options: { folder: string; resourceType: CloudinaryResourceType },
) {
  return new Promise<{ secure_url: string; public_id: string }>(
    (resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder,
          resource_type: options.resourceType,
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error || !result?.secure_url || !result.public_id) {
            reject(error ?? new Error('upload failed'));
            return;
          }

          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        },
      );

      stream.end(file.buffer);
    },
  );
}
