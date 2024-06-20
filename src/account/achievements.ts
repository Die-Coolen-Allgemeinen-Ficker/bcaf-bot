import {
    EmbedBuilder,
    TextChannel
} from 'discord.js';

import { BCAFAccount } from './bcafAccount';
import { bcafBot } from '../main';

export interface Achievement {
    name: string;
    description: string;
    timestamp?: number;
}

export async function grantAchievement (account: BCAFAccount, achievement: Achievement, channel?: TextChannel) {
    achievement.timestamp = Date.now();

    if (!channel)
        channel = bcafBot.bcaf.channels.cache.get('555729962188144662') as TextChannel;

    if (account.getData().profile.achievements.some(a => a.name == achievement.name))
        return;

    await account.update({ profile: { achievements: [ ...account.getData().profile.achievements, achievement ] } });
    const embed = new EmbedBuilder()
    .setTitle('Achievement')
    .setDescription(`${account.user.toString()}, du hast ein Achievement bekommen!\n**${achievement.name}** - ${achievement.description}`)
    .setColor('#ff0000');
    channel.send({ embeds: [ embed ] });
}