const { SlashCommand } = require('slash-create');
const { socket } = require('../lib/socket.js');

module.exports = class BotDisconnectCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: 'disconnect',
      description: 'disconnect socket connection to the codebattle server',
    });
  }

  async run() {
    socket.disconnect(() => {}, 0, 'Closing connection');
  }
};
