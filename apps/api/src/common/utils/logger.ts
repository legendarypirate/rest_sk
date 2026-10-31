import type { LogLevel } from '@nestjs/common';

export function getLogLevels(nodeEnv: string): LogLevel[] {
  if (nodeEnv === 'production') {
    return ['error', 'warn', 'log'];
  }

  if (nodeEnv === 'test') {
    return ['error', 'warn'];
  }

  return ['error', 'warn', 'log', 'debug', 'verbose'];
}
