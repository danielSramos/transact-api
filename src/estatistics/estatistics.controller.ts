import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { EstatisticsService } from './estatistics.service';

@Controller('estatistics')
export class EstatisticsController {
    constructor(
        private readonly service: EstatisticsService
    ) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    calcTransactions() {
        return this.service.calcTransactions();
    }
}
