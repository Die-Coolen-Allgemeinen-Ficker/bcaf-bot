import { GuildMember } from 'discord.js';

import {
    bIfy,
    isValidB
} from '../util/enforceB';

export default (oldMember: GuildMember, newMember: GuildMember) => {
    if (!isValidB(newMember.nickname))
        newMember.setNickname(bIfy(newMember.nickname));
};