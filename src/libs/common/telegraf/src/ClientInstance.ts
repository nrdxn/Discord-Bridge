import { ClientClass } from '@/libs/common/telegraf/src/ClientClass';
import { startProviders } from '@/libs/self/src/ProvidersInstance';

const client = new ClientClass();

export const start = async () => {
    client.services.logger.listen();
    client.listeners.load();
    client.buttons.load();
    client.commands.load();

    await client.services.database.connect();
    await startProviders(client);
    await client.launch();
};
