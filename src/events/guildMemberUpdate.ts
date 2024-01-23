import { GuildMember } from 'discord.js';

import {
    bIfy,
    isValidB
} from '../util/enforceB';

export default (oldMember: GuildMember, newMember: GuildMember) => {
    const name = newMember.nickname || newMember.user.displayName;
    if (!isValidB(name))
        newMember.setNickname(bIfy(name));
};