import {
    Client,
    Collection,
    GatewayIntentBits,
    REST,
    Routes
} from 'discord.js';
import { config } from 'dotenv';
import { readdirSync } from 'fs';
import { resolve } from 'path';

import { SlashCommand } from './slashCommand';
import { Component } from './component';
import { TimedEvent } from './timedEvent';

config();

class BcafBot {
    client: Client;
    slashCommands!: Collection<string, SlashCommand>;
    components!: Collection<string, Component<any>>;

    constructor () {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.MessageContent
            ]
        });

        this.registerInteractions();
        this.subscribeEvents();
        this.subscribeTimedEvents();

        this.client.login(process.env.DISCORD_TOKEN!);
    }

    private async registerInteractions () {
        // Slash Commands
        const slashCommands = readdirSync(resolve(__dirname, 'interactions/slashCommands/')).filter(file => file.endsWith('.js'));
        this.slashCommands = new Collection(slashCommands.map(slashCommand => [
            slashCommand.slice(0, -3).toLowerCase(),
            require(resolve(__dirname, `interactions/slashCommands/${slashCommand}`)).default
        ]));
        console.log('Registering application slash commands');
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);
        try {
            rest.put(Routes.applicationGuildCommands(process.env.APPLICATION_ID!, process.env.GUILD_ID!), {
                body: this.slashCommands.map(slashCommand => slashCommand.toJSON())
            });
            console.log(`Registered slash commands: ${this.slashCommands.map(slashCommand => slashCommand.name).join(', ')}`);
        } catch (error) {
            console.log('Failed to register slash commands:', error);
        }

        // Interaction Components
        const components = readdirSync(resolve(__dirname, 'interactions/components/')).filter(file => file.endsWith('.js'));
        this.components = new Collection(components.map(component => {
            const comp = require(resolve(__dirname, `interactions/components/${component}`)).default as Component<any>;
            return [ comp.prefix, comp ];
        }));
    }

    private subscribeEvents () {
        const events = readdirSync(resolve(__dirname, 'events/')).filter(file => file.endsWith('.js')).map(event => ({
            name: event.slice(0, -3),
            callback: require(resolve(__dirname, `events/${event}`)).default
        }));
        for (const event of events) {
            this.client.on(event.name, event.callback);
            console.log(`Subscribed Event ${event.name}`);
        }
    }

    private subscribeTimedEvents () {
        const timedEvents: TimedEvent[] = readdirSync(resolve(__dirname, 'timedEvents/')).filter(file => file.endsWith('.js')).map(timedEvent => require(resolve(__dirname, `timedEvents/${timedEvent}`)).default);
        for (const timedEvent of timedEvents) {
            const timeUntil = timedEvent.schedule();
            console.log(`Subscribed timed event. Time until: ${timeUntil}`);
        }
    }
}

export const bcafBot = new BcafBot();