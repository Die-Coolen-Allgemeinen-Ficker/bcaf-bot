import { Message } from 'discord.js';

export default (message: Message) => {
    // nword detector
    if (message.content.match(/n+(i|e|1)+g+r*(a|e|o|ö)+r*/i)) {
        // TBA
    }

    if (!message.author.bot && Math.random() < 0.01)
        message.react('🅱️');
};