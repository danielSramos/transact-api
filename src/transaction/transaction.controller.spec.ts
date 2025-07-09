import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, BadRequestException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { TransactionController } from 'src/transaction/transaction.controller';
import { TransactionService } from 'src/transaction/transaction.service';
import { DatabaseService } from 'src/database/database.service';
import { randomUUID } from 'crypto';
import { TransactionRequestDto } from 'src/transaction/dtos/transaction.request.dto';

describe('TransactionController (Integration - Controller/Service)', () => {
  let controller: TransactionController;
  let service: TransactionService;

  const mockDatabaseService = {
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    $on: jest.fn(),
    $transaction: jest.fn(),
    transaction: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        TransactionService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
    service = module.get<TransactionService>(TransactionService);
    jest.clearAllMocks();
  });

  describe('transaction (POST /transaction)', () => {
    it('deve criar uma nova transação com sucesso e retornar 201 Created', async () => {
      const transactionId = randomUUID();
      const requestDate = new Date();
      const requestDto: TransactionRequestDto = {
        id: transactionId,
        value: 150.75,
        dateTime: requestDate,
      };
      const createdTransaction = { id: transactionId, valor: requestDto.value, dataHora: requestDate };

      jest.spyOn(service, 'createTransaction').mockResolvedValue(createdTransaction as any);

      const result = await controller.transaction(requestDto);

      expect(result).toEqual(createdTransaction);
      expect(service.createTransaction).toHaveBeenCalledTimes(1);
      expect(service.createTransaction).toHaveBeenCalledWith(requestDto);
    });

    it('deve lançar BadRequestException ao criar transação com campos faltando', async () => {
      const requestDto: any = {
        value: 100.00,
        dateTime: new Date(),
      };

      jest.spyOn(service, 'createTransaction').mockImplementation(() => {
        throw new BadRequestException({ message: 'Os campos "id", "value" e "dateTime" são obrigatórios', error: 'Bad Request', statusCode: HttpStatus.UNPROCESSABLE_ENTITY });
      });

      await expect(controller.transaction(requestDto)).rejects.toThrow(new BadRequestException({ message: 'Os campos "id", "value" e "dateTime" são obrigatórios', error: 'Bad Request', statusCode: HttpStatus.UNPROCESSABLE_ENTITY }));
      expect(service.createTransaction).toHaveBeenCalledTimes(1);
      expect(service.createTransaction).toHaveBeenCalledWith(requestDto);
    });

    it('deve lançar UnprocessableEntityException ao criar transação com valor negativo', async () => {
      const requestDto: TransactionRequestDto = {
        id: randomUUID(),
        value: -50.00,
        dateTime: new Date(),
      };

      jest.spyOn(service, 'createTransaction').mockImplementation(() => {
        throw new UnprocessableEntityException({ message: 'O valor da transação não pode ser negativo', error: 'Unprocessable Entity', statusCode: HttpStatus.UNPROCESSABLE_ENTITY });
      });

      await expect(controller.transaction(requestDto)).rejects.toThrow(UnprocessableEntityException);
      await expect(controller.transaction(requestDto)).rejects.toThrow(new UnprocessableEntityException({ message: 'O valor da transação não pode ser negativo', error: 'Unprocessable Entity', statusCode: HttpStatus.UNPROCESSABLE_ENTITY }));
    });

    it('deve lançar UnprocessableEntityException ao criar transação com data futura', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const requestDto: TransactionRequestDto = {
        id: randomUUID(),
        value: 100.00,
        dateTime: futureDate,
      };

      jest.spyOn(service, 'createTransaction').mockImplementation(() => {
        throw new UnprocessableEntityException({ message: 'A transação não pode ser realizada no futuro', error: 'Unprocessable Entity', statusCode: HttpStatus.UNPROCESSABLE_ENTITY });
      });

      await expect(controller.transaction(requestDto)).rejects.toThrow(UnprocessableEntityException);
      await expect(controller.transaction(requestDto)).rejects.toThrow(new UnprocessableEntityException({ message: 'A transação não pode ser realizada no futuro', error: 'Unprocessable Entity', statusCode: HttpStatus.UNPROCESSABLE_ENTITY }));
    });
  });

  describe('findAllTransactions (GET /transaction)', () => {
    it('deve retornar uma lista vazia de transações com sucesso (200 OK)', async () => {
      jest.spyOn(service, 'findAllTransactions').mockResolvedValue([]);

      const result = await controller.findAllTransactions();

      expect(result).toEqual([]);
      expect(service.findAllTransactions).toHaveBeenCalledTimes(1);
    });

    it('deve retornar todas as transações cadastradas (200 OK)', async () => {
      const transactions = [
        { id: randomUUID(), valor: 100, dataHora: new Date() },
        { id: randomUUID(), valor: 200, dataHora: new Date() },
      ];
      jest.spyOn(service, 'findAllTransactions').mockResolvedValue(transactions as any);

      const result = await controller.findAllTransactions();

      expect(result).toEqual(transactions);
      expect(service.findAllTransactions).toHaveBeenCalledTimes(1);
    });
  });

  describe('findTransactionById (GET /transaction/:id)', () => {
    it('deve retornar uma transação específica por ID com sucesso (200 OK)', async () => {
      const transactionId = randomUUID();
      const transaction = { id: transactionId, valor: 300, dataHora: new Date() };
      jest.spyOn(service, 'findTransactionById').mockResolvedValue(transaction as any);

      const result = await controller.findTransactionById(transactionId);

      expect(result).toEqual(transaction);
      expect(service.findTransactionById).toHaveBeenCalledTimes(1);
      expect(service.findTransactionById).toHaveBeenCalledWith(transactionId);
    });

    it('deve lançar NotFoundException se a transação não for encontrada por ID', async () => {
      const nonExistentId = randomUUID();
      jest.spyOn(service, 'findTransactionById').mockRejectedValue(new NotFoundException('Transação não encontrada'));

      await expect(controller.findTransactionById(nonExistentId)).rejects.toThrow(new NotFoundException('Transação não encontrada'));
      expect(service.findTransactionById).toHaveBeenCalledTimes(1);
      expect(service.findTransactionById).toHaveBeenCalledWith(nonExistentId);
    });
  });

  describe('deleteAll (DELETE /transaction)', () => {
    it('deve deletar todas as transações com sucesso (200 OK)', async () => {
      jest.spyOn(service, 'deleteAll').mockResolvedValue(undefined);

      await controller.deleteAll();

      expect(service.deleteAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteTransactionById (DELETE /transaction/:id)', () => {
    it('deve deletar uma transação específica por ID com sucesso (200 OK)', async () => {
      const transactionId = randomUUID();
      jest.spyOn(service, 'deleteTransactionById').mockResolvedValue(undefined);

      await controller.deleteTransactionById(transactionId);

      expect(service.deleteTransactionById).toHaveBeenCalledTimes(1);
      expect(service.deleteTransactionById).toHaveBeenCalledWith(transactionId);
    });

    it('deve lançar NotFoundException se a transação a ser deletada não for encontrada por ID', async () => {
      const nonExistentId = randomUUID();
      jest.spyOn(service, 'deleteTransactionById').mockRejectedValue(new NotFoundException('Transação não encontrada'));

      await expect(controller.deleteTransactionById(nonExistentId)).rejects.toThrow(new NotFoundException('Transação não encontrada'));
      expect(service.deleteTransactionById).toHaveBeenCalledTimes(1);
      expect(service.deleteTransactionById).toHaveBeenCalledWith(nonExistentId);
    });
  });
});