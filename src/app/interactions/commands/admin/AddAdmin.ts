import { Context, Markup } from 'telegraf';
import { ClientClass } from '@/libs/common/telegraf/src/ClientClass';
import { Command } from '@/libs/common/telegraf/src/helpers/interfaces/CommandInterface';
import { Warns } from '@/libs/notifications/src/enums/Warns';
import { Info } from '@/libs/notifications/src/enums/Info';

export default new Command(
    { name: '/add-admin' },
    async (client: ClientClass, ctx: Context) => {
        const panel = await client.services.database.panels.findPanel();
        const adminID = Number(ctx.text?.split(' ')[1]);

        if (adminID === ctx.from?.id) {
            return await client.services.notifications.responseWithNotify(
                ctx,
                Warns.NOT_ALLOWED_INTERACTION
            );
        }

        panel.admins.push(adminID);
        await client.services.database.panels.save(panel);

        await client.services.notifications.responseWithNotify(
            ctx,
            Info.ADMIN_ADDED
        );
    }
);
