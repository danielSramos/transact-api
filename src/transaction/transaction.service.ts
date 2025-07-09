import { BadRequestException, HttpCode, HttpStatus, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { TransactionRequestDto } from './dtos/transaction.request.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class TransactionService {
    constructor(
        private readonly db: DatabaseService
    ) { }

    async createTransaction(request: TransactionRequestDto) {
        const transactionDate = new Date(request.dateTime);
        const now = new Date();

        if (!request.value || !request.dateTime || !request.id) {
            throw new BadRequestException({ message: 'Os campos "id", "value" e "dateTime" são obrigatórios', error: 'Bad Request', statusCode: HttpStatus.UNPROCESSABLE_ENTITY });
        }

        if (request.value <= 0) {
            throw new UnprocessableEntityException({ message: 'O valor da transação não pode ser negativo', error: 'Unprocessable Entity', statusCode: HttpStatus.UNPROCESSABLE_ENTITY });
        }

        if (transactionDate > now) {
            throw new UnprocessableEntityException({ message: 'A transação não pode ser realizada no futuro', error: 'Unprocessable Entity', statusCode: HttpStatus.UNPROCESSABLE_ENTITY });
        }

        const newTransaction = await this.db.transaction.create({
            data: {
                id: request.id,
                valor: request.value,
                dataHora: request.dateTime
            }
        });

        return newTransaction;
    }

    async findAllTransactions() {
        const transactions = await this.db.transaction.findMany();
        return transactions;
    }

    async findTransactionById(id: string) {
        const transaction = await this.db.transaction.findUnique({
            where: {
                id: id
            }
        });

        if (!transaction) {
            throw new NotFoundException({ message: 'Transação não encontrada', error: 'Not Found', statusCode: HttpStatus.NOT_FOUND });
        }

        return transaction;
    }

    async deleteAll() {
        await this.db.transaction.deleteMany({});
    }

    async deleteTransactionById(id: string) {
        const existTransaction = await this.findTransactionById(id);

        if (!existTransaction) {
            throw new NotFoundException({ message: 'Transação não encontrada', error: 'Not Found', statusCode: HttpStatus.NOT_FOUND });
        }

        await this.db.transaction.delete({
            where: {
                id: id
            }
        });
    }
}
