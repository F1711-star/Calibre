import { Module } from '@nestjs/common';
import { XapiController } from './xapi.controller.js';
import { XapiService } from './xapi.service.js';

@Module({
  controllers: [XapiController],
  providers: [XapiService],
  exports: [XapiService],
})
export class XapiModule {}
