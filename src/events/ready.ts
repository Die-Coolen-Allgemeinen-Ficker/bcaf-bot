import { ActivityType } from 'discord.js';

import { bcafBot } from '../main';
import { config } from 'dotenv';

config();

export default () => {
    console.log('BCAF Bot is ready.');

    if (process.env.MODE == 'DEBUG') {
        bcafBot.client.user!.setPresence({
            activities: [
                {
                    type: ActivityType.Competing,
                    name: 'Development Hell'
                }
            ],
            status: 'idle'
        });
    } else {
        bcafBot.client.user!.setPresence({
            activities: [
                {
                    type: ActivityType.Listening,
                    name: 'Red Sun in the Sky'
                }
            ],
            status: 'dnd'
        });
    }
};