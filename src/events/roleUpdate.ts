import { Role } from 'discord.js';

import {
    bIfy,
    isValidB
} from '../util/enforceB';

export default (oldRole: Role, newRole: Role) => {
    if (!isValidB(newRole.name))
        newRole.setName(bIfy(newRole.name));
};