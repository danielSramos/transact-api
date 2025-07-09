import { Test, TestingModule } from '@nestjs/testing';
import { EstatisticsService } from 'src/estatistics/estatistics.service';
import { DatabaseService } from 'src/database/database.service';

describe('EstatisticsService (Unit)', () => {
  let service: EstatisticsService;
  let databaseService: DatabaseService;

  const mockDatabaseService = {
    transaction: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstatisticsService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<EstatisticsService>(EstatisticsService);
    databaseService = module.get<DatabaseService>(DatabaseService);

    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('calcTransactions', () => {
    it('deve retornar 0 para count, sum, avg, min, max quando não há transações no último minuto', async () => {
      (mockDatabaseService.transaction.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.calcTransactions();

      expect(result).toEqual({ count: 0, sum: 0, avg: 0, min: 0, max: 0 });
      expect(mockDatabaseService.transaction.findMany).toHaveBeenCalledTimes(1);
      const now = new Date();
      const sixtySecondsAgo = new Date(now.getTime() - 60000);
      expect(mockDatabaseService.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            dataHora: {
              gte: expect.any(Date),
              lte: expect.any(Date),
            },
          },
        })
      );
    });

    it('deve calcular estatísticas corretamente para transações no último minuto', async () => {
      const now = new Date('2025-07-08T12:00:00.000Z');
      jest.setSystemTime(now);

      const sixtySecondsAgo = new Date(now.getTime() - 60000);

      const mockTransactions = [
        { valor: 10.50 },
        { valor: 20.00 },
        { valor: 5.25 },
        { valor: 15.00 },
      ];
      (mockDatabaseService.transaction.findMany as jest.Mock).mockResolvedValue(mockTransactions);

      const result = await service.calcTransactions();

      expect(result.count).toBe(4);
      expect(result.sum).toBe(50.75);
      expect(result.avg).toBeCloseTo(12.688);
      expect(result.min).toBe(5.25);
      expect(result.max).toBe(20.00);

      expect(mockDatabaseService.transaction.findMany).toHaveBeenCalledTimes(1);
      expect(mockDatabaseService.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            dataHora: {
              gte: sixtySecondsAgo,
              lte: now,
            },
          },
          select: {
            valor: true,
          },
        })
      );
    });

    it('deve retornar as estatísticas corretas para uma única transação', async () => {
      const now = new Date('2025-07-08T12:00:00.000Z');
      jest.setSystemTime(now);

      const mockTransactions = [{ valor: 42.00 }];
      (mockDatabaseService.transaction.findMany as jest.Mock).mockResolvedValue(mockTransactions);

      const result = await service.calcTransactions();

      expect(result.count).toBe(1);
      expect(result.sum).toBe(42.00);
      expect(result.avg).toBeCloseTo(42.000);
      expect(result.min).toBe(42.00);
      expect(result.max).toBe(42.00);

      expect(mockDatabaseService.transaction.findMany).toHaveBeenCalledTimes(1);
    });

    it('deve arredondar valores de sum, min e max para duas casas decimais e avg para três', async () => {
      const now = new Date('2025-07-08T12:00:00.000Z');
      jest.setSystemTime(now);

      const mockTransactions = [
        { valor: 1.123 },
        { valor: 2.234 },
        { valor: 3.345 }
      ];
      (mockDatabaseService.transaction.findMany as jest.Mock).mockResolvedValue(mockTransactions);

      const result = await service.calcTransactions();

      expect(result.sum).toBe(6.70);
      expect(result.avg).toBeCloseTo(2.234);
      expect(result.min).toBe(1.12);
      expect(result.max).toBe(3.35);
    });
  });
});