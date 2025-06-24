import { Context } from 'telegraf';
import { ClientClass } from '@/libs/common/telegraf/src/ClientClass';
import { Button } from '@/libs/common/telegraf/src/helpers/interfaces/ButtonInterface';
import { Info } from '@/libs/notifications/src/enums/Info';

export default new Button(
    { name: 'Back' },
    async (client: ClientClass, ctx: Context) => {
        const type = (ctx.callbackQuery as any).data.split('-')[1];
        const accountID = (ctx.callbackQuery as any).data.split('-')[2];

        switch (type) {
            case 'Main': {
                const { text, markups } = await client.services.builder.main();

                await ctx.editMessageText(text, {
                    ...markups
                });
                break;
            }
            case 'Account': {
                const { text, markups } = await client.services.builder.account(accountID);

                await ctx.editMessageText(text, {
                    ...markups,
                    parse_mode: 'HTML'
                });
                break;
            }
            case 'Delete': {
                await client.services.database.accounts.deleteById(accountID);
                await client.services.notifications.responseWithNotify(
                    ctx,
                    Info.ACCOUNT_DELETED
                );

                client.services.database.accounts.cache.delete(accountID);
                try {
                    client.providers.get(accountID)?.destroy();
                } catch (err: any) {}
                client.providers.get(accountID)?.destroy();
                client.providers.delete(accountID);

                const { text, markups } = await client.services.builder.main();
                await ctx.editMessageText(text, {
                    ...markups
                });
                break;
            }
        }
    }
);
