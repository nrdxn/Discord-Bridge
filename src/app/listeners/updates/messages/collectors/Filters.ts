import { Context } from 'telegraf';
import { ClientClass } from '@/libs/common/telegraf/src/ClientClass';
import { Info } from '@/libs/notifications/src/enums/Info';

export default async (
    client: ClientClass,
    ctx: Context,
    type: 'stopWords' | 'keyWords'
) => {
    const words = ctx.text?.split('\n')!;
    const account = await client.services.database.accounts.findById(
        client.currentProvider
    );

    await ctx.deleteMessage().catch(() => {});

    if (!account) {
        return client.listeners.cache.delete(ctx.from!.id);
    }

    client.listeners.cache.delete(ctx.from!.id);

    account[type].push(...words);
    await client.services.database.accounts.save(account);

    const { text, markups } = await client.services.builder.accountFilters(
        client.currentProvider,
        type
    );

    await client.services.notifications.responseWithNotify(
        ctx,
        Info.FILTER_ADDED
    );
    await ctx.telegram.editMessageText(
        ctx.from!.id,
        client.currentMessage,
        undefined,
        text,
        {
            ...markups,
            parse_mode: 'HTML'
        }
    );
};
