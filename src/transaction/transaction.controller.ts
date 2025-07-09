import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionRequestDto } from './dtos/transaction.request.dto';

@Controller('transaction')
export class TransactionController {
    constructor(
        private readonly service: TransactionService
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async transaction(@Body() request: TransactionRequestDto) {
        try {
            return await this.service.createTransaction(request);
        } catch (error) {
            throw error;
        } 
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    findAllTransactions() {
        return this.service.findAllTransactions();
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    findTransactionById(@Param('id') id: string) {
        return this.service.findTransactionById(id);
    }

    @Delete()
    @HttpCode(HttpStatus.OK)
    deleteAll() {
        return this.service.deleteAll();
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    deleteTransactionById(@Param('id') id: string) {
        return this.service.deleteTransactionById(id);
    }
}
