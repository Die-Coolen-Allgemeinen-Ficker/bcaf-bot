import { Interaction } from 'discord.js';

import { bcafBot } from '../main';

export default async (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
        const slashCommand = bcafBot.slashCommands.get(interaction.commandName);
        if (!slashCommand) {
            console.error(`Could not find command "${interaction.commandName}"`);
            return await interaction.reply({ content: 'Der Command konnte nicht ausgeführt werden.', ephemeral: true });
        }
        try {
            slashCommand.run(interaction);
        } catch (error) {
            console.error(`Could not run command ${interaction.commandName}:`, error);
            await interaction.reply({ content: 'Der Command konnte nicht ausgeführt werden.', ephemeral: true });
        }
    } else if (interaction.isMessageComponent()) {
        const componentPrefix = interaction.customId.split('_')[0];
        const component = bcafBot.components.get(componentPrefix);
        if (!component) {
            console.error(`Could not find component "${interaction.customId}"`);
            return await interaction.reply({ content: 'Das Component konnte nicht gefunden werden.', ephemeral: true });
        }
        try {
            const suffix = interaction.customId.split('_')[1];
            component.run(interaction, suffix);
        } catch (error) {
            console.error(`Could not run command ${interaction.customId}:`, error);
            await interaction.reply({ content: 'Das Component konnte nicht ausgeführt werden.', ephemeral: true });
        }
    }
};