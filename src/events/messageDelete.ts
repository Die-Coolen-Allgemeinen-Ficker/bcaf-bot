import {
    Message,
    TextChannel,
    WebhookClient
} from 'discord.js';

import { BCAFAccount } from '../account/bcafAccount';
import { config } from 'dotenv';

config();
const webhookClient = new WebhookClient({ url: process.env.ISWYD_WEBHOOK_URL! });

export default async (message: Message) => {
    if (message.channelId == '1256689378852606023')
        return;

    webhookClient.send({
        content: `In ${message.channel.toString()} at <t:${Math.floor(message.createdTimestamp * 0.001)}>:\n${message.content}\n${message.attachments.map(attachment => attachment.url).join(' ')}`.slice(0, 1999),
        username: message.member?.nickname || message.author.displayName || message.author.username,
        avatarURL: message.author.avatarURL() || undefined
    });

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