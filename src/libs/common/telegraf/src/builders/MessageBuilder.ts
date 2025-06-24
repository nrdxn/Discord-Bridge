import { ClientClass } from '@/libs/common/telegraf/src/ClientClass';
import { stripIndents } from 'common-tags';
import { Guild } from 'discord.js-selfbot-v13';
import { Markup } from 'telegraf';
import { InlineKeyboardButton } from 'telegraf/types';

export class MessageBuilder {
    constructor(private readonly client: ClientClass) {}

    public async account(accountID: string) {
        const account =
            await this.client.services.database.accounts.findById(accountID);

        const text = stripIndents(`
            🗂 Название: <b>${account?.name ?? 'Не указано'}</b>

            🔑 Токен: ${account?.token}
            🚦 Статус: <b>${account?.enabled ? 'Включен' : 'Выключен'}</b>
            
            ✈ Канал: <b>${account?.telegram_channel.id ? (account.telegram_channel.username ? `@${account!.telegram_channel.username}` : account.telegram_channel.name) : 'Не указан'}</b>
            📝 Перевод: <b>${account?.translate.enabled ? 'Включен' : 'Выключен'}</b>
            ✏ Промпт: <b>${account?.translate.prompt ? account.translate.prompt : 'Не указано'}</b>

            ⚡ Ключевые слова: <b>${account?.keyWords.length}</b>
            ⛔ Стоп слова: <b>${account?.stopWords.length}</b>

            🏠 Серверов: <b>${this.client.providers.get(accountID)?.guilds.cache.size ?? 0}</b>
            💬 Чатов: <b>${account?.discord_channels.length}</b>
        `);

        const markups = {
            ...Markup.inlineKeyboard([
                [
                    Markup.button.callback(
                        `${account?.enabled ? '🔴 Выключить' : '🔘 Включить'}`,
                        `ChangeEnabled-Account-${accountID}`
                    )
                ],
                [
                    Markup.button.callback(
                        '🗂 Изменить название',
                        `Collector-Name-${accountID}`
                    )
                ],
                [
                    Markup.button.callback('💬 Чаты', `Chats-${accountID}`),
                    Markup.button.callback('🏠 Сервера', `Guilds-${accountID}`)
                ],
                [
                    Markup.button.callback(
                        '⚡ Ключевые слова',
                        `Filters-keyWords-${accountID}`
                    ),
                    Markup.button.callback(
                        '⛔ Стоп слова',
                        `Filters-stopWords-${accountID}`
                    )
                ],
                [
                    Markup.button.callback(
                        `${account?.translate.enabled ? '🔴 Выключить перевод' : '🔘 Включить перевод'}`,
                        `ChangeEnabled-Translate-${accountID}`
                    ),
                    Markup.button.callback(
                        '✏ Изменить промпт',
                        `Collector-Prompt-${accountID}`
                    )
                ],
                [
                    Markup.button.url(
                        '➕ Добавить в канал',
                        'https://t.me/DiscordParserRobot?startchannel=true'
                    ),
                    Markup.button.callback(
                        '✈ Указать название канала',
                        `Collector-TelegramChannel-${accountID}`
                    )
                ],
                [
                    Markup.button.callback(
                        `🗑 Удалить`,
                        `Back-Delete-${accountID}`
                    )
                ],
                [Markup.button.callback(`« Назад`, `Back-Main-${accountID}`)]
            ])
        };

        return { text, markups };
    }

    public async main() {
        const accounts = await this.client.services.database.accounts.findAll();
        const text = '🔍 Выбери аккаунт для взаимодействия:';

        const buttons = await Promise.all(
            accounts.map(async (account) =>
                Markup.button.callback(
                    `${account?.name ?? 'Название не указано'} (id: ${account?.id})`,
                    `OpenAccount-${account?.id}`
                )
            )
        );

        const markups = {
            ...Markup.inlineKeyboard([
                buttons,
                [Markup.button.callback('➕ Добавить аккаунт', 'AddAccount')]
            ])
        };

        return { text, markups };
    }

