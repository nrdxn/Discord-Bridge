import { Context, Markup } from 'telegraf';
import { ClientClass } from '@/libs/common/telegraf/src/ClientClass';
import { Listener } from '@/libs/common/telegraf/src/helpers/interfaces/ListenerInterface';
import { Command } from '@/libs/common/telegraf/src/helpers/interfaces/CommandInterface';

export default new Listener(
    { name: 'message' },
    async (client: ClientClass, ctx: Context) => {
        const panel = await client.services.database.panels.findPanel();

        if (
            Number(process.env['ADMIN_ID']) !== ctx.from!.id &&
            !panel.admins.includes(ctx.from!.id)
        )
            return;

        if (ctx.text?.startsWith('/')) {
            const commandName = ctx.text.split(' ')[0];
            const command: Command = client.commands?.cache.get(commandName)!;

            if (!command) return;

            await command.execute(client, ctx);
        }

        const userInCache = client.listeners.cache.get(ctx.from!.id);
        if (!userInCache) return;

        switch (userInCache) {
            case 'Token':
                await (
                    await import(
                        '@/app/listeners/updates/messages/collectors/Token'
                    )
                ).default(client, ctx);
                break;
            case 'Guild':
                await (
                    await import(
                        '@/app/listeners/updates/messages/collectors/Guild'
                    )
                ).default(client, ctx);
                break;
            case 'DiscordChannel':
                await (
                    await import(
                        '@/app/listeners/updates/messages/collectors/DiscordChannel'
                    )
                ).default(client, ctx);
                break;
            case 'TelegramChannel':
                await (
                    await import(
                        '@/app/listeners/updates/messages/collectors/TelegramChannel'
                    )
                ).default(client, ctx);
                break;
            case 'Name':
                await (
                    await import(
                        '@/app/listeners/updates/messages/collectors/Name'
                    )
                ).default(client, ctx);
                break;
            case 'Prompt':
                await (
                    await import(
                        '@/app/listeners/updates/messages/collectors/Prompt'
                    )
                ).default(client, ctx);
                break;
            case 'stopWords':
                await (
                    await import(
                        '@/app/listeners/updates/messages/collectors/Filters'
                    )
                ).default(client, ctx, 'stopWords');
                break;
            case 'keyWords':
                await (
                    await import(
                        '@/app/listeners/updates/messages/collectors/Filters'
                    )
                ).default(client, ctx, 'keyWords');
                break;
        }
    }
);
