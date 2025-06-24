import { globSync } from 'glob';
import { LogLevel } from '@/libs/common/logger/src/enums/LogLevel';
import { ClientClass } from '@/libs/common/telegraf/src/ClientClass';
import { Command } from '@/libs/common/telegraf/src/helpers/interfaces/CommandInterface';

export class CommandsHandler {
    public readonly cache: Map<string, Command> = new Map();

    constructor(private readonly client: ClientClass) {}

    public load() {
        try {
            const commandsPath = globSync(
                `./src/app/interactions/commands/**/*.ts`
            );

            commandsPath.map((path) => {
                const command = require(`${process.cwd()}/${path}`)
                    .default as Command;

                if (command) {
                    this.cache.set(command.options.name, command);
                }
            });
        } catch (error: any) {
            this.client.services.logger.log(
                LogLevel.WARN,
                `Не удалось загрузить файлы комманд\n${error.stack ?? error}`
            );
            return;
        }
    }
}
