import { Context } from 'telegraf';
import { ClientClass } from '@/libs/common/telegraf/src/ClientClass';
import { Button } from '@/libs/common/telegraf/src/helpers/interfaces/ButtonInterface';
import { Info } from '@/libs/notifications/src/enums/Info';

export default new Button(
    { name: 'DeleteChat' },
    async (client: ClientClass, ctx: Context) => {
        const chatID = (ctx.callbackQuery as any).data.split('-')[1];
        const accountID = (ctx.callbackQuery as any).data.split('-')[2];
        const page = Number((ctx.callbackQuery as any).data.split('-')[3]);
        const account =
            await client.services.database.accounts.findById(accountID);

        if (!account) return await ctx.deleteMessage();

        account.discord_channels = account.discord_channels.filter(
            (channel) => channel.id !== chatID
        );
        await client.services.database.accounts.save(account);

        const { text, markups } =
            await client.services.builder.accountChats(accountID, page - 1);

        await ctx.editMessageText(text, {
            parse_mode: 'HTML',
            ...markups
        });

        await client.services.notifications.responseWithNotify(
            ctx,
            Info.DISCORD_CHANNEL_REMOVED
        );
    }
);
