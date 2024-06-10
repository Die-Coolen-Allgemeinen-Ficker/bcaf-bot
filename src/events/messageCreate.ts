import { Message, TextChannel } from 'discord.js';

import { BCAFAccount } from '../account/bcafAccount';
import { grantAchievement } from '../account/achievements';

const pings: { [userId: string]: number | undefined } = {};

export default async (message: Message) => {
    if (message.mentions.users.has('549256464083058711') || message.mentions.users.has('432930043199750164')) {
        if (!pings[message.author.id])
            pings[message.author.id] = 0;
        pings[message.author.id]! += 1;
        setTimeout(() => {
            pings[message.author.id]! -= 1;
        }, 30000);
        if (pings[message.author.id] == 19) {
            const account = await BCAFAccount.fetch(message.author.id);
            if (account)
                await grantAchievement(account, {
                    name: 'Get banned challenge',
                    description: 'Pinge einen Admin 19 mal innerhalb von 30 Sekunden.'
                }, message.channel as TextChannel);
        }
    }

    if (message.content.match(/n+(i|e|1)+g+r*(a|e|o|ö)+r*/i)) {
        const account = (await BCAFAccount.fetch(message.author.id))!;
        account.update({ profile: { messageStats: { nWordCount: account.getData().profile.messageStats.nWordCount + 1 } } });
    }

    if (!message.author.bot && Math.random() < 0.01) {
        message.react('🅱️');
        const account = (await BCAFAccount.fetch(message.author.id));
        if (account) {
            await account.update({ profile: { messageStats: { bReactionCount: account.getData().profile.messageStats.bReactionCount + 1 } } });
            if (account.getData().profile.messageStats.bReactionCount == 100)
                await grantAchievement(account, {
                    name: '🅱️lessed',
                    description: 'Erhalte 100 🅱️ Reactions vom BCAF Bot.'
                }, message.channel as TextChannel);
        }
    }
};