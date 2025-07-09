import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { EstatisticsModule } from './estatistics/estatistics.module';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [TransactionModule,
    EstatisticsModule,
    DatabaseModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
