import { MessageComponentInteraction } from 'discord.js';

export class Component<InteractionType extends MessageComponentInteraction> {
    prefix!: string;
    run!: (Interaction: InteractionType, suffx: string) => Promise<void>;

    constructor () {}

    setPrefix (prefix: string) {
        this.prefix = prefix;
        return this;
    }

    setRun (run: (interaction: InteractionType, suffix: string) => Promise<void>) {
        this.run = run;
        return this;
    }
}