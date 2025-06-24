import { Context } from 'telegraf';
import { ClientClass } from '@/libs/common/telegraf/src/ClientClass';
import { Button } from '@/libs/common/telegraf/src/helpers/interfaces/ButtonInterface';
import { Info } from '@/libs/notifications/src/enums/Info';

export default new Button(
    { name: 'DeleteFilter' },
    async (client: ClientClass, ctx: Context) => {
        const type = (ctx.callbackQuery as any).data.split('-')[1];
        const filterIndex = (ctx.callbackQuery as any).data.split('-')[2];
        const accountID = (ctx.callbackQuery as any).data.split('-')[3];
        const page = Number((ctx.callbackQuery as any).data.split('-')[4]);

        const account =
            await client.services.database.accounts.findById(accountID);

        if (!account) return await ctx.deleteMessage();

        account[type].splice(filterIndex, 1);
        await client.services.database.accounts.save(account);

        const { text, markups } =
            await client.services.builder.accountFilters(accountID, type, page - 1);

        await ctx.editMessageText(text, {
            parse_mode: 'HTML',
            ...markups
        });

        await client.services.notifications.responseWithNotify(
            ctx,
            Info.FILTER_REMOVED
        );
    }
);
