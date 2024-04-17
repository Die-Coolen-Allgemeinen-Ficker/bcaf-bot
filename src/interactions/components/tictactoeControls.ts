import { ButtonInteraction } from 'discord.js';

import { Component } from '../../component';
import { TicTacToeGame } from '../slashCommands/tictactoe';

export default new Component<ButtonInteraction>()
.setPrefix('TICTACTOEBUTTON')
.setRun(async (interaction: ButtonInteraction, suffix: string) => {
    const game = TicTacToeGame.getGame(interaction.user.id);
    if (!game) {
        await interaction.deferUpdate();
        return;
    }

    const player = game.currentTurn!;

    if (player.user.id != interaction.user.id) {
        await interaction.reply({ content: 'Du bist nicht dran.', ephemeral: true });
        return;
    }

    interaction.deferUpdate();
    const buttonPosition = suffix.split(',').map(n => parseInt(n));
    game.turn(...buttonPosition);
});