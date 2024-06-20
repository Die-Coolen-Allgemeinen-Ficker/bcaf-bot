import { GuildMember } from 'discord.js';

import {
    bIfy,
    isValidB
} from '../util/enforceB';
import { BCAFAccount } from '../account/bcafAccount';

export default async (oldMember: GuildMember, newMember: GuildMember) => {
    const name = newMember.nickname || newMember.user.displayName;
    if (!isValidB(name))
        newMember.setNickname(bIfy(name));

    if (oldMember.avatarURL() != newMember.avatarURL() || oldMember.user.displayName != newMember.user.displayName) {
        const account = await BCAFAccount.fetch(newMember.user.id);
        if (account)
            account.update({ avatarUrl: newMember.avatarURL() || '', name: newMember.user.displayName || newMember.user.username });
    }
};