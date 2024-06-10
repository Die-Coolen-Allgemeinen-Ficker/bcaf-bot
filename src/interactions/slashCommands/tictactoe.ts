import {
    ActionRowBuilder,
    ButtonBuilder,
    ChatInputCommandInteraction,
    CommandInteraction,
    EmbedBuilder,
    TextChannel,
    User
} from 'discord.js';

import {
    MultiplayerGame,
    BasePlayerType,
    Game
} from '../../games/multiplayerGame';
import { SlashCommand } from '../../slashCommand';

interface Position {
    x: number;
    y: number;
}

export enum Color {
    GRAY = 2,
    BLUE = 1,
    RED = 4
}

interface TicTacToePlayer extends BasePlayerType {
    positions: Position[];
    color: Color;
}

export class TicTacToeGame extends MultiplayerGame<TicTacToePlayer> {
    private readonly components = (disabled: boolean) => {
        const components: ActionRowBuilder<ButtonBuilder>[] = [];

        for (let y = 0; y < this.size; y++) {
            components.push(
                new ActionRowBuilder<ButtonBuilder>()
            );
            for (let x = 0; x < this.size; x++) {
                const disableButton = disabled || Boolean(this.positions.get(`${x}_${y}`));
                components[y].addComponents(
                    new ButtonBuilder()
                    .setLabel('\u200b')
                    .setStyle((this.positions.get(`${x}_${y}`) || Color.GRAY) as number)
                    .setCustomId(`TICTACTOEBUTTON_${x},${y}`)
                    .setDisabled(disableButton)
                );
            }
        }

        return components;
    };

    private size: number;
    positions = new Map<string, Color>();

    constructor (player1: User, player2: User, interaction: CommandInteraction, channel: TextChannel, size: number) {
        super(player1, player2, Game.TICTACTOE, interaction, channel);
        this.size = size;
    }

    hasRow (positions: Position[]) {
        for (let i = 0; i < this.size; i++) {
            const horizontalRow = positions.filter(position => position.x == i).sort((a, b) => a.y - b.y);
            if (horizontalRow.length >= this.size && horizontalRow.every((position, i, positions) => positions[i - 1]?.y + 1 == position.y || !positions[i - 1]))
                return true;
            
            const verticalRow = positions.filter(position => position.y == i).sort((a, b) => a.x - b.x);
            if (verticalRow.length >= this.size && verticalRow.every((position, i, positions) => positions[i - 1]?.x + 1 == position.x || !positions[i - 1]))
                return true;
        }
    
        const ascendingDiagonal = positions.filter(position => position.x == position.y).sort((a, b) => a.x - b.x);
        if (ascendingDiagonal.length >= this.size && ascendingDiagonal.every((position, i) => position.x == i))
            return true;
        
        const descendingDiagonal = positions.filter(position => position.x == this.size - position.y - 1).sort((a, b) => a.x - b.x);
        if (descendingDiagonal.length >= this.size && descendingDiagonal.every((position, i) => position.x == i))
            return true;
    
        return false;
    }

    gameInit () {
        this.player1!.color = Color.BLUE;
        this.player2!.color = Color.RED;
        this.player1!.positions = [];
        this.player2!.positions = [];
    }

    turn (...buttonData: number[]) {
        const position: Position = {
            x: buttonData[0],
            y: buttonData[1]
        };
        this.positions.set(`${position.x}_${position.y}`, this.currentTurn!.color);
        this.currentTurn!.positions.push(position);

        if (this.positions.size == this.size ** 2) {
            this.winner = null;
            return this.gameOver();
        }

        if (this.hasRow(this.currentTurn!.positions)) {
            this.winner = this.currentTurn!.user;
            return this.gameOver();
        }
        
        this.switchTurn();
        this.updateEmbeds();
    }

    updateEmbeds () {
        const embed = new EmbedBuilder()
        .setColor(`#36393f`)
        .setTitle('Tic Tac Toe')
        .setThumbnail(this.winner?.avatarURL()! || this.currentTurn!.user.avatarURL()!)
        .setDescription(this.stopGame ? `${this.winner === null ? 'Es ist ein Unentschieden' : `${this.winner!.username} hat gewonnen.`}` : `${this.currentTurn!.color == Color.BLUE ? '🟦' : ''} **${this.currentTurn!.user.username}** ist dran.`);
        this.player1!.message.edit({ embeds: [ embed ], components: this.components(this.stopGame) });
    }

    gameOver () {
        this.stopGame = true;
        this.updateEmbeds();
        this.cleanup();
    }
}

export default new SlashCommand()
.setName('tictactoe')
.setDescription('Startet ein Tic Tac Toe Spiel')
.addUserOption(option =>
    option.setName('spieler')
    .setDescription('Die Person, mit der du spielen willst')
    .setRequired(true)
)
.addNumberOption(option =>
    option.setName('spielfeld')
    .setDescription('Bestimmt die Spielfeldgröße')
    .addChoices(
        { name: '3 x 3', value: 3 },
        { name: '4 x 4', value: 4 },
        { name: '5 x 5', value: 5 }
    )
    .setRequired(true)
)
.setRun(async (interaction: ChatInputCommandInteraction) => {
    const player1 = interaction.user;
    const player2 = interaction.options.getUser('spieler', true);
    const size = interaction.options.getNumber('spielfeld', true);

    await interaction.deferReply({ ephemeral: true });

    new TicTacToeGame(
        player1,
        player2,
        interaction,
        interaction.channel as TextChannel,
        size
    );
});