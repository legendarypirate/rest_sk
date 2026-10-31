import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import configuration from './config/configuration';
import { envValidationSchema } from './config/validation';
import { AppExceptionFilter } from './common/exceptions';
import { PrismaModule } from './prisma';
import { AuthModule } from './iam';
import { RealtimeModule } from './realtime';
import { AuditModule } from './audit';
import { UploadsModule } from './uploads/uploads.module';
import { MediaModule } from './media/media.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { EmployeesModule } from './employees/employees.module';
import { EmployeeMealModule } from './employee-meals/employee-meal.module';
import { RestaurantModule } from './restaurants/restaurant.module';
import { MenuModule } from './menu/menu.module';
import { PaymentModule } from './payments/payment.module';
import { KitchenModule } from './kitchens/kitchen.module';
import { KioskModule } from './kiosks/kiosk.module';
import { OrderModule } from './orders/order.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['src/config/config.env', '.env'],
      load: [configuration],
      validate: (env) => envValidationSchema.parse(env),
    }),
    PrismaModule,
    AuthModule,
    RealtimeModule,
    AuditModule,
    UploadsModule,
    MediaModule,
    IntegrationsModule,
    EmployeesModule,
    EmployeeMealModule,
    RestaurantModule,
    MenuModule,
    PaymentModule,
    KitchenModule,
    KioskModule,
    OrderModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AppExceptionFilter,
    },
  ],
})
export class AppModule {}
