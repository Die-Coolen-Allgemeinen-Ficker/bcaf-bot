import {
    APIEmbedField,
    ChatInputCommandInteraction,
    ColorResolvable,
    EmbedBuilder,
    PermissionFlagsBits,
    RestOrArray
} from 'discord.js';

import { SlashCommand } from '../../slashCommand';
import { validateUrl } from '../../util/url';

export default new SlashCommand()
.setName('postembed')
.setDescription('Postet ein fancy Embed.')
.addStringOption(option =>
    option.setName('title')
    .setDescription('Titel des Embeds')
    .setRequired(true)
)
.addStringOption(option =>
    option.setName('description')
    .setDescription('Beschreibung des Embeds')
    .setRequired(true)
)
.addStringOption(option =>
    option.setName('color')
    .setDescription('HEX RGB Farbe des Embeds (#xxxxxx)')
)
.addStringOption(option =>
    option.setName('thumbnailurl')
    .setDescription('URL des Embed Thumbnails (Bild oben rechts)')
)
.addStringOption(option =>
    option.setName('imageurl')
    .setDescription('URL des Embed Bilds (Großes Bild unten)')
)
.addStringOption(option =>
    option.setName('fields')
    .setDescription('Embed fields; Format: [{"name": "", "value": ""},{"name": "", "value": ""}]')
)
.addIntegerOption(option =>
    option.setName('timestamp')
    .setDescription('Timestamp (Datum) des Embeds')
)
.addStringOption(option =>
    option.setName('url')
    .setDescription('URL des Embeds')
)
.addStringOption(option =>
    option.setName('author')
    .setDescription('Author des Embeds; Format: iconURL, name, url')
)
.addStringOption(option =>
    option.setName('footer')
    .setDescription('Footer des Embeds; Format: iconURL, text')
)
.setRun(async (interaction: ChatInputCommandInteraction) => {
    const title = interaction.options.getString('title', true);
    const description = interaction.options.getString('description', true);
    const color = interaction.options.getString('color');
    const thumbnailUrl = interaction.options.getString('thumbnailurl');
    const imageUrl = interaction.options.getString('imageurl');
    const fields: RestOrArray<APIEmbedField> = JSON.parse(interaction.options.getString('fields') || '[]');
    const timestamp = interaction.options.getInteger('timestamp');
    const url = interaction.options.getString('url');
    const author = interaction.options.getString('author')?.split(', ') || [];
    const footer = interaction.options.getString('footer')?.split(', ') || [];

    if (color && !color?.match(/^#[0-9a-f]{6}/i)) {
        await interaction.reply({ content: `${color} ist kein gültiger HEX RGB String.`, ephemeral: true });
        return;
    }

    for (const urlOption of [ thumbnailUrl, imageUrl, url, author[0], author[2], footer[0] ])
        if (urlOption && !validateUrl(urlOption)) {
            await interaction.reply({ content: `${urlOption} ist keine gültige URL.`, ephemeral: true });
            return;
        }
    
    try {
        const embed = new EmbedBuilder()
        .setTitle(title)
        .setColor(color as ColorResolvable)
        .setDescription(description)
        .setThumbnail(thumbnailUrl)
        .setImage(imageUrl)
        .setFields(...fields)
        .setTimestamp(timestamp)
        .setURL(url);
        if (author.length)
            embed.setAuthor({ iconURL: author[0], name: author[1], url: author[2] })
        if (footer.length)
            embed.setFooter({ iconURL: footer[0], text: footer[1] });
    
        interaction.channel?.send({ embeds: [ embed ] });

        await interaction.reply({ content: 'Embed wurde geschickt.', ephemeral: true });
    } catch (error) {
        console.log(`Could not create Embed:`, error);
        await interaction.reply({ content: `Das Embed ist ungültig: \`\`\`\n${error}\`\`\``, ephemeral: true });
    }
})
.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);