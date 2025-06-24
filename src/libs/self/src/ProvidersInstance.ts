import { ClientClass } from '@/libs/common/telegraf/src/ClientClass';
import { AccountProvider } from '@/libs/self/src/ProviderClass';
import { ProviderUtils } from './utils/ProviderUtils';

export const startProviders = async (client: ClientClass) => {
    const accounts = await client.services.database.accounts.findAll();

    for (const account of accounts) {
        const provider = new AccountProvider(client);

        provider
            .login(account?.token)
            .catch(async () => {
                await ProviderUtils.notifyAdmins(
                    client,
                    `⚠ Не удается получить доступ к аккаунту ${account.id}. Попробуйте войти снова`
                );

                account.banned = true;
                await account.save();
            })
            .then(() => {
                client.providers.set(account.id, provider);
            });
    }

    setTimeout(async () => {
        process.exit(1);
    }, 1_800_000);
};