    public async accountGuilds(accountID: string, page = 0) {
        const from = page * 15;
        const to = from + 15;
        const account = this.client.providers.get(accountID);
        const guilds = account?.guilds.cache.map((g) => g);
        const formatedGuilds = guilds?.slice(from, to);
        const nextPageValid = guilds?.slice(from, to + 1);
        page++;

        let rows: Guild[][] = [];
        let manageRows: InlineKeyboardButton.CallbackButton[] = [];

        const text = stripIndents(`
            —・ Список серверов аккаунта:

            ${formatedGuilds?.map((guild, i) => `#${from + i + 1}. ${guild.name}`).join('\n') || 'Пусто...'}

            Страница ${page}/${Math.ceil(guilds!.length / 15) || 1}
        `);

        for (let i = 0; i < formatedGuilds!.length; i += 5) {
            rows.push(formatedGuilds!.slice(i, i + 5));
        }

        const buttons = rows.map((row, j) =>
            row.map((guild, i) =>
                Markup.button.callback(
                    `🗑 ${from + j * 5 + i + 1}`,
                    `LeaveGuild-${guild.id}-${accountID}-${page}`
                )
            )
        );

        if (page !== 1) {
            manageRows.push(
                Markup.button.callback(
                    '◀',
                    `GuildPagination-Back-${page}-${accountID}`
                )
            )
        }

        if (nextPageValid!.length >= 16) {
            manageRows.push(
                Markup.button.callback(
                    '▶',
                    `GuildPagination-Next-${page}-${accountID}`
                )
            )
        }

        const markups = {
            ...Markup.inlineKeyboard([
                ...buttons,
                manageRows,
                /*
                [
                    Markup.button.callback(
                        '➕ Добавить сервер',
                        `Collector-Guild-${accountID}`
                    )
                ],
                */
                [Markup.button.callback(`« Назад`, `Back-Account-${accountID}`)]
            ])
        };

        return { text, markups };
    }

    public async accountChats(accountID: string, page = 0) {
        const from = page * 15;
        const to = from + 15;
        const account =
            await this.client.services.database.accounts.findById(accountID);
        const chatsFormated = account!.discord_channels.slice(from, to);
        const nextPageValid = account!.discord_channels.slice(from, to + 1);
        page++;

        let chatRows: DiscordChannelDto[][] = [];
        let manageRows: InlineKeyboardButton.CallbackButton[] = [];

        const text = stripIndents(`
            —・ Список чатов аккаунта:

            ${chatsFormated?.map((chat, i) => `#${from + i + 1}. ${chat.name} (сервер: ${chat.guild})`).join('\n') || 'Пусто...'}

            Страница ${page}/${Math.ceil(account!.discord_channels.length / 15) || 1}
        `);

        for (let i = 0; i < chatsFormated.length; i += 5) {
            chatRows.push(chatsFormated.slice(i, i + 5));
        }

        const buttons = chatRows.map((row, j) =>
            row.map((chat, i) =>
                Markup.button.callback(
                    `🗑 ${from + j * 5 + i + 1}`,
                    `DeleteChat-${chat.id}-${accountID}-${page}`
                )
            )
        );

        if (page !== 1) {
            manageRows.push(
                Markup.button.callback(
                    '◀',
                    `ChatPagination-Back-${page}-${accountID}`
                )
            )
        }

        if (nextPageValid.length >= 16) {
            manageRows.push(
                Markup.button.callback(
                    '▶',
                    `ChatPagination-Next-${page}-${accountID}`
                )
            )
        }

        const markups = {
            ...Markup.inlineKeyboard([
                ...buttons,
                manageRows,
                [
                    Markup.button.callback(
                        '➕ Добавить чат',
                        `Collector-DiscordChannel-${accountID}`
                    )
                ],
                [Markup.button.callback(`« Назад`, `Back-Account-${accountID}`)]
            ])
        };

        return { text, markups };
    }

    public async accountFilters(
        accountID: string,
        type: 'keyWords' | 'stopWords',
        page = 0
    ) {
        const from = page * 15;
        const to = from + 15;
        const account =
            await this.client.services.database.accounts.findById(accountID);
        const filtersFormated = account![type].slice(from, to);
        const nextPageValid = account![type].slice(from, to + 1);
        page++;

        let rows: string[][] = [];
        let manageRows: InlineKeyboardButton.CallbackButton[] = [];

        const text = stripIndents(`
            —・ Список ${type === 'keyWords' ? 'ключевых слов' : 'стоп слов'}:

            ${filtersFormated?.map((word, i) => `#${from + i + 1}. ${word}`).join('\n') || 'Пусто...'}

            Страница ${page}/${Math.ceil(account![type].length / 15) || 1}
        `);

        for (let i = 0; i < filtersFormated.length; i += 5) {
            rows.push(filtersFormated.slice(i, i + 5));
        }

        const buttons = rows.map((row, j) =>
            row.map((_, i) =>
                Markup.button.callback(
                    `🗑 ${from + j * 5 + i + 1}`,
                    `DeleteFilter-${type}-${from + j * 5 + i}-${accountID}-${page}`
                )
            )
        );

        if (page !== 1) {
            manageRows.push(
                Markup.button.callback(
                    '◀',
                    `FilterPagination-Back-${page}-${accountID}-${type}`
                )
            )
        }

        if (nextPageValid.length >= 16) {
            manageRows.push(
                Markup.button.callback(
                    '▶',
                    `FilterPagination-Next-${page}-${accountID}-${type}`
                )
            )
        }

        const markups = {
            ...Markup.inlineKeyboard([
                ...buttons,
                manageRows,
                [
                    Markup.button.callback(
                        '➕ Добавить слова',
                        `Collector-${type}-${accountID}`
                    )
                ],
                [Markup.button.callback(`« Назад`, `Back-Account-${accountID}`)]
            ])
        };

        return { text, markups };
    }
}
