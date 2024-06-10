import { ButtonInteraction } from 'discord.js';

import { Component } from '../../component';
import {
    Direction,
    SnakeGame
} from '../slashCommands/snake';

export default new Component<ButtonInteraction>()
.setPrefix('SNAKE')
.setRun(async (interaction: ButtonInteraction, suffix: string) => {
    const game = SnakeGame.activeGames.get(interaction.user.id);
        // Prohibits several inputs in the span of a single game update
        if (!game?.hasPressedButton) {
            if (game?.sessionData.messageId == interaction.message.id) {
                switch (suffix) {
                    case 'UP':
                        if (game.direction != Direction.DOWN)
                            game.direction = Direction.UP;
                        break;
                    case 'RIGHT':
                        if (game.direction != Direction.LEFT)
                            game.direction = Direction.RIGHT;
                        break;
                    case 'DOWN':
                        if (game.direction != Direction.UP)
                            game.direction = Direction.DOWN;
                        break;
                    case 'LEFT':
                        if (game.direction != Direction.RIGHT)
                            game.direction = Direction.LEFT;
                        break;
                }
                game.hasPressedButton = true;
                interaction.deferUpdate();
            } else
                interaction.reply({ content: 'Dieses Snake Spiel wurde nicht von dir gestartet.', ephemeral: true });
        } else
            interaction.deferUpdate();
});