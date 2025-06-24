import { Context, Markup } from 'telegraf';
import { ClientClass } from '@/libs/common/telegraf/src/ClientClass';
import { Command } from '@/libs/common/telegraf/src/helpers/interfaces/CommandInterface';

export default new Command(
    { name: '/start' },
    async (client: ClientClass, ctx: Context) => {
        const { text, markups } = await client.services.builder.main();

        await ctx.reply(text, {
            ...markups
        });
    }
);
