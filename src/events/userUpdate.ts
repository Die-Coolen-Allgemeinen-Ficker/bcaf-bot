import { User } from 'discord.js';

import { BCAFAccount } from '../account/bcafAccount';

export default async (oldUser: User, newUser: User) => {
    if (oldUser.avatarURL() != newUser.avatarURL() || oldUser.displayName != newUser.displayName) {
        const account = await BCAFAccount.fetch(newUser.id);
        await account?.update({ avatarUrl: newUser.avatarURL() || '', name: newUser.displayName || newUser.username });
    }
};