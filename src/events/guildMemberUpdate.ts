import { GuildMember } from 'discord.js';

import {
    bIfy,
    isValidB
} from '../util/enforceB';
import { BCAFAccount } from '../account/bcafAccount';

export default async (_: GuildMember, newMember: GuildMember) => {
    const name = newMember.nickname || newMember.user.displayName;
    if (!isValidB(name)) {
        newMember.setNickname(bIfy(name)).catch();
        const account = await BCAFAccount.fetch(newMember.id);
        await account?.grantAchievement({
            name: 'Nuh Uh',
            description: 'Ändere deinen Nickname zu einem unzulässigen Nickname der korrigiert werden muss.'
        });
    }

    if (newMember.roles.cache.has('853011596153454663')) {
        const account = await BCAFAccount.fetch(newMember.id);
        if (account && !account.getData().hasBoostedBefore)
            await account?.update({ hasBoostedBefore: true });
    }
};