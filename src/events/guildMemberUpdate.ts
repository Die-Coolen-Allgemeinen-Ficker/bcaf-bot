import { GuildMember } from 'discord.js';

import {
    bIfy,
    isValidB
} from '../util/enforceB';

export default (_: GuildMember, newMember: GuildMember) => {
    const name = newMember.nickname || newMember.user.displayName;
    if (!isValidB(name))
        newMember.setNickname(bIfy(name));
};