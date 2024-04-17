import { ButtonInteraction } from 'discord.js';

import { Component } from '../../component';
import { Invite } from '../../games/invite';

export default new Component<ButtonInteraction>()
.setPrefix('INVITE')
.setRun(async (interaction: ButtonInteraction, suffix: string) => {
    const invite = Invite.pendingInvites.get(interaction.message.id)!;
    if (interaction.user.id != invite.receiver.id) {
        await interaction.reply({ content: 'Diese Einladung ist nicht für dich.', ephemeral: true });
        return;
    }
    switch (suffix) {
        case 'ACCEPT':
            invite.accept();
            break;
        case 'DECLINE':
            invite.decline();
            break;
    }
});