import { Interaction } from 'discord.js';

import { bcafBot } from '../main';

export default async (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
        const slashCommand = bcafBot.slashCommands.get(interaction.commandName);
        try {
            slashCommand.run(interaction);
        } catch (error) {
            console.log(`Could not run command ${interaction.commandName}: ${error}`);
            await interaction.reply({ content: 'Der Command konnte nicht ausgeführt werden.', ephemeral: true });
        }
    }
};