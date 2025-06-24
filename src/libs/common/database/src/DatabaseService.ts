import * as mongoose from 'mongoose';
import { LogLevel } from '@/libs/common/logger/src/enums/LogLevel';
import { ClientClass } from '@/libs/common/telegraf/src/ClientClass';
import { AccountDatabaseMethods } from '@/libs/parser/src/database/methods/account/AccountDatabaseMethods';
import { PanelDatabaseMethods } from '@/libs/parser/src/database/methods/panel/PanelDatabaseMethods';

export class DatabaseService {
    public readonly accounts: AccountDatabaseMethods;
    public readonly panels: PanelDatabaseMethods;

    constructor(private readonly client: ClientClass) {
        this.accounts = new AccountDatabaseMethods(this.client);
        this.panels = new PanelDatabaseMethods(this.client);
    }

    public async connect() {
        try {
            await mongoose
                .connect(process.env['MONGODB_URL']!, {
                    serverSelectionTimeoutMS: 20000,
                    socketTimeoutMS: 45000,
                    connectTimeoutMS: 30000
                })
                .then(() =>
                    this.client.services.logger.log(
                        LogLevel.INFO,
                        'Успешное подключение к базе данных'
                    )
                );

            await Promise.all([this.accounts.init(), this.panels.init()]).then(
                () =>
                    this.client.services.logger.log(
                        LogLevel.INFO,
                        'Успешная инициализация кеша базы данных'
                    )
            );
        } catch (error: any) {
            this.client.services.logger.log(
                LogLevel.WARN,
                `Ошибка подключения к базе данных:\n${error.stack ?? error}`
            );
            return;
        }
    }
}
