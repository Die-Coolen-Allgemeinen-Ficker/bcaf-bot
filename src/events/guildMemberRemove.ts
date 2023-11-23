import {
    GuildMember,
    VoiceChannel
} from 'discord.js';

import { bcafBot } from '../main';

export default (member: GuildMember) => {
    (bcafBot.client.channels.cache.get('982982312859947018') as VoiceChannel).setName(`🅱embers: ${member.guild.memberCount}`);
};