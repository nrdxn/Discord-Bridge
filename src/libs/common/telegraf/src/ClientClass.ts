import OpenAI from 'openai';
import { Telegraf } from 'telegraf';
import { AccountProvider } from '@/libs/self/src/ProviderClass';
import { LoggerService } from '@/libs/common/logger/src/LoggerService';
import { ListenersHandler } from '@/libs/common/telegraf/src/helpers/ListenersHandler';
import { ButtonsHandler } from '@/libs/common/telegraf/src/helpers/ButtonsHandler';
import { CommandsHandler } from '@/libs/common/telegraf/src/helpers/CommandsHandler';
import { NotificationsService } from '@/libs/notifications/src/NotificationsService';
import { DatabaseService } from '@/libs/common/database/src/DatabaseService';
import { MessageBuilder } from '@/libs/common/telegraf/src/builders/MessageBuilder';
import { startProviders } from '@/libs/self/src/ProvidersInstance';

export class ClientClass extends Telegraf {
    public readonly listeners: ListenersHandler;
    public readonly buttons: ButtonsHandler;
    public readonly commands: CommandsHandler;
    public readonly services: {
        logger: LoggerService;
        notifications: NotificationsService;
        database: DatabaseService;
        gpt: OpenAI;
        builder: MessageBuilder;
    };

    public readonly providers: Map<string, AccountProvider> = new Map();
    public currentProvider: string;
    public currentMessage: number;

    constructor() {
        super(process.env['TELEGRAM_BOT_TOKEN']!);

        this.listeners = new ListenersHandler(this);
        this.buttons = new ButtonsHandler(this);
        this.commands = new CommandsHandler(this);
        this.services = {
            logger: new LoggerService(),
            notifications: new NotificationsService(),
            database: new DatabaseService(this),
            gpt: new OpenAI({
                apiKey: process.env['OPENAI_API_KEY']
            }),
            builder: new MessageBuilder(this)
        };
    }

    public async init() {
        this.services.logger.listen();
        this.listeners.load();
        this.buttons.load();
        this.commands.load();

        await this.services.database.connect();
        await startProviders(this);
        await this.launch();
    }
}
