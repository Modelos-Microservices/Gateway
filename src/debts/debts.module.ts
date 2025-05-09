import { Module } from '@nestjs/common';
import { DebtsController } from './debts.controller';
import { NatsModule } from 'src/nats/nats.module';

@Module({
  controllers: [DebtsController],
  providers: [],
  imports: [NatsModule],
})
export class DebtsModule {}
