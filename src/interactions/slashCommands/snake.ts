import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    TextChannel
} from 'discord.js';

import { bcafBot } from '../../main';
import { SlashCommand } from '../../slashCommand';
import { BCAFAccount } from '../../account/bcafAccount';

interface Position {
    x: number;
    y: number;
}

interface SessionData {
    channelId: string;
    userId: string;
    messageId: string;
}

export enum Direction {
    UP,
    RIGHT,
    DOWN,
    LEFT
}

function isEqual (pos1: Position, pos2: Position) {
    return pos1.x == pos2.x && pos1.y == pos2.y;
}

function includesPos (positions: Position[], pos: Position) {
    for (const position of positions)
        if (isEqual(position, pos))
            return true;
    return false;
}

function indexOfPos (positions: Position[], pos: Position) {
    for (let i = 0; i < positions.length; i++)
        if (isEqual(positions[i], pos))
            return i;
    return -1;
}

const gameOverMessages = [
    'How did you fuck up this badly?',
    'Quite frankly a skill issue',
    'cope seethe mald',
    'get good',
    '"es war lag!" ja ja stfu'
];

export class SnakeGame {
    private static components = (disabled: boolean) => [
        new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
            .setLabel('\u200b')
            .setStyle(ButtonStyle.Secondary)
            .setCustomId('SNAKE_BLANK1')
            .setDisabled(true),
            new ButtonBuilder()
            .setEmoji('⬆️')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('SNAKE_UP')
            .setDisabled(disabled),
            new ButtonBuilder()
            .setLabel('\u200b')
            .setStyle(ButtonStyle.Secondary)
            .setCustomId('SNAKE_BLANK2')
            .setDisabled(true),
        ),
        new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
            .setEmoji('⬅️')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('SNAKE_LEFT')
            .setDisabled(disabled),
            new ButtonBuilder()
            .setEmoji('⬇️')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('SNAKE_DOWN')
            .setDisabled(disabled),
            new ButtonBuilder()
            .setEmoji('➡️')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('SNAKE_RIGHT')
            .setDisabled(disabled),
        )
    ];
    static readonly activeGames = new Map<string, SnakeGame>();

    sessionData: SessionData;
    direction = Direction.RIGHT;
    hasPressedButton = false;
    private size: number;
    private snakePositions: Position[];
    private foodPosition: Position;
    private grow = false;
    private score = 0;
    private moveTimer: NodeJS.Timeout;

    constructor (sessionData: SessionData, size: number) {
        this.sessionData = sessionData;
        this.size = size;
        this.snakePositions = [
            {
                x: Math.floor(size * 0.25),
                y: Math.ceil(size * 0.5)
            },
            {
                x: Math.floor(size * 0.25) - 1,
                y: Math.ceil(size * 0.5)
            }
        ];
        this.foodPosition = {
            x: Math.ceil(size * 0.75),
            y: Math.ceil(size * 0.5)
        };
        this.moveTimer = setInterval(this.move.bind(this), 1500);
        this.updateEmbed(false);
    }

    private isValid (): boolean {
        for (let i = 1; i < this.snakePositions.length; i++)
            if (isEqual(this.snakePositions[i], this.snakePositions[0]))
                return false;
        if (this.snakePositions[0].x < 1 || this.snakePositions[0].x > this.size || this.snakePositions[0].y < 1 || this.snakePositions[0].y > this.size)
            return false;
        return true;
    }

    private move () {
        // Snake movement
        const newPosition: Position = {
            x: this.snakePositions[0].x,
            y: this.snakePositions[0].y
        };
        switch (this.direction) {
            case Direction.UP:
                newPosition.y++;
                break;
            case Direction.RIGHT:
                newPosition.x++;
                break;
            case Direction.DOWN:
                newPosition.y--;
                break;
            case Direction.LEFT:
                newPosition.x--;
                break;
        }
        this.snakePositions.unshift(newPosition);
        this.grow ? this.grow = false : this.snakePositions.pop();
        this.hasPressedButton = false;

        // Trigger a game over if the snake is in a losing position
        if (!this.isValid())
            return this.gameOver();

        // Grow the snake if it has eaten
        if (isEqual(this.snakePositions[0], this.foodPosition)) {
            this.grow = true;
            this.score++;
            this.generateFood();
        }
        this.updateEmbed(false);
    }
    
    private generateFood () {
        // Stops the Game if the snake has reached the maximum length
        if (this.score == 120)
            return this.gameOver();

        const randomPos = () => {
            let position = {
                x: Math.floor(Math.random() * this.size + 1),
                y: Math.floor(Math.random() * this.size + 1)
            };
            while (includesPos(this.snakePositions, position))
                position = {
                    x: Math.floor(Math.random() * this.size + 1),
                    y: Math.floor(Math.random() * this.size + 1)
                };
            return position;
        }

        this.foodPosition = randomPos();
    }

    private updateEmbed (gameOver: boolean) {
        let gameArea = '';
        for (let y = this.size; y >= 1; y--) {
            for (let x = 1; x <= this.size; x++) {
                const pos: Position = {x, y};
                if (isEqual(this.snakePositions[0], pos))
                    gameArea += '🟧';
                else if (includesPos(this.snakePositions, pos))
                    gameArea += (indexOfPos(this.snakePositions, pos) % 2 ? '🟩' : '🟨');
                else if (isEqual(this.foodPosition, pos))
                    gameArea += '🍎';
                else
                    gameArea += '⬛';
            }
            gameArea += '\n';
        }

        const user = bcafBot.client.users.cache.get(this.sessionData.userId)!;
        const embed = new EmbedBuilder()
        .setColor(`#36393f`)
        .setTitle('**Snake**')
        .addFields({ name: gameOver ? `**[GAME OVER]** ${gameOverMessages[Math.floor(Math.random() * gameOverMessages.length)]} | Score: ${this.score}\nSpieler: ${user.username}` : `Score: ${this.score}\nSpieler: ${user.username}`, value: gameArea })
        .setThumbnail(user.avatarURL()!);

        (bcafBot.client.channels.cache.get(this.sessionData.channelId) as TextChannel).messages.cache.get(this.sessionData.messageId)?.edit({ embeds: [ embed ], components: SnakeGame.components(gameOver) });
    }

    private async gameOver () {
        const account = await BCAFAccount.fetch(this.sessionData.userId);
        if (account && account.getData().profile.games.snakeHighscore < this.score)
            account.update({ profile: { games: { snakeHighscore: this.score } } });

        this.updateEmbed(true);
        clearInterval(this.moveTimer);
        SnakeGame.activeGames.delete(this.sessionData.userId);
    }
}

export default new SlashCommand()
.setName('snake')
.setDescription('Startet ein Snake Spiel')
.addBooleanOption(option =>
    option.setName('klein')
    .setDescription('Kleines Spielfeld für kleine Bildschirme (8x8)')
)
.setRun(async (interaction: ChatInputCommandInteraction) => {
    if (SnakeGame.activeGames.size) {
        interaction.reply({ content: 'Es läuft bereits ein Spiel.', ephemeral: true });
        return;
    }
    
    const small = interaction.options.getBoolean('klein');

    const embed = new EmbedBuilder()
    .setColor(`#36393f`)
    .setTitle('*Spiel wird gestartet...*');
    const messageId = await (bcafBot.client.channels.cache.get(interaction.channel!.id) as TextChannel).send({ embeds: [ embed ] }).then(message => message.id);

    SnakeGame.activeGames.set(interaction.user.id, new SnakeGame({
        channelId: interaction.channel!.id,
        userId: interaction.user.id,
        messageId: messageId!
    }, small ? 8 : 11));

    interaction.reply({ content: 'Das Spiel wurde gestartet.', ephemeral: true });
});