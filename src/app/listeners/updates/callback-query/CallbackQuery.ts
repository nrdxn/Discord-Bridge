import { Context } from 'telegraf';
import { ClientClass } from '@/libs/common/telegraf/src/ClientClass';
import { Listener } from '@/libs/common/telegraf/src/helpers/interfaces/ListenerInterface';
import { Button } from '@/libs/common/telegraf/src/helpers/interfaces/ButtonInterface';

export default new Listener(
    { name: 'callback_query' },
    async (client: ClientClass, ctx: Context) => {
        const data = (ctx.callbackQuery as any).data;

        const button: Button =
            client.buttons.cache.get(data)! ||
            client.buttons.cache.get(data.split('-')[0])!;

        if (!button) return;

        await button.execute(client, ctx);
    }
);
