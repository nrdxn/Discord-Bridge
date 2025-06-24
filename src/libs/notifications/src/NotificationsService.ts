import { Context } from 'telegraf';
import { Notify } from '@/libs/notifications/src/types/Notify';

export class NotificationsService {
    public async responseWithNotify(ctx: Context, notify: Notify | string) {
        const message = await ctx.reply(notify);
        setTimeout(async () => {
            await ctx.deleteMessage(message.message_id);
        }, 5_000);
    }
}
