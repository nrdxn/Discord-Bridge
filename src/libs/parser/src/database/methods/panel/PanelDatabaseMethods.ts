import { DocumentType } from '@typegoose/typegoose';
import { Panel } from '@/libs/parser/src/database/models/Panel';
import { PanelModel } from '@/libs/parser/src/database/models/Central';
import { LogLevel } from '@/libs/common/logger/src/enums/LogLevel';
import { ClientClass } from '@/libs/common/telegraf/src/ClientClass';

export class PanelDatabaseMethods {
    public readonly cache: Map<string, DocumentType<Panel>> = new Map();

    constructor(private readonly client: ClientClass) {}

    public async init() {
        const allPanels = await PanelModel.find();

        for (let i = 0; i < allPanels.length; i++) {
            const doc = allPanels[i];
            this.cache.set(doc.id, doc);
        }
    }

    public async findPanel() {
        const panel =
            this.cache.get('Crimson') ??
            (await PanelModel.findOne({ node: 'Crimson' })) ??
            (await PanelModel.create({ node: 'Crimson' }));

        if (!this.cache.has('Crimson')) this.cache.set('Crimson', panel);
        return panel;
    }

    public async save(doc: DocumentType<Panel>) {
        await doc.save().catch((error: any) => {
            this.client.services.logger.log(
                LogLevel.WARN,
                `Не удалось сохранить панель ${doc.id}\n${error.stack ?? error}`
            );
        });
        this.cache.set(doc.id, doc);
    }
}
