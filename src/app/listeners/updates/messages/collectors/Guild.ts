import { Context } from 'telegraf';
import { ClientClass } from '@/libs/common/telegraf/src/ClientClass';
import { Info } from '@/libs/notifications/src/enums/Info';

export default async (client: ClientClass, ctx: Context) => {
    const invites = ctx.text?.split('\n')!;
    const account = client.providers.get(client.currentProvider);
    
    await ctx.deleteMessage();

    if (!account) {
        return client.listeners.cache.delete(ctx.from!.id);
    }

    client.listeners.cache.delete(ctx.from!.id);

    await client.services.notifications.responseWithNotify(
        ctx,
        Info.GUILD_WAITING
    );

    const message = await ctx.reply(`⏳ Прогресс захода: 0/${invites.length}`);

    for (let i = 0; i < invites.length; i++) {
        try {
            const randomDelayMs = Math.floor((Math.random() * 100) + 250) * 1000;

            await account.acceptInvite(invites[i])

            await ctx.telegram.editMessageText(
                ctx.from!.id, 
                message.message_id, 
                undefined, 
                `⏳ Прогресс захода: ${i + 1}/${invites.length}`
            );

            const { text, markups } = await client.services.builder.accountGuilds(
                client.currentProvider
            );

            await client.services.notifications.responseWithNotify(
                ctx,
                Info.GUILD_ADDED
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

            await new Promise((r) => setTimeout(r, randomDelayMs));
        } catch (err: any) {
            console.log(err);
            return await client.services.notifications.responseWithNotify(
                ctx,
                `Не удалось зайти на сервер ${invites[i]}`
            );
        }
    }
};
