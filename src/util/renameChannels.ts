import { readFileSync } from 'fs';
import { resolve } from 'path';
import { GuildBasedChannel } from 'discord.js';

import { bcafBot } from '../main';

export function renameChannels (mappingPath: string) {
    const channelMapping = JSON.parse(readFileSync(resolve(__dirname, mappingPath)).toString());
    for (const [ channelId, newName ] of Object.entries<string>(channelMapping.channels)) {
        try {
            const channel = bcafBot.client.channels.cache.get(channelId) as GuildBasedChannel | null;
            if (!channel) {
                console.error(`Couldn't find channel: ${channelId}`);
                continue;
            }
            if (newName.length > 100)
                channel.setName('i forgor');
            else
                channel.setName(newName);
        } catch (error) {
            console.error(error);
        }
    }
}