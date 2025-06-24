export class Command {
    constructor(
        public readonly options: { name: string },
        public readonly execute: Function
    ) {}
}
