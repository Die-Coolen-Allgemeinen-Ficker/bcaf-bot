import {
    GuildMember,
    VoiceChannel
} from 'discord.js';

import { bcafBot } from '../main';
import { bIfy } from '../util/enforceB';
import { BCAFAccount } from '../account/bcafAccount';

export default async (member: GuildMember) => {
    const name = bIfy(member.user.displayName);
    member.setNickname(name);

    (bcafBot.client.channels.cache.get('982982312859947018') as VoiceChannel).setName(`🅱embers: ${member.guild.memberCount}`);

    if (!member.user.bot)
        member.roles.add('674011898047365158');

    const account = await BCAFAccount.fetch(member.id, false);
    account?.update({ _hidden: false });
};