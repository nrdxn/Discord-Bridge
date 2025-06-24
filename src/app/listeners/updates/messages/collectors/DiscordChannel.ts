import { Context } from 'telegraf';
import { GuildTextBasedChannel } from 'discord.js-selfbot-v13';
import { ClientClass } from '@/libs/common/telegraf/src/ClientClass';
import { ParserMethods } from '@/libs/parser/src/methods/ParserMethods';

export default async (client: ClientClass, ctx: Context) => {
    const urls = ctx.text?.split('\n')!;
    const provider = client.providers.get(client.currentProvider);
    const account = await client.services.database.accounts.findById(
        client.currentProvider
    );

    await ctx.deleteMessage();

    if (!provider || !account) {
        return client.listeners.cache.delete(ctx.from!.id);
    }

    const message = await ctx.reply(`⏳ Прогресс добавления: 0/${urls.length}`);

    for (let i = 0; i < urls.length; i++) {
        if (!urls[i].startsWith('https://') && !urls[i].includes('discord.com')) {
            client.listeners.cache.delete(ctx.from!.id);
            await client.services.notifications.responseWithNotify(
                ctx,
                `${urls[i]} - невалидная ссылка`
            );
            continue;
        }

        const channel = provider.channels.cache.get(
            ParserMethods.getChannelId(urls[i])
        ) as GuildTextBasedChannel;

        if (!channel) {
            client.listeners.cache.delete(ctx.from!.id);
            await client.services.notifications.responseWithNotify(
                ctx,
                `${urls[i]} не найден`
            );
            continue;
        }

        client.listeners.cache.delete(ctx.from!.id);

        account.discord_channels.push({
            id: channel.id,
            name: channel.name,
            guild: channel.guild.name
        });
        account.markModified('discord_channels');
        await client.services.database.accounts.save(account);

        await ctx.telegram.editMessageText(
            ctx.from!.id,
            message.message_id,
            undefined,
            `⏳ Прогресс добавления: ${i + 1}/${urls.length}`
        ).catch(() => {});

        if (urls[i] === urls[urls.length - 1]) await ctx.telegram.deleteMessage(ctx.from!.id, message.message_id)
            
        await new Promise((r) => setTimeout(r, 2_000));
    }
};