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
                    `⚠ Аккаунт ${account.id} был забанен`
                );
                
                account.banned = true;
                await account.save();
            })
            .then(() => {
                client.providers.set(account.id, provider);
            });
    }
};
