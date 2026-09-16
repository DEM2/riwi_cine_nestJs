import { Module } from '@nestjs/common';

import { LocationsController } from './location.controller.js';
import { LocationsService } from './location.service.js';

@Module({
  controllers: [
    LocationsController,
  ],

  providers: [
    LocationsService,
  ],

  exports: [
    LocationsService,
  ],
})
export class LocationsModule {}