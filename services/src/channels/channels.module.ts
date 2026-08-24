import { Module } from '@nestjs/common';
import { ChannelsController, GlobalChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ChannelsController, GlobalChannelsController],
  providers: [ChannelsService],
  exports: [ChannelsService],
})
export class ChannelsModule {}
