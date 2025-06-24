import { globSync } from 'glob';
import { LogLevel } from '@/libs/common/logger/src/enums/LogLevel';
import { ClientClass } from '@/libs/common/telegraf/src/ClientClass';
import { Button } from '@/libs/common/telegraf/src/helpers/interfaces/ButtonInterface';

export class ButtonsHandler {
    public readonly cache: Map<string, Button> = new Map();

    constructor(private readonly client: ClientClass) {}

    public load() {
        try {
            const componentsPath = globSync(
                `./src/app/interactions/buttons/**/*.ts`
            );

            componentsPath.map((path) => {
                const component = require(`${process.cwd()}/${path}`)
                    .default as Button;

                if (component) {
                    this.cache.set(component.options.name, component);
                }
            });
        } catch (error: any) {
            this.client.services.logger.log(
                LogLevel.WARN,
                `Не удалось загрузить файлы компонентов\n${error.stack ?? error}`
            );
            return;
        }
    }
}
