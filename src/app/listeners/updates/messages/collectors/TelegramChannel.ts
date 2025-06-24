import { Context } from 'telegraf';
import { ClientClass } from '@/libs/common/telegraf/src/ClientClass';
import { ParserMethods } from '@/libs/parser/src/methods/ParserMethods';

export default async (client: ClientClass, ctx: Context) => {
    const channelName = ctx.text!;
    const account = await client.services.database.accounts.findById(
        client.currentProvider
    );
    
    await ctx.deleteMessage();

    if (!account) {
        return client.listeners.cache.delete(ctx.from!.id);
    }

    if (channelName.startsWith('@')) {
        await ParserMethods.checkChannelForPermissions(
            channelName,
            ctx,
            client
        );
    } else if ((ctx.message as any).forward_from_chat) {
        const chat = (ctx.message as any).forward_from_chat;

        await ParserMethods.checkChannelForPermissions(chat.id, ctx, client);
    }
};
