const { SlashCommand } = require('slash-create');
const { socket } = require('../lib/socket.js');

module.exports = class GamesCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: 'games',
      description: 'show list active games',
    });
  }

  async run(ctx) {
    const lobby = socket.channel('lobby');

    lobby.onClose(() => {
      ctx.send('Close connection to lobby');
    });

    lobby.join()
      .receive('ok', ({ active_games: activeGames }) => {
        ctx.send('Establish connection to lobby');
        const activeGameIds = activeGames
          .reduce((acc, { id, state }) => {
            if (state === 'waiting_opponent') return acc;

            return [...acc, id];
          }, [])
          .join(' ');
        ctx.send(`list of active games [${activeGameIds}]`);
        console.log(activeGames);
        lobby.leave();
      })
      .receive('timeout', () => {
        ctx.send('Networking issue...');
      })
      .receive('error', (err) => {
        ctx.send(`there was an error with the connection! ${JSON.stringify(err)}`);
      });
  }
};
