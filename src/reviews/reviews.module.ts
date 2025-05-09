import { Module } from '@nestjs/common';

import { ReviewsController } from './reviews.controller';
import { NatsModule } from 'src/nats/nats.module';

@Module({
  controllers: [ReviewsController],
  providers: [],
  imports: [NatsModule],
})
export class ReviewsModule {}
