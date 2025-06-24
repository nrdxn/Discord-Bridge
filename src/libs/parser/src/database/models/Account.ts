import { modelOptions, prop, Severity } from '@typegoose/typegoose';

@modelOptions({
    options: {
        allowMixed: Severity.ALLOW
    }
})
export class Account {
    @prop()
    public readonly token!: string;

    @prop()
    public readonly id!: string;

    @prop()
    public name?: string;

    @prop({ default: true })
    public enabled!: boolean;

    @prop({ default: false })
    public banned!: boolean;

    @prop()
    public discord_channels!: DiscordChannelDto[];

    @prop({ default: {} })
    public telegram_channel!: TelegramChannelDto;

    @prop({ default: { enabled: false } })
    public translate!: TranslateDto;

    @prop()
    public keyWords!: string[];

    @prop()
    public stopWords!: string[];
}
