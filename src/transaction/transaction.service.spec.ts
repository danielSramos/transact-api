import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { TransactionService } from 'src/transaction/transaction.service';
import { DatabaseService } from 'src/database/database.service';
import { TransactionRequestDto } from 'src/transaction/dtos/transaction.request.dto';
import { randomUUID } from 'crypto';

describe('TransactionService (Unit)', () => {
  let service: TransactionService;
  let databaseService: DatabaseService;

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
      providers: [
        TransactionService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    databaseService = module.get<DatabaseService>(DatabaseService);

    jest.clearAllMocks();
  });

  describe('createTransaction', () => {
    it('deve criar uma transação com sucesso', async () => {
      const transactionId = randomUUID();
      const requestDate = new Date();
      const requestDto: TransactionRequestDto = {
        id: transactionId,
        value: 100.50,
        dateTime: requestDate,
      };
      const expectedDbResult = {
        id: transactionId,
        valor: requestDto.value,
        dataHora: requestDate,
      };

      (mockDatabaseService.transaction.create as jest.Mock).mockResolvedValue(expectedDbResult);

      const result = await service.createTransaction(requestDto);

      expect(result).toEqual(expectedDbResult);
      expect(mockDatabaseService.transaction.create).toHaveBeenCalledTimes(1);
      expect(mockDatabaseService.transaction.create).toHaveBeenCalledWith({
        data: {
          id: requestDto.id,
          valor: requestDto.value,
          dataHora: requestDto.dateTime,
        },
      });
    });

    it('deve lançar BadRequestException se id, value ou dateTime estiverem faltando', async () => {
      const invalidRequestDto: any = {
        value: 50.00,
      };

      await expect(service.createTransaction(invalidRequestDto)).rejects.toThrow(BadRequestException);
      await expect(service.createTransaction(invalidRequestDto)).rejects.toThrow('Os campos "id", "value" e "dateTime" são obrigatórios');
      expect(mockDatabaseService.transaction.create).not.toHaveBeenCalled();
    });

    it('deve lançar UnprocessableEntityException se o valor for negativo', async () => {
      const invalidRequestDto: TransactionRequestDto = {
        id: randomUUID(),
        value: -10.00,
        dateTime: new Date(),
      };

      await expect(service.createTransaction(invalidRequestDto)).rejects.toThrow(UnprocessableEntityException);
      await expect(service.createTransaction(invalidRequestDto)).rejects.toThrow('O valor da transação não pode ser negativo');
      expect(mockDatabaseService.transaction.create).not.toHaveBeenCalled();
    });

    it('deve lançar UnprocessableEntityException se a data for no futuro', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const invalidRequestDto: TransactionRequestDto = {
        id: randomUUID(),
        value: 100.00,
        dateTime: futureDate,
      };

      await expect(service.createTransaction(invalidRequestDto)).rejects.toThrow(UnprocessableEntityException);
      await expect(service.createTransaction(invalidRequestDto)).rejects.toThrow('A transação não pode ser realizada no futuro');
      expect(mockDatabaseService.transaction.create).not.toHaveBeenCalled();
    });
  });

  describe('findAllTransactions', () => {
    it('deve retornar uma lista vazia de transações', async () => {
      (mockDatabaseService.transaction.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.findAllTransactions();

      expect(result).toEqual([]);
      expect(mockDatabaseService.transaction.findMany).toHaveBeenCalledTimes(1);
    });

    it('deve retornar uma lista de transações existentes', async () => {
      const transactions = [
        { id: randomUUID(), valor: 50, dataHora: new Date() },
        { id: randomUUID(), valor: 75, dataHora: new Date() },
      ];
      (mockDatabaseService.transaction.findMany as jest.Mock).mockResolvedValue(transactions);

      const result = await service.findAllTransactions();

      expect(result).toEqual(transactions);
      expect(mockDatabaseService.transaction.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('findTransactionById', () => {
    it('deve retornar uma transação se encontrada', async () => {
      const transactionId = randomUUID();
      const transaction = { id: transactionId, valor: 200, dataHora: new Date() };
      (mockDatabaseService.transaction.findUnique as jest.Mock).mockResolvedValue(transaction);

      const result = await service.findTransactionById(transactionId);

      expect(result).toEqual(transaction);
      expect(mockDatabaseService.transaction.findUnique).toHaveBeenCalledTimes(1);
      expect(mockDatabaseService.transaction.findUnique).toHaveBeenCalledWith({ where: { id: transactionId } });
    });

    it('deve lançar NotFoundException se a transação não for encontrada', async () => {
      const nonExistentId = randomUUID();
      (mockDatabaseService.transaction.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findTransactionById(nonExistentId)).rejects.toThrow(new NotFoundException('Transação não encontrada'));
      expect(mockDatabaseService.transaction.findUnique).toHaveBeenCalledTimes(1);
      expect(mockDatabaseService.transaction.findUnique).toHaveBeenCalledWith({ where: { id: nonExistentId } });
    });
  });

  describe('deleteAll', () => {
    it('deve deletar todas as transações com sucesso', async () => {
      (mockDatabaseService.transaction.deleteMany as jest.Mock).mockResolvedValue({ count: 2 });

      await service.deleteAll();

      expect(mockDatabaseService.transaction.deleteMany).toHaveBeenCalledTimes(1);
      expect(mockDatabaseService.transaction.deleteMany).toHaveBeenCalledWith({});
    });
  });

  describe('deleteTransactionById', () => {
    it('deve deletar uma transação existente com sucesso', async () => {
      const transactionId = randomUUID();
      const existingTransaction = { id: transactionId, valor: 300, dataHora: new Date() };

      (mockDatabaseService.transaction.findUnique as jest.Mock).mockResolvedValue(existingTransaction);
      (mockDatabaseService.transaction.delete as jest.Mock).mockResolvedValue(existingTransaction);

      await service.deleteTransactionById(transactionId);

      expect(mockDatabaseService.transaction.findUnique).toHaveBeenCalledTimes(1);
      expect(mockDatabaseService.transaction.findUnique).toHaveBeenCalledWith({ where: { id: transactionId } });
      expect(mockDatabaseService.transaction.delete).toHaveBeenCalledTimes(1);
      expect(mockDatabaseService.transaction.delete).toHaveBeenCalledWith({ where: { id: transactionId } });
    });

    it('deve lançar NotFoundException se a transação a ser deletada não for encontrada', async () => {
      const nonExistentId = randomUUID();

      (mockDatabaseService.transaction.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteTransactionById(nonExistentId)).rejects.toThrow(new NotFoundException('Transação não encontrada'));
      expect(mockDatabaseService.transaction.findUnique).toHaveBeenCalledTimes(1);
      expect(mockDatabaseService.transaction.findUnique).toHaveBeenCalledWith({ where: { id: nonExistentId } });
      expect(mockDatabaseService.transaction.delete).not.toHaveBeenCalled();
    });
  });
});