import { ClientClass } from '@/libs/common/telegraf/src/ClientClass';

export class ProviderUtils {
    public static async validateToken(token: string) {
        const response = await fetch('https://discord.com/api/v9/users/@me', {
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });
        return (await response.json()) as ResponseDto;
    }

    public static async notifyAdmins(client: ClientClass, text: string) {
        const panel = await client.services.database.panels.findPanel();

        await client.telegram.sendMessage(process.env['ADMIN_ID']!, text).catch(() => {});
        
        for (const adminID of panel.admins) {
            await client.telegram.sendMessage(adminID, text).catch(() => {});
        }
    }
}
