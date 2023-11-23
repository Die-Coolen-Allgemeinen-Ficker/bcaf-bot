import {
    ChatInputCommandInteraction,
    PermissionFlagsBits
} from 'discord.js';

import { SlashCommand } from '../../slashCommand';

export default new SlashCommand()
.setName('postembed')
.setDescription('Postet ein fancy Embed.')
.addStringOption()
.setRun(async (interaction: ChatInputCommandInteraction) => {

})
.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);