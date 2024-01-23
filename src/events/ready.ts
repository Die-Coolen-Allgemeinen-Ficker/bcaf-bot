import { ActivityType } from 'discord.js';

import { bcafBot } from '../main';

export default () => {
    console.log('BCAF Bot is ready.');

    bcafBot.client.user!.setPresence({
        activities: [
            {
                type: ActivityType.Listening,
                name: 'Red Sun in the Sky'
            }
        ],
        status: 'dnd'
    });
};