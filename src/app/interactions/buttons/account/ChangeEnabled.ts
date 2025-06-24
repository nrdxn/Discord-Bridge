import { Context } from 'telegraf';
import { ClientClass } from '@/libs/common/telegraf/src/ClientClass';
import { Button } from '@/libs/common/telegraf/src/helpers/interfaces/ButtonInterface';
import { Warns } from '@/libs/notifications/src/enums/Warns';

export default new Button(
    { name: 'ChangeEnabled' },
    async (client: ClientClass, ctx: Context) => {
        const type = (ctx.callbackQuery as any).data.split('-')[1];
        const accountID = (ctx.callbackQuery as any).data.split('-')[2];
        const account =
            await client.services.database.accounts.findById(accountID);

        if (!account) return;

        switch (type) {
            case 'Account':
                account.enabled = !account.enabled;
                break;
            case 'Translate':
                account.translate.enabled = !account.translate.enabled;
                account.markModified('translate');

                if (!account.translate.prompt)
                    await client.services.notifications.responseWithNotify(
                        ctx,
                        Warns.EMPTY_PROMPT
                    );
                break;
        }

        await client.services.database.accounts.save(account);

        const { text, markups } =
            await client.services.builder.account(accountID);

        await ctx.editMessageText(text, {
            ...markups,
            parse_mode: 'HTML'
        });
    }
);
