import {
    ChannelType,
    Message,
    TextChannel
} from 'discord.js';
import { BCAFAccount } from '../account/bcafAccount';
import { bcafBot } from '../main';
import { TimedEvent } from '../timedEvent';
import { grantAchievement } from '../account/achievements';

async function fetchMessages (channel: TextChannel, timestamp: number) {
    const counts = new Map<string, { messageCount: number; messagesLast30Days: number; }>();
    const first = (await channel.messages.fetch({ limit: 1 })).first()!;
    let results: Message[] = [];
    let total = 0;
    let totalLast30Days = 0;

    do {
        results = [ ...(await channel.messages.fetch({
            limit: 100,
            before: results[results.length - 1] ? results[results.length - 1].id : first.id
        })).values() ];

        for (const message of results) {
            if (message.author.bot)
                continue;

            const cumulated = counts.get(message.author.id);
            counts.set(message.author.id, {
                messageCount: (cumulated?.messageCount || 0) + 1,
                messagesLast30Days: (cumulated?.messagesLast30Days || 0) + (message.createdTimestamp >= timestamp ? 1 : 0)
            });
            total += 1;
            if (message.createdTimestamp > timestamp)
                totalLast30Days += 1;
        }
    } while (results.length);

    return {
        counts,
        total,
        totalLast30Days
    };
}

const now = new Date();
export default new TimedEvent(
    new Date(now.getFullYear(), now.getMonth(), now.getDate(), 4),
    async () => {
        console.log('Updating message stats...');

        const cumulated = new Map<string, { messageCount: number; messagesLast30Days: number; }>();
        let cumulatedTotal = 0;
        let cumulatedTotalLast30Days = 0;

        const channels = await bcafBot.bcaf.channels.fetch();
        for (const channel of channels.values()) {
            if (!channel || channel.type != ChannelType.GuildText)
                continue;

            console.log(`Looking through ${channel.name}`);

            const now = new Date();
            now.setDate(now.getDate() - 30);
            const { counts, total, totalLast30Days } = await fetchMessages(channel, now.getTime());
            cumulatedTotal += total;
            cumulatedTotalLast30Days += totalLast30Days;

            for (const id of counts.keys()) {
                const stats = cumulated.get(id);
                cumulated.set(id, {
                    messageCount: (stats?.messageCount || 0) + counts.get(id)!.messageCount,
                    messagesLast30Days: (stats?.messagesLast30Days || 0) + counts.get(id)!.messagesLast30Days
                });
            }
        }

        for (const id of cumulated.keys()) {
            const stats = cumulated.get(id)!;
            const level = 1 + Math.sqrt(stats.messageCount * 0.5 - 0.5);
            const bcafShare = 0.25 * (stats.messageCount / cumulatedTotal) + 0.75 * (stats.messagesLast30Days / cumulatedTotalLast30Days);

            const account = await BCAFAccount.fetch(id);
            if (account) {
                console.log(`Updating user ${account.user.username}`);
                account.update({ profile: { messageStats: { messageCount: stats.messageCount, messagesLast30Days: stats.messagesLast30Days }, level } });

                if (stats.messagesLast30Days >= 2000)
                    grantAchievement(account, {
                        name: 'alive chat wtf???',
                        description: 'Schicke 2000 Nachrichten innerhalb von 30 Tagen.'
                    });
            }
        }
        console.log('Finished updating message stats');
    }
);