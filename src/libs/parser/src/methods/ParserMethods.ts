import { Context } from 'telegraf';
import { ClientClass } from '@/libs/common/telegraf/src/ClientClass';
import { Info } from '@/libs/notifications/src/enums/Info';
import { Warns } from '@/libs/notifications/src/enums/Warns';

export class ParserMethods {
    public static async checkChannelForPermissions(
        channel: string | number,
        ctx: Context,
        client: ClientClass
    ) {
        try {
            const chat = await ctx.telegram.getChat(channel);
            const botMember = await ctx.telegram.getChatMember(
                chat.id,
                ctx.botInfo.id
            );
            if (botMember.status !== 'administrator') {
                return await client.services.notifications.responseWithNotify(
                    ctx,
                    Warns.TELEGRAM_CHANNEL_NOT_EXIST
                );
            } else {
                const account =
                    await client.services.database.accounts.findById(
                        client.currentProvider
                    );

                if (!account) return;

                account.telegram_channel.id = chat.id;
                account.telegram_channel.name = (chat as any).title;
                account.telegram_channel.username = (chat as any)?.username;

                account.markModified('telegram_channel');
                await client.services.database.accounts.save(account);

                const { text, markups } = await client.services.builder.account(
                    client.currentProvider
                );

                await client.services.notifications.responseWithNotify(
                    ctx,
                    Info.TELEGRAM_CHANNEL_ADDED
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
            }
        } catch (err: any) {
            console.log(err);
            return await client.services.notifications.responseWithNotify(
                ctx,
                Warns.TELEGRAM_CHANNEL_NOT_EXIST
            );
        }
    }

    public static getChannelId(url: string) {
        return url.split('/').pop()!;
    }

    public static formatText(text: string) {
        return text
            ?.replace(/<a:[\w\d]+:\d+>|<:[\w\d]+:\d+>/g, '')
//          ?.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
//          ?.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
//          ?.replace(/\*(.*?)\*/g, '<i>$1</i>');
    }

    public static isOnlyEmojis(text: string) {
        const emojiPattern = /^[\p{Emoji}]+$/u;
        return emojiPattern.test(text);
    }

    public static isOnlyURL(text: string) {
        const urlPattern = /^(https?:\/\/[^\s]+)$/i;
        return urlPattern.test(text?.trim());
    }

    public static checkFilters(array: string[], text: string) {
        return array.some((word) => text?.includes(word));
    }
}
