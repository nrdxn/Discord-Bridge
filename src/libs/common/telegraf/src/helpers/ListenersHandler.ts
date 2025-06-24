import { globSync } from 'glob';
import { UpdateType } from 'node_modules/telegraf/typings/telegram-types';
import { ClientClass } from '@/libs/common/telegraf/src/ClientClass';
import { LogLevel } from '@/libs/common/logger/src/enums/LogLevel';
import { Listener } from '@/libs/common/telegraf/src/helpers/interfaces/ListenerInterface';
import { Collector } from '@/libs/common/telegraf/src/helpers/types/Collector';

export class ListenersHandler {
    public readonly cache: Map<number, Collector> = new Map();

    constructor(private readonly client: ClientClass) {}

    public load() {
        try {
            const listenersPath = globSync(`./src/app/listeners/**/*.ts`);

            Promise.all(
                listenersPath.map(async (path) => {
                    const listener = (await import(path)).default as Listener;
                    const splitPath = path.split(
                        process.platform === 'linux' ? '/' : '\\'
                    );
                    const folderName = splitPath[splitPath.length - 3];

                    switch (folderName) {
                        case 'updates':
                            this.client.on(
                                listener.options.name as UpdateType,
                                listener.execute.bind(null, this.client)
                            );
                            break;
                    }
                })
            ).then(() =>
                this.client.services.logger.log(
                    LogLevel.INFO,
                    'Успешная загрузка хендлеров'
                )
            );
        } catch (error: any) {
            this.client.services.logger.log(
                LogLevel.WARN,
                `Не удалось загрузить файлы слушателей\n${error.stack ?? error}`
            );
            return;
        }
    }
}
