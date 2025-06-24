import { getModelForClass } from '@typegoose/typegoose';
import { Account } from '@/libs/parser/src/database/models/Account';
import { Panel } from '@/libs/parser/src/database/models/Panel';

export const AccountModel = getModelForClass(Account);
export const PanelModel = getModelForClass(Panel);
