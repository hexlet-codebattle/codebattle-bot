const { SlashCommand } = require('slash-create');
const { socket } = require('../lib/socket.js');

module.exports = class BotReconnectCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: 'reconnect',
      description: 'reconnect socket connection to the codebattle server',
    });
  }

  async run() {
    socket.connect();
  }
};
