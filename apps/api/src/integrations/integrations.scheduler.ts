import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { IntegrationsCommandService } from './integrations.command.service';

@Injectable()
export class IntegrationsScheduler {
  private readonly logger = new Logger(IntegrationsScheduler.name);

  constructor(private readonly commands: IntegrationsCommandService) {}

  @Cron('0 0 * * *', { timeZone: 'Asia/Ulaanbaatar' })
  async syncEmployees() {
    try {
      const result = await this.commands.syncAll();
      this.logger.log(
        `Nightly employee sync saved ${result.saved} from ${result.integrations} integrations (${result.failed} failed)`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'sync failed';
      this.logger.error(`Nightly employee sync failed: ${message}`);
    }
  }
}