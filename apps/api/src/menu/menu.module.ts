import { Module } from '@nestjs/common';

import {
  MenuCategoryImagesController,
  MenuItemImagesController,
  MenuItemsController,
} from './items/menu-item.controller';
import { MenuItemCommandService } from './items/menu-item.command.service';
import { MenuItemQueryService } from './items/menu-item.query.service';
import { MenuCommandService } from './menu.command.service';
import { MenuCategoriesController } from './menu.controller';
import { MenuQueryService } from './menu.query.service';

@Module({
  controllers: [
    MenuCategoriesController,
    MenuItemsController,
    MenuCategoryImagesController,
    MenuItemImagesController,
  ],
  providers: [MenuQueryService, MenuCommandService, MenuItemQueryService, MenuItemCommandService],
})
export class MenuModule {}
