import {
    ChatInputCommandInteraction,
    PermissionFlagsBits,
    TextChannel
} from 'discord.js';

import { SlashCommand } from '../../slashCommand';
import { BCAFAccount } from '../../account/bcafAccount';

export default new SlashCommand()
.setName('pookiebear')
.setDescription('Gibt das Pookie Bear Achievement')
.addUserOption(option =>
    option.setName('benutzer')
    .setDescription('My little pookie bear :3')
    .setRequired(true)
)
.setRun(async (interaction: ChatInputCommandInteraction) => {
    const user = interaction.options.getUser('benutzer', true);
    if (user.id == interaction.user.id) {
        await interaction.reply({ content: 'Du bist zwar ein Admin aber ein anderer Admin soll es dir geben.' });
        return;
    }
    if (user.bot) {
        await interaction.reply({ content: 'Dein Pookie Bear kann kein Bot sein :((((((((((((((' });
        return;
    }
    const account = await BCAFAccount.fetch(user.id);
    await account?.grantAchievement({
        name: 'My little pookie bear :3',
        description: 'Bring einen Admin dazu dir dieses Achievement mit /pookiebear zu geben.'
    }, interaction.channel as TextChannel);
    interaction.reply({ content: `${user.toString()} ist dein Pookie Bear :3`, ephemeral: true });
})
.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);