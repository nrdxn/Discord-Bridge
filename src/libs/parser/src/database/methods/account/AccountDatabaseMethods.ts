import { DocumentType } from '@typegoose/typegoose';
import { Account } from '@/libs/parser/src/database/models/Account';
import { AccountModel } from '@/libs/parser/src/database/models/Central';
import { ClientClass } from '@/libs/common/telegraf/src/ClientClass';
import { LogLevel } from '@/libs/common/logger/src/enums/LogLevel';

export class AccountDatabaseMethods {
    public readonly cache: Map<string, DocumentType<Account>> = new Map();

    constructor(private readonly client: ClientClass) {}

    public async init() {
        const allAccounts = await this.findAll();

        for (let i = 0; i < allAccounts.length; i++) {
            const doc = allAccounts[i];
            this.cache.set(doc.id, doc);
        }
    }

    public async findAll() {
        return await AccountModel.find({ banned: false });
    }

    public async findById(accountID: string) {
        const account =
            this.cache.get(accountID) ??
            (await AccountModel.findOne({ id: accountID }));

        if (!account) return null;
        if (!this.cache.has(accountID)) this.cache.set(accountID, account);
        
        return account;
    }

    public async createInDb(dto: AccountCreateDto) {
        await AccountModel.create({
            id: dto.id,
            token: dto.token
        });
    }

    public async deleteById(accountID: string) {
        await AccountModel.deleteOne({ id: accountID });
    }

    public async save(doc: DocumentType<Account>) {
        await doc.save().catch((error: any) => {
            this.client.services.logger.log(
                LogLevel.WARN,
                `Не удалось сохранить аккаунт ${doc.id}\n${error.stack ?? error}`
            );
        });
        this.cache.set(doc.id, doc);
    }
}
