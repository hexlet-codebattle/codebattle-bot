const { SlashCommand, CommandOptionType } = require('slash-create');
const { dispatch, actions, selectors } = require('../lib/state.js');

module.exports = class GameUnsubscribeCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: 'unsubscribe',
      description: 'Unsubscribe discord channel or your\'s dm from active game events',
      options: [{
        name: 'game_id',
        type: CommandOptionType.INTEGER,
        description: 'Id of active game you want to unsubscribe',
      }],
    });
  }

  async run(ctx) {
    const { game_id: gameId } = ctx.options;
    const game = selectors.getActiveGame(gameId);

    if (game && game.subscribers.some(({ id }) => ctx.channelId === id)) {
      dispatch(actions.removeSubscriber({
        gameId,
        subscriber: ctx,
      }));
      ctx.send(`You successfully unsubscribe from game#${gameId} events`);

      return;
    }

    ctx.send(`You are not subscribed to the events of this game#${gameId}`);
  }
};
