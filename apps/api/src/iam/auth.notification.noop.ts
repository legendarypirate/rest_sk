import { Injectable } from '@nestjs/common';

import { AuthNotificationPort } from './auth.notification';

@Injectable()
export class NoopAuthNotification extends AuthNotificationPort {
  async sendPasswordReset(): Promise<void> {}

  async sendEmailVerification(): Promise<void> {}
}
