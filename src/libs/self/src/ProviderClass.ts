import { Client } from 'discord.js-selfbot-v13';
import { Solver } from '2captcha';
import { ClientClass } from '@/libs/common/telegraf/src/ClientClass';
import { ParserMethods } from '@/libs/parser/src/methods/ParserMethods';
import { LogLevel } from '@/libs/common/logger/src/enums/LogLevel';
import { ProviderUtils } from '@/libs/self/src/utils/ProviderUtils';

export class AccountProvider extends Client {
    private readonly solver: Solver = new Solver(
        process.env['2CAPTCHA_API_KEY']!
    );

    constructor(private readonly client: ClientClass) {
        super({
            ws: {
                properties: {
                    os: 'Linux',
                    browser: 'Discord Client'
                }
            },
            http: {
                headers: {
                    'x-super-properties': Buffer.from(
                        JSON.stringify({
                            os: 'Linux',
                            browser: 'Discord Client',
                            release_channel: 'canary',
                            client_version: '1.0.49',
                            os_version: '5.4.0-212-generic',
                            os_arch: 'x64',
                            app_arch: 'x64',
                            system_locale: 'en-US',
                            browser_user_agent:
                                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) discord/1.0.310 Chrome/120.0.6099.291 Electron/28.2.7 Safari/537.36',
                            client_build_number: 282037,
                            native_build_number: 46216,
                            client_event_source: null
                        })
                    ).toString('base64')
                },
                agent: {
                    uri: process.env['PROXY_URL']!
                }
            },
            captchaSolver: async (captcha, agent) => {
                const res = await this.solver.hcaptcha(
                    captcha.captcha_sitekey,
                    'discord.com',
                    {
                        invisible: 1,
                        userAgent: agent,
                        data: captcha.captcha_rqdata
                    }
                );
                return res.data;
            },
            captchaRetryLimit: 3
        });

        this.on('messageCreate', async (message) => {
            const account = await client.services.database.accounts.findById(
                this.user!.id
            );

            if (!account) return;
            if (!account.enabled) return;
            if (!account.telegram_channel.id) return;
            if (
                !account.discord_channels
                    .map((c) => c.id)
                    .includes(message.channel.id)
            )
                return;
            let text = ParserMethods.formatText(
                message.content
                    ? message.content
                    : message.embeds[0]?.description!
            );

            if (
                !text ||
                text === '' ||
                ParserMethods.isOnlyEmojis(text) ||
                ParserMethods.isOnlyURL(text)
            )
                return;
            if (
                account.stopWords.length > 0 &&
                ParserMethods.checkFilters(account.stopWords, text)
            )
                return;
            if (
                account.keyWords.length > 0 &&
                !ParserMethods.checkFilters(account.keyWords, text)
            )
                return;

            if (account.translate.enabled && account.translate.prompt) {
                const response =
                    await client.services.gpt.chat.completions.create({
                        model: 'gpt-4o-mini',
                        messages: [
                            {
                                role: 'system',
                                content: `You're a translator with a lot of experience.`
                            },
                            {
                                role: 'user',
                                content: `${text}\n\n${account.translate.prompt}`
                            }
                        ]
                    });

                text = response.choices[0].message.content!;
            }

            const textWithGuild = ({ isCaption = false } = {}) =>
                `${isCaption && text.length >= 1024 ? `${text.substring(0, 1024)}...` : text}\n\n${
                    message.guild?.vanityURLCode
                        ? `[${message.guild.name}](https://discord.gg/${message.guild.vanityURLCode})`
                        : `*${message.guild?.name}*`
                } • [Читать оригинал](${message.url})`;

            try {
                const attachments = Array.from(
                    message.attachments.values()
                ).filter(
                    (a) =>
                        a.size < 52428800 &&
                        a.contentType &&
                        ['image/jpeg', 'image/png', 'video/mp4'].includes(
                            a.contentType
                        )
                );

                if (attachments.length > 0) {
                    await client.telegram.sendMediaGroup(
                        account.telegram_channel.id,
                        attachments.map((a, i) => {
                            return {
                                type:
                                    a.contentType === 'image/jpeg' ||
                                    a.contentType === 'image/png'
                                        ? 'photo'
                                        : 'video',
                                media: a.url,
                                caption:
                                    i === 0
                                        ? textWithGuild({ isCaption: true })
                                        : undefined,
                                parse_mode: i === 0 ? 'Markdown' : undefined
                            };
                        })
                    );
                } else if (message.embeds[0].image?.url) {
                    await client.telegram.sendPhoto(
                        account.telegram_channel.id,
                        message.embeds[0].image?.url,
                        {
                            caption: textWithGuild({ isCaption: true }),
                            parse_mode: 'Markdown'
                        }
                    );
                } else {
                    await client.telegram.sendMessage(
                        account.telegram_channel.id,
                        textWithGuild(),
                        {
                            parse_mode: 'Markdown',
                            link_preview_options: {
                                is_disabled: true
                            }
                        }
                    );
                }
            } catch (err: any) {
                const text = `Не удалось отправить сообщение в канал ${account.telegram_channel.name}\n${err.stack ?? err}\n\n${message.url}`;
                await ProviderUtils.notifyAdmins(this.client, text);
                this.client.services.logger.log(LogLevel.WARN, text);
                return;
            }
        });
    }
}
