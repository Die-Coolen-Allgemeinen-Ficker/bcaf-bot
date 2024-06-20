import { Presence } from 'discord.js';

import { BCAFAccount } from '../account/bcafAccount';

export default async (_: Presence, newPresence: Presence) => {
    if (newPresence.user?.bot)
        return;

    if (newPresence.activities.some(activity => activity.name == 'League of Legends')) {
        const account = await BCAFAccount.fetch(newPresence.userId);
        if (account && !account.getData().hasPlayedLeagueOfLegends)
            account.update({ hasPlayedLeagueOfLegends: true });
    }
};