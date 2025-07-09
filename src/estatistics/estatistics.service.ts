import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class EstatisticsService {
    constructor(
        private readonly db: DatabaseService
    ) { }

    async calcTransactions() {
        const now = new Date();
        const sixtySecondsAgo = new Date(now.getTime() - 60000);

        const transactionsInLastMinute = await this.db.transaction.findMany({
            where: {
                dataHora: {
                    gte: sixtySecondsAgo,
                    lte: now,
                },
            },
            select: {
                valor: true,
            },
        });
        console.log(transactionsInLastMinute);
        if (transactionsInLastMinute.length === 0) {
            return { count: 0, sum: 0, avg: 0, min: 0, max: 0 };
        }

        const values = transactionsInLastMinute.map(t => t.valor);

        const count = values.length;
        const sum = values.reduce((acc, curr) => acc + curr, 0);
        const avg = sum / count;
        const min = Math.min(...values);
        const max = Math.max(...values);

        return {
            count: count,
            sum: parseFloat(sum.toFixed(2)),
            avg: parseFloat(avg.toFixed(3)),
            min: parseFloat(min.toFixed(2)),
            max: parseFloat(max.toFixed(2)),
        };
    }
}
