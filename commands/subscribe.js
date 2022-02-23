const { SlashCommand, CommandOptionType } = require('slash-create');
const _ = require('lodash');
const { stripIndent } = require('common-tags');

const { socket, socketMessages } = require('../lib/socket.js');
const { dispatch, actions, selectors } = require('../lib/state.js');
const { sendAll, send } = require('../lib/utils.js');

module.exports = class GameSubscribeCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: 'subscribe',
      description: 'Subscribe discord channel or your\'s dm to active game events',
      options: [{
        type: CommandOptionType.INTEGER,
        name: 'game_id',
        description: 'Id of active game you want to subscribe',
      }],
    });
  }

  hasConnection(game, { channelId }) {
    return game.subscribers.some(({ id }) => id === channelId);
  }

  async run(ctx) {
    const { game_id: gameId } = ctx.options;
    const foundedGame = selectors.getActiveGame(gameId);

    if (foundedGame && this.hasConnection(foundedGame, ctx)) {
      ctx.send('Already connect to the game');
      return;
    }

    if (foundedGame) {
      dispatch(actions.addSubscriber({
        gameId,
        subscriber: ctx.id,
      }));
      ctx.send(`Establish connection with game #${gameId}. status: ${foundedGame.status}`);
      return;
    }

    const gameChannel = socket.channel(`game:${gameId}`);
    const params = { id: gameId, subscribers: [ctx] };

    const onJoinSuccess = (gameInfo) => {
      dispatch(actions.addGame({ ...params, ...gameInfo }));

      gameChannel.onClose(() => {
        const subscribers = selectors.getSubscribers(gameId);
        dispatch(actions.removeGame(gameId));
        sendAll(subscribers, `Game #${gameId} is not available now`);
      });

      gameChannel.on(socketMessages.userStartCheck, (resp) => {
        const subscribers = selectors.getSubscribers(gameId);
        const player = _.find(gameInfo.players, ({ id }) => id === resp.user_id);

        sendAll(subscribers, `User #${player.name} started check solution`);
      });

      gameChannel.on(socketMessages.userCheckComplete, (resp) => {
        const { subscribers, status } = selectors.getActiveGame(gameId);
        const player = _.find(gameInfo.players, ({ id }) => id === resp.user_id);
        const opponent = _.find(gameInfo.players, ({ id }) => id !== resp.user_id);
        const isWinningCheck = status !== resp.status;

        dispatch(actions.updateGame(gameId, { status: resp.status }));

        subscribers.forEach((subscriber) => {
          send(subscriber, stripIndent`
            User #${player.name} complete check solution.
              Result: ${resp.check_result.asserts.status}
          `);

          if (isWinningCheck) {
            send(subscriber, stripIndent`
              Game is over:
                User #${player.name} win.
                User #${opponent.name} lost.
            `);
          }
        });

        if (isWinningCheck) gameChannel.leave();
      });

      gameChannel.on(socketMessages.userGiveUp, (resp) => {
        const subscribers = selectors.getSubscribers(gameId);
        const player = _.find(gameInfo.players, ({ id }) => id === resp.user_id);

        dispatch(actions.updateGame(gameId, { status: resp.status }));

        sendAll(subscribers, stripIndent`
          User ${player.name} gives up.
            gameId: ${gameId}
        `);
      });
    };

    gameChannel
      .join()
      .receive('ok', (resp) => {
        if (resp.status === 'game_over') {
          ctx.send('Game is already over');
          return;
        }
        ctx.send(`Establish connection with game #${gameId}. status: ${resp.status}`);
        onJoinSuccess(resp);
      })
      .receive('timeout', () => {
        ctx.send('Networking issue...');
      })
      .receive('error', (err) => {
        ctx.send(`there was an error with the connection! ${JSON.stringify(err)}`);
      });
  }
};
