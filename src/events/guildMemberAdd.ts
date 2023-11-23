import {
    GuildMember,
    VoiceChannel
} from 'discord.js';

import { bcafBot } from '../main';
import { bIfy } from '../util/enforceB';

export default (member: GuildMember) => {
    const name = bIfy(member.user.displayName);
    member.setNickname(name);

    (bcafBot.client.channels.cache.get('982982312859947018') as VoiceChannel).setName(`🅱embers: ${member.guild.memberCount}`);

    if (!member.user.bot)
        member.roles.add('674011898047365158');
};