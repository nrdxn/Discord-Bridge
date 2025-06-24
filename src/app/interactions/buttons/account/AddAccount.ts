import { Context } from 'telegraf';
import { ClientClass } from '@/libs/common/telegraf/src/ClientClass';
import { Button } from '@/libs/common/telegraf/src/helpers/interfaces/ButtonInterface';

export default new Button(
    { name: 'AddAccount' },
    async (client: ClientClass, ctx: Context) => {
        const text = `💬 *Пришли* токен Discord-аккаунта\n⏳ На ответ *15 секунд*`;
        const cache = client.listeners.cache;
        const userID = ctx.from!.id;

        cache.set(userID, 'Token');

        await ctx.editMessageText(text, {
            parse_mode: 'Markdown'
        });

        setTimeout(async () => {
            await ctx.deleteMessage().catch(() => {});
            cache.delete(userID);
        }, 15_000);
    }
);
