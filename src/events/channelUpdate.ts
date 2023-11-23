import { GuildChannel } from 'discord.js';

import {
    bIfy,
    isValidB
} from '../util/enforceB';

export default (oldChannel: GuildChannel, newChannel: GuildChannel) => {
    if (!isValidB(newChannel.name))
        newChannel.setName(bIfy(newChannel.name));
};