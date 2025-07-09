import { Test, TestingModule } from '@nestjs/testing';
import { EstatisticsController } from 'src/estatistics/estatistics.controller';
import { EstatisticsService } from 'src/estatistics/estatistics.service';
import { DatabaseService } from 'src/database/database.service';

describe('EstatisticsController (Integration - Controller/Service)', () => {
  let controller: EstatisticsController;
  let service: EstatisticsService;

  const mockDatabaseService = {
    transaction: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstatisticsController],
      providers: [
        EstatisticsService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    controller = module.get<EstatisticsController>(EstatisticsController);
    service = module.get<EstatisticsService>(EstatisticsService);
    jest.clearAllMocks();
  });

  describe('calcTransactions (GET /estatistics)', () => {
    it('deve chamar calcTransactions do serviço e retornar as estatísticas', async () => {
      const mockStats = { count: 5, sum: 100.00, avg: 20.000, min: 10.00, max: 30.00 };

      jest.spyOn(service, 'calcTransactions').mockResolvedValue(mockStats);

      const result = await controller.calcTransactions();

      expect(result).toEqual(mockStats);
      expect(service.calcTransactions).toHaveBeenCalledTimes(1);
    });

    it('deve retornar as estatísticas padrão quando o serviço retorna valores zero', async () => {
      const mockZeroStats = { count: 0, sum: 0, avg: 0, min: 0, max: 0 };
      jest.spyOn(service, 'calcTransactions').mockResolvedValue(mockZeroStats);

      const result = await controller.calcTransactions();

      expect(result).toEqual(mockZeroStats);
      expect(service.calcTransactions).toHaveBeenCalledTimes(1);
    });

    it('deve lidar com erros do serviço (ex: lançar exceção)', async () => {
      const errorMessage = 'Erro ao calcular estatísticas';
      jest.spyOn(service, 'calcTransactions').mockRejectedValue(new Error(errorMessage));

      await expect(controller.calcTransactions()).rejects.toThrow(errorMessage);
      expect(service.calcTransactions).toHaveBeenCalledTimes(1);
    });
  });
});