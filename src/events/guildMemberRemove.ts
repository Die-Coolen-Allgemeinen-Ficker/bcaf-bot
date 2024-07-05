import {
    GuildMember,
    TextChannel,
    VoiceChannel
} from 'discord.js';

import { bcafBot } from '../main';

export default (member: GuildMember) => {
    (bcafBot.client.channels.cache.get('982982312859947018') as VoiceChannel).setName(`🅱embers: ${member.guild.memberCount}`);
    (bcafBot.client.channels.cache.get('555729962188144662') as TextChannel).send({ content: `womp womp ${member.toString()} ist geleaved` });
};