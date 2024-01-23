import {
    ChatInputCommandInteraction,
    PermissionFlagsBits
} from 'discord.js';

import { SlashCommand } from '../../slashCommand';
import { bcafBot } from '../../main';

export default new SlashCommand()
.setName('generatechannelnamemappings')
.setDescription('Generiert ein Mapping von allen Kanalnamen.')
.addBooleanOption(option =>
    option.setName('includedefaultfield')
    .setDescription('Ob ein `_default` Field zum Zurücksetzen vorhanden sein soll.')
    .setRequired(true)
)
.setRun(async (interaction: ChatInputCommandInteraction) => {
    const channels: any = {};
    bcafBot.client.guilds.cache.get('555729962188144660')!.channels.cache.forEach(channel => { channels[channel.id] = channel.name; });

    const mapping: any = { channels };

    if (interaction.options.getBoolean('includedefaultfield', true))
        mapping['_default'] = channels;

    await interaction.reply({ files: [ { attachment: Buffer.from(JSON.stringify(mapping).replace(/,/g, ',\n')), name: `channel_mapping_${Date.now()}.json` } ], ephemeral: true });
})
.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);