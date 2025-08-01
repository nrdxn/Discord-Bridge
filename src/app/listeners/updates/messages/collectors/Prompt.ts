import { Context } from 'telegraf';
import { ClientClass } from '@/libs/common/telegraf/src/ClientClass';
import { Info } from '@/libs/notifications/src/enums/Info';

export default async (client: ClientClass, ctx: Context) => {
    const prompt = ctx.text!;
    const account = await client.services.database.accounts.findById(
        client.currentProvider
    );
    
    await ctx.deleteMessage();

    if (!account) {
        return client.listeners.cache.delete(ctx.from!.id);
    }

    client.listeners.cache.delete(ctx.from!.id);

    account.translate.prompt = prompt;
    account.markModified('translate');
    await client.services.database.accounts.save(account);

    const { text, markups } = await client.services.builder.account(
        client.currentProvider
    );

    await client.services.notifications.responseWithNotify(
        ctx,
        Info.PROMPT_CHANGED
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
