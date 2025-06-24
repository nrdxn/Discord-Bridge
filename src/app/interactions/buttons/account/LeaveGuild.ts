import { Context } from 'telegraf';
import { ClientClass } from '@/libs/common/telegraf/src/ClientClass';
import { Button } from '@/libs/common/telegraf/src/helpers/interfaces/ButtonInterface';
import { Info } from '@/libs/notifications/src/enums/Info';

export default new Button(
    { name: 'LeaveGuild' },
    async (client: ClientClass, ctx: Context) => {
        const guildID = (ctx.callbackQuery as any).data.split('-')[1];
        const accountID = (ctx.callbackQuery as any).data.split('-')[2];
        const page = Number((ctx.callbackQuery as any).data.split('-')[3]);
        const account =
            await client.services.database.accounts.findById(accountID);

        if (!account) return await ctx.deleteMessage();

        const guild = client.providers
            .get(accountID)
            ?.guilds.cache.get(guildID);

        account.discord_channels = account.discord_channels.filter(
            (channel) =>
                !guild?.channels.cache.map((c) => c.id).includes(channel.id)
        );
        await client.services.database.accounts.save(account);
        await guild?.leave();

        const { text, markups } =
            await client.services.builder.accountGuilds(accountID, page - 1);

        await ctx.editMessageText(text, {
            parse_mode: 'HTML',
            ...markups
        });

        await client.services.notifications.responseWithNotify(
            ctx,
            Info.GUILD_REMOVED
        );
    }
);
