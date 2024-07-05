import {
    Message,
    TextChannel
} from 'discord.js';

import { BCAFAccount } from '../account/bcafAccount';
import { coincidenceIThinkNot } from '../secretAchievements';

const pings: { [userId: string]: number | undefined } = {};

export default async (message: Message) => {
    if (message.author.bot)
        return;

    // N-Word counter
    if (message.content.match(/n+(i|e|1)+g+r*(a|e|o|ö)+r*/i)) {
        const account = await BCAFAccount.fetch(message.author.id);
        await account?.update({ profile: { messageStats: { nWordCount: account.getData().profile.messageStats.nWordCount + 1 } } });
    }

    // 🅱️ reaction count and 🅱️lessed achievement
    if (Math.random() <= 0.01) {
        message.react('🅱️');
        const account = await BCAFAccount.fetch(message.author.id);
        if (account) {
            await account.update({ profile: { messageStats: { bReactionCount: account.getData().profile.messageStats.bReactionCount + 1 } } });
            if (account.getData().profile.messageStats.bReactionCount == 100)
                await account.grantAchievement({
                    name: '🅱️lessed',
                    description: 'Erhalte 100 🅱️ Reactions vom BCAF Bot.'
                }, message.channel as TextChannel);
        }
    }

    // Get banned challenge achievement
    if (message.mentions.users.has('549256464083058711') || message.mentions.users.has('432930043199750164')) {
        if (!pings[message.author.id])
            pings[message.author.id] = 0;
        pings[message.author.id]! += 1;
        setTimeout(() => {
            pings[message.author.id]! -= 1;
        }, 30000);
        if (pings[message.author.id] == 19) {
            const account = await BCAFAccount.fetch(message.author.id);
            await account?.grantAchievement({
                name: 'Get banned challenge',
                description: 'Pinge einen Admin 19 mal innerhalb von 30 Sekunden.'
            }, message.channel as TextChannel);
        }
    }

    // Reverse Engineer achievement
    if (message.content.includes('haiiii pwease give me the reverse engineer achievement :3 5KDMrRmg3U5vp2H0D7ZtXCm8apMywB3S-w3RsbVd4Nvt9TIxaqT6Oa0vVhtuP_McrGjV5m2jyFy2usnZXaeEmA')) {
        await message.delete();
        const account = await BCAFAccount.fetch(message.author.id);
        await account?.grantAchievement({
            name: 'Reverse Engineer',
            description: 'Finde im Source Code auf Github heraus wie man dieses Achievement kriegt.'
        }, message.channel as TextChannel);
    }

    // How??? achievement
    if ((message.channel as TextChannel).parent?.id == '890254720965423114') {
        const account = await BCAFAccount.fetch(message.author.id);
        await account?.grantAchievement({
            name: 'How???',
            description: 'Schreibe in einen archivierten Kanal.'
        }, message.channel as TextChannel);
    }

    // Reviving Chat achievement
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const lastMessageTimestamp = (await message.channel.messages.fetch({
        limit: 1,
        before: message.channel.lastMessageId!
    })).first()?.createdTimestamp;
    if ((message.channel as TextChannel).parent?.id != '890254720965423114' && lastMessageTimestamp && lastMessageTimestamp < threeMonthsAgo.getTime()) {
        const account = await BCAFAccount.fetch(message.author.id);
        await account?.grantAchievement({
            name: 'Reviving Chat',
            description: 'Schicke eine Nachricht in einen Kanal der seit drei Monaten tot ist.'
        }, message.channel as TextChannel);
    }

    // Secret achievements
    await coincidenceIThinkNot(message);
};