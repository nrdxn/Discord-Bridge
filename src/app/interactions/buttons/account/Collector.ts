import { Context } from 'telegraf';
import { ClientClass } from '@/libs/common/telegraf/src/ClientClass';
import { Button } from '@/libs/common/telegraf/src/helpers/interfaces/ButtonInterface';

export default new Button(
    { name: 'Collector' },
    async (client: ClientClass, ctx: Context) => {
        const type = (ctx.callbackQuery as any).data.split('-')[1];
        const accountID = (ctx.callbackQuery as any).data.split('-')[2];
        const account =
            await client.services.database.accounts.findById(accountID);
        const cache = client.listeners.cache;
        const userID = ctx.from!.id;

        if (!account) return await ctx.deleteMessage();

        let text = '';
        let waitTime = 15_000;

        switch (type) {
            case 'Name':
                text = `💬 *Пришли* новое название\n⏳ На ответ *15 секунд*`;
                break;
            case 'Prompt':
                text = `💬 *Пришли* новый промпт\n⏳ На ответ *1 минута*`;
                waitTime = 60_000;
                break;
            case 'TelegramChannel':
                text = `💬 *Пришли* @username канала или *перешли* сообщение из него\n⏳ На ответ *20 секунд*`;
                waitTime = 20_000;
                break;
            case 'Guild':
                text = `💬 *Пришли* ссылку приглашения на сервер\n⏳ На ответ *15 секунд*`;
                break;
            case 'DiscordChannel':
                text = `💬 *Пришли* ссылки на чат каждую с новой строки\n⏳ На ответ *15 секунд*`;
                break;
            case 'stopWords':
            case 'keyWords':
                text = `💬 *Пришли* слова каждое с новой строки\n⏳ На ответ *20 секунд*`;
                waitTime = 20_000;
                break;
        }

        cache.set(userID, type);
        client.currentProvider = accountID;
        client.currentMessage = ctx.callbackQuery?.message?.message_id!;

        const message = await ctx.reply(text, { parse_mode: 'Markdown' });

        setTimeout(async () => {
            await ctx.telegram
                .deleteMessage(ctx.from!.id, message.message_id)
                .catch(() => {});
            cache.delete(userID);
        }, waitTime);
    }
);
