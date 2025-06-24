export class Listener {
    constructor(
        public readonly options: {
            name: string | string[];
        },
        public readonly execute: Function
    ) {}
}
