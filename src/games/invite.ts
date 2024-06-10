import { EventEmitter } from 'events';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    Message,
    TextChannel,
    User
} from 'discord.js';

import { Game } from './multiplayerGame';

export class Invite extends EventEmitter {
    private static readonly components = (disabled: boolean) => [
        new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
            .setLabel('Annehmen')
            .setStyle(ButtonStyle.Success)
            .setCustomId('INVITE_ACCEPT')
            .setDisabled(disabled),
            new ButtonBuilder()
            .setLabel('Ablehnen')
            .setStyle(ButtonStyle.Danger)
            .setCustomId('INVITE_DECLINE')
            .setDisabled(disabled)
        )
    ];

    private sender: User;
    receiver: User;
    private game: Game;
    private channel?: TextChannel;
    inviteTimeout?: NodeJS.Timeout;
    message?: Message;

    static readonly pendingInvites = new Map<string, Invite>();

    constructor (sender: User, receiver: User, game: Game, channel?: TextChannel) {
        super();

        this.sender = sender;
        this.receiver = receiver;
        this.game = game;
        this.channel = channel;
        
        this.setup();
    }

    private async setup () {
        const embed = new EmbedBuilder()
        .setColor(`#36393f`)
        .setTitle(`Einladung von ${this.sender.username}`)
        .setDescription(`**${this.sender.username}** möchte mit dir ${this.game} spielen, du hast 30 Sekunden Zeit zum annehmen.`)
        .setThumbnail(this.sender.avatarURL()!);

        const channel = this.channel || this.receiver;
        this.message = await channel?.send({ content: `<@${this.receiver.id}>`, embeds: [ embed ], components: Invite.components(false) }).catch();

        if (!this.message) {
            this.emit('error');
            this.sender.send('Die Einladung konnte nicht erstellt werden.').catch();
            return;
        }

        this.inviteTimeout = setTimeout(() => {
            embed.setTitle(`Einladung von ${this.sender.username} [Abgelaufen]`);
            this.message!.edit({ content: `<@${this.receiver.id}>`, embeds: [ embed ], components: Invite.components(true) });
            this.sender.send(`<@${this.sender.id}>, ${this.receiver.username} hat die Einladung nicht rechtzeitig angenommen.`).catch();

            this.emit('timeout');
            Invite.pendingInvites.delete(this.message!.id);
        }, 30000);

        Invite.pendingInvites.set(this.message.id, this);
    }

    async accept () {
        const embed = new EmbedBuilder()
        .setColor(`#36393f`)
        .setTitle(this.game)
        .setDescription('*Spiel wird gestartet...*');

        clearTimeout(this.inviteTimeout!);

        if (this.channel) {
            const message = await this.channel.send({ embeds: [ embed ] });
            this.emit('reply', [ message ]);
        } else {
            const player1Message = await this.sender.send({ embeds: [ embed ] }).catch();
            const player2Message = await this.receiver.send({ embeds: [ embed ] }).catch();
            this.emit('reply', [ player1Message, player2Message ]);
        }

        this.message!.delete();
        Invite.pendingInvites.delete(this.message!.id);
    }

    decline () {
        const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle(':x: Einladung Abgelehnt')
        .setDescription(`**${this.receiver.username}** hat deine Einladung abgelehnt.`);

        clearTimeout(this.inviteTimeout!);

        this.sender.send({ embeds: [ embed ] }).catch();
        this.message!.delete();

        this.emit('reply');
        Invite.pendingInvites.delete(this.message!.id);
    }
}