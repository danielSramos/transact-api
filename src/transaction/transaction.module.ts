import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  providers: [
    TransactionService,
    DatabaseService
  ],
  controllers: [TransactionController]
})
export class TransactionModule { }
