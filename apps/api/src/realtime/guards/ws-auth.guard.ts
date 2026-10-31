import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AppErrorCode } from '@packages/types';
import { WsException } from '@nestjs/websockets';

import type { AppSocket } from '../types/realtime.types';

@Injectable()
export class WsAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<AppSocket>();

    if (!client.data.user) {
      throw new WsException({ code: AppErrorCode.UNAUTHORIZED });
    }

    return true;
  }
}
