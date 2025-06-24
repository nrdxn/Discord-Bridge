import { modelOptions, prop, Severity } from '@typegoose/typegoose';

@modelOptions({
    options: {
        allowMixed: Severity.ALLOW
    }
})
export class Panel {
    @prop()
    public readonly node!: string;

    @prop()
    public admins!: number[];
}
