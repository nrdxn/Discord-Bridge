import { Context } from 'telegraf';
import { ClientClass } from '@/libs/common/telegraf/src/ClientClass';
import { ProviderUtils } from '@/libs/self/src/utils/ProviderUtils';
import { startProviders } from '@/libs/self/src/ProvidersInstance';
import { Warns } from '@/libs/notifications/src/enums/Warns';

export default async (client: ClientClass, ctx: Context) => {
    const token = ctx.text!;
    const validate = await ProviderUtils.validateToken(token);

    await ctx.deleteMessage();

    if (validate.message && validate.message === '401: Unauthorized') {
        return await client.services.notifications.responseWithNotify(
            ctx,
            Warns.INVALID_TOKEN
        );
    }

    const account = await client.services.database.accounts.findById(
        validate.id!
    );

    if (account && !account.banned) {
        client.listeners.cache.delete(ctx.from!.id);
        return await client.services.notifications.responseWithNotify(
            ctx,
            Warns.ACCOUNT_EXIST
        );
    } else if (account && account.banned) {
        account.banned = false;
        account.token = token;
        await client.services.database.accounts.save(account);
        
        await startProviders(client).then(async () => {
            const { text, markups } = await client.services.builder.account(
                validate.id!
            );
            await ctx.reply(text, {
                ...markups,
                parse_mode: 'HTML'
            });
        });
    } else {
        client.listeners.cache.delete(ctx.from!.id);
        await client.services.database.accounts.createInDb({
            token: token,
            id: validate.id!
        });

        await startProviders(client).then(async () => {
            const { text, markups } = await client.services.builder.account(
                validate.id!
            );
            await ctx.reply(text, {
                ...markups,
                parse_mode: 'HTML'
            });
        });
    }
};
