import { GuildChannel } from 'discord.js';

import {
    bIfy,
    isValidB
} from '../util/enforceB';

export default (oldChannel: GuildChannel, newChannel: GuildChannel) => {
    const date = new Date();
    if (!isValidB(newChannel.name) && !(date.getMonth() == 3 && date.getDate() == 1))
        newChannel.setName(bIfy(newChannel.name));
};