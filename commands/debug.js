const { SlashCommand } = require('slash-create');
const { selectors } = require('../lib/state.js');

module.exports = class DebugCommand extends SlashCommand {
  constructor(creator) {
    super(creator, {
      name: 'debug',
      description: 'Debug bot current state',
    });
  }

  getPlayerDebugInfo({
    id,
    name,
    is_bot: isBot,
    github_id: githubId,
    lang, creator,
    rating,
  }) {
    return [
      `id: ${id}`,
      `name: ${name}`,
      `is_bot: ${isBot}`,
      `github_id: ${githubId}`,
      `lang: ${lang}`,
      `creator: ${creator}`,
      `rating: ${rating}`,
    ];
  }

  getGameDebugInfo({ players, status }) {
    const player1 = this.getPlayerDebugInfo(players[0]).join('\n\t');
    const player2 = this.getPlayerDebugInfo(players[1]).join('\n\t');

    return [`player1: ${player1.join('\n\t')}`, `player2: ${player2}`, `status: ${status}`];
  }

  async run(ctx) {
    const games = selectors.getAllGames();
    const subscribedGamesFields = games.map((game) => (
      { name: `Game #${game.id}`, value: this.getGameDebugInfo(game) }
    ));
  }
};
