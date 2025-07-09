import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { EstatisticsController } from './estatistics.controller';
import { EstatisticsService } from './estatistics.service';

@Module({
    providers: [
        EstatisticsService, 
        DatabaseService
    ],
    controllers: [EstatisticsController]
})
export class EstatisticsModule { }
