export class Button {
    constructor(
        public readonly options: { name: string },
        public readonly execute: Function
    ) {}
}
