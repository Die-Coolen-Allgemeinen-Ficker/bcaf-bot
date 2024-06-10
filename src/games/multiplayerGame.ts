import {
    CommandInteraction,
    Message,
    TextChannel,
    User
} from 'discord.js';
import { Invite } from './invite';

export enum Game {
    TICTACTOE = 'Tic Tac Toe'
}

export interface BasePlayerType {
    user: User;
    message: Message;
}

export abstract class MultiplayerGame<PlayerType extends BasePlayerType> {
    protected player1?: PlayerType;
    protected player2?: PlayerType;
    protected winner?: User | null;
    protected stopGame = false;
    private timeout?: NodeJS.Timeout;
    currentTurn?: PlayerType;

    static readonly activeGames = new Map<string, any>();
    static readonly currentPlayers = new Map<string, Game>();

    constructor (player1: User, player2: User, game: Game, interaction: CommandInteraction, channel?: TextChannel) {
        if (player2.bot) {
            interaction.editReply({ content: 'Du kannst nicht gegen Bots spielen.' });
            return;
        }
    
        if (player1.id == player2.id) {
            interaction.editReply({ content: 'Du kannst nicht gegen dich Selbst spielen.' });
            return;
        }
        
        if (MultiplayerGame.currentPlayers.has(player1.id)) {
            interaction.editReply({ content: 'Du bist bereits in einem Spiel.' });
            return;
        }
        
        if (MultiplayerGame.currentPlayers.has(player2.id)) {
            interaction.editReply({ content: `**${player2.username}** spielt gerade **${MultiplayerGame.currentPlayers.get(player2.id)}**.` });
            return;
        }

        interaction.editReply({ content: 'Die Einladung wurde geschickt.' });

        const invite = new Invite(player1, player2, game, channel);
        invite.on('reply', messages => {
            if (!messages)
                return;

            MultiplayerGame.activeGames.set(`${player1.id} ${player2.id}`, this);
            MultiplayerGame.currentPlayers.set(player1.id, game);
            MultiplayerGame.currentPlayers.set(player2.id, game);

            this.player1 = {
                user: player1,
                message: messages[0]
            } as PlayerType;
            this.player2 = {
                user: player2,
                message: messages[messages.length - 1]
            } as PlayerType;

            this.gameInit();
            this.timeout = setTimeout(this.turnTimeout.bind(this), 120000);
            this.currentTurn = this.player1;
            this.updateEmbeds();
        });
    }

    protected switchTurn () {
        this.timeout!.refresh();

        if (this.currentTurn!.user.id == this.player1!.user.id)
            this.currentTurn = this.player2;
        else
            this.currentTurn = this.player1;
    }

    protected cleanup () {
        clearTimeout(this.timeout!);
        MultiplayerGame.activeGames.delete(`${this.player1!.user.id} ${this.player2!.user.id}`);
        MultiplayerGame.currentPlayers.delete(this.player1!.user.id);
        MultiplayerGame.currentPlayers.delete(this.player2!.user.id);
    }

    private turnTimeout () {
        if (this.currentTurn!.user.id == this.player1!.user.id)
            this.winner = this.player2!.user;
        else
            this.winner = this.player1!.user;
        this.currentTurn!.user.send({ content: 'Du hast länger als zwei Minuten für deinen Zug gebraucht und hast verloren.' }).catch();

        this.gameOver();
    }

    static getGame (userId: string) {
        for (const [key, value] of MultiplayerGame.activeGames)
            if (key.includes(userId))
                return value;
    }

    getPlayer (userId: string) {
        if (userId == this.player1!.user.id)
            return this.player1;
        if (userId == this.player2!.user.id)
            return this.player2;
    }

    abstract gameInit (): void;
    abstract turn (): void;
    abstract turn (...buttonData: number[]): void;
    abstract updateEmbeds (player?: PlayerType): void;
    abstract gameOver (): void;
}