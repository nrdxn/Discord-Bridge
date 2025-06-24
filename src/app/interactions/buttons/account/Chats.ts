import { Context } from 'telegraf';
import { ClientClass } from '@/libs/common/telegraf/src/ClientClass';
import { Button } from '@/libs/common/telegraf/src/helpers/interfaces/ButtonInterface';

export default new Button(
    { name: 'Chats' },
    async (client: ClientClass, ctx: Context) => {
        const accountID = (ctx.callbackQuery as any).data.split('-')[1];

        const { text, markups } =
            await client.services.builder.accountChats(accountID);

        await ctx
            .editMessageText(text, {
                parse_mode: 'HTML',
                ...markups
            })
            .catch(() => {});
    }
);
