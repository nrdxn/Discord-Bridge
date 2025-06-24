import { Context } from 'telegraf';
import { ClientClass } from '@/libs/common/telegraf/src/ClientClass';
import { Button } from '@/libs/common/telegraf/src/helpers/interfaces/ButtonInterface';

export default new Button(
    { name: 'FilterPagination' },
    async (client: ClientClass, ctx: Context) => {
        const type = (ctx.callbackQuery as any).data.split('-')[1];
        let page = Number((ctx.callbackQuery as any).data.split('-')[2]);
        const accountID = (ctx.callbackQuery as any).data.split('-')[3];
        const mode = (ctx.callbackQuery as any).data.split('-')[4];

        switch (type) {
            case 'Back':
                page -= 2;
                break
            case 'Next':
                break;
        }

        const { text, markups } =
            await client.services.builder.accountFilters(accountID, mode, page);

        await ctx
            .editMessageText(text, {
                parse_mode: 'HTML',
                ...markups
            })
            .catch(() => {});
    }
);