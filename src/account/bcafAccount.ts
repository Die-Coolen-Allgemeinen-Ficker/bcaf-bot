import { EmbedBuilder, TextChannel, User } from 'discord.js';
import { request } from 'https';
import { config } from 'dotenv';

import { bcafBot } from '../main';

config();

function mergeObjects (obj1: any, obj2: RecursivePartial<any>) {
    for (const key of Object.keys(obj1)) {
        if (obj2[key] === undefined)
            continue;

        if (typeof obj2[key] == 'object' && !Array.isArray(obj2[key]))
            mergeObjects(obj1[key], obj2[key]);
        else
            obj1[key] = obj2[key];
    }
}

export interface Achievement {
    name: string;
    description: string;
    timestamp?: number;
}

export interface AccountData {
    userId: string;
    name: string;
    avatarUrl: string;
    profile: {
        level: number;
        color: string;
        backgroundImageUrl: string;
        foregroundImageUrl: string;
        minecraftUuid: string | null;
        socialCredit: {
            amount: number;
            tier: string;
        };
        games: {
            snakeHighscore: number;
            tictactoeWins: number;
        };
        messageStats: {
            nWordCount: number;
            bReactionCount: number;
            messageCount: number;
            messagesLast30Days: number;
            yapOMeter: number;
        };
        achievements: Achievement[];
    };
    bcafCoin: number;
    hasBoostedBefore: boolean;
    hasPlayedLeagueOfLegends: boolean;
    bcafJoinTimestamp: number;
    legacy: boolean;
    createdTimestamp: number;
    updatedTimestamp: number;
    _hidden: boolean;
}

type RecursivePartial<T> = { [key in keyof T]?: T[key] extends object ? RecursivePartial<T[key]> : T[key] };

export class BCAFAccount {
    private data: AccountData;
    user: User;

    private constructor (userId: string, data: AccountData) {
        this.user = bcafBot.client.users.cache.get(userId)!;
        this.data = data;
    }

    static async fetch (userId: string, forceCreate: boolean = true) {
        const member = await bcafBot.bcaf.members.fetch(userId).catch(_ => null);
        const user = member?.user;

        if (!user || user.bot || !member)
            return null;

        const accounts = bcafBot.bcafDb.collection('accounts');
        let accountData = (await accounts.findOne({ userId: userId })) as unknown as AccountData | null;

        if (!accountData) {
            if (!forceCreate)
                return null;

            accountData = {
                userId,
                name: user.globalName || user.username,
                avatarUrl: user.avatarURL(),
                profile: {
                    level: 0,
                    color: '#000000',
                    backgroundImageUrl: 'https://die-coolen-allgemeinen-ficker.github.io/assets/images/wallpapers/3.png',
                    foregroundImageUrl: '',
                    minecraftUuid: null,
                    socialCredit: {
                        amount: 1000,
                        tier: 'A'
                    },
                    games: {
                        snakeHighscore: 0,
                        tictactoeWins: 0
                    },
                    messageStats: {
                        nWordCount: 0,
                        bReactionCount: 0,
                        messageCount: 0,
                        messagesLast30Days: 0,
                        yapOMeter: 0
                    },
                    achievements: []
                },
                bcafCoin: 0,
                hasBoostedBefore: false,
                hasPlayedLeagueOfLegends: false,
                bcafJoinTimestamp: member.joinedTimestamp!,
                legacy: false,
                createdTimestamp: Date.now(),
                updatedTimestamp: Date.now(),
                _hidden: false
            } as AccountData;

            await accounts.insertOne(accountData);
        }

        const account = new BCAFAccount(userId, accountData);
        return account;
    }

    static async loadLegacyData (data: any) {
        const accountData: AccountData[] = [];

        for (const userId of Object.keys(data.users)) {
            const member = await bcafBot.bcaf.members.fetch(userId).catch(_ => null);
            const user = member?.user;

            if (!user || user.bot || !member)
                continue;

            const accounts = bcafBot.bcafDb.collection('accounts');
            const result = (await accounts.findOne({ userId: userId })) as unknown as AccountData | null;

            if (result)
                continue;

            const legacyProfile = data.users[userId];

            const uuid = await new Promise<string>(resolve => {
                const req = request(`https://api.mojang.com/users/profiles/minecraft/${legacyProfile.mc_username}?at=${data.timestamp}`, response => {
                    let data = '';
                    response.on('data', chunk => {
                        data += chunk;
                    });
                    response.on('end', () => {
                        resolve(JSON.parse(data).id);
                    });
                });
                req.end();
            })

            accountData.push({
                userId,
                name: user.globalName || user.username,
                avatarUrl: user.avatarURL(),
                profile: {
                    level: 0,
                    color: '#000000',
                    backgroundImageUrl: 'https://die-coolen-allgemeinen-ficker.github.io/assets/images/wallpapers/3.png',
                    foregroundImageUrl: '',
                    minecraftUuid: uuid,
                    socialCredit: {
                        amount: legacyProfile.credit,
                        tier: legacyProfile.tier
                    },
                    games: {
                        snakeHighscore: legacyProfile.snakeHighscore,
                        tictactoeWins: 0
                    },
                    messageStats: {
                        nWordCount: 0,
                        bReactionCount: 0,
                        messageCount: 0,
                        messagesLast30Days: 0,
                        yapOMeter: 0
                    },
                    achievements: []
                },
                bcafCoin: 0,
                hasBoostedBefore: false,
                hasPlayedLeagueOfLegends: false,
                bcafJoinTimestamp: member.joinedTimestamp!,
                legacy: true,
                createdTimestamp: Date.now(),
                updatedTimestamp: Date.now(),
                _hidden: false
            } as AccountData);
        }

        const accounts = bcafBot.bcafDb.collection('accounts');
        await accounts.insertMany(accountData);
    }

    getData () {
        return JSON.parse(JSON.stringify(this.data)) as AccountData;
    }

    async update (data: RecursivePartial<AccountData>) {
        if (process.env.MODE! == 'DEBUG')
            return console.log(`Update ${this.user.username} with: `, data);

        const accounts = bcafBot.bcafDb.collection('accounts');
        const accountData = (await accounts.findOne({ userId: this.user.id })) as unknown as AccountData;
        mergeObjects(accountData, data);
        accountData.updatedTimestamp = Date.now();
        this.data = accountData;
        await accounts.replaceOne({ userId: this.user.id }, this.data);
    }

    async grantAchievement (achievement: Achievement, channel?: TextChannel) {
        if (process.env.MODE! == 'DEBUG')
            return console.log(`Grant Achievement to ${this.user.username}: `, achievement);

        achievement.timestamp = Date.now();
    
        if (!channel)
            channel = bcafBot.bcaf.channels.cache.get('555729962188144662') as TextChannel;
    
        if (this.getData().profile.achievements.some(a => a.name == achievement.name))
            return;
    
        await this.update({ profile: { achievements: [ ...this.getData().profile.achievements, achievement ] } });
        const embed = new EmbedBuilder()
        .setTitle('Achievement')
        .setDescription(`${this.user.toString()}, du hast ein Achievement bekommen!\n**${achievement.name}** - ${achievement.description}`)
        .setColor('#2b2d31');
        channel.send({ embeds: [ embed ] });
    }
}