import {
    ChatInputCommandInteraction,
    SlashCommandBuilder
} from 'discord.js';

export class SlashCommand extends SlashCommandBuilder {
    run!: (interaction: ChatInputCommandInteraction) => Promise<void>;

    constructor () {
        super();
    }

    setRun (run: (interaction: ChatInputCommandInteraction) => Promise<void>) {
        this.run = run;
        return this;
    }
}