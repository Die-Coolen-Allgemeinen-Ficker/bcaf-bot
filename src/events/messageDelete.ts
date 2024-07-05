import {
    EmbedBuilder,
    Message,
    TextChannel
} from 'discord.js';

import { bcafBot } from '../main';
import { BCAFAccount } from '../account/bcafAccount';

export default async (message: Message) => {
    if (message.channelId == '1256689378852606023')
        return;

    const iSawWhatYouDeleted = bcafBot.bcaf.channels.cache.get('1256689378852606023') as TextChannel;
    const embed = new EmbedBuilder()
    .setTitle('I saw what you deleted')
    .setColor('#2b2d31')
    .setDescription(message.content.length == 0 ? 'Kein Textinhalt' : message.content)
    .addFields(
        { name: 'Author', value: `${message.author.toString()}` },
        { name: 'Channel', value: `${message.channel.toString()}` },
        { name: 'Send time', value: `<t:${Math.floor(message.createdTimestamp * 0.001)}>` },
        ...message.attachments.map(attachment => {
            return {
                name: attachment.name,
                value: attachment.url
            }
        })
    );
    await iSawWhatYouDeleted.send({ embeds: [ embed ] });

    if (message.author.bot)
        return;

    const now = new Date();
    if (now.getTime() - message.createdTimestamp <= 5000) {
        const account = await BCAFAccount.fetch(message.author.id);
        await account?.grantAchievement({
            name: 'I saw what you deleted',
            description: '🤨📸'
        }, message.channel as TextChannel);
    }
}