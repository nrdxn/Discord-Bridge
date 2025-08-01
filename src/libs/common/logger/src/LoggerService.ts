import { LogLevel } from '@/libs/common/logger/src/enums/LogLevel';

export class LoggerService {
    public listen() {
        process
            .on('uncaughtException', (err: Error) => {
                this.log(LogLevel.ERROR, err);
                process.exit(1);
            })
            .on('unhandledRejection', (err: Error) => {
                this.log(LogLevel.ERROR, err);
                process.exit(1);
            });

        this.log(LogLevel.INFO, 'Логгер успешно запущен');
        this.log(LogLevel.INFO, 'Клиент зашел в сеть');
    }

    public log(level: LogLevel, message: any) {
        console.log(this.formatLog(level, message) + '\n');
    }

    private formatLog(level: LogLevel, message: string) {
        const timestamp =
            new Date().toLocaleDateString() +
            ' | ' +
            new Date().toLocaleTimeString();
        return `[${level}] [\x1b[97m${timestamp}\x1b[0m] ${message}`;
    }
}
