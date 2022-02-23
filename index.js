// @ts-check
const path = require('path');
const { SlashCreator, GatewayServer } = require('slash-create');
const Discord = require('discord.js');

require('dotenv').config();

const client = new Discord.Client();

const slashConfig = {
  applicationID: process.env.DISCORD_APPLICATION_ID,
  publicKey: process.env.DISCORD_APPLICATION_PUBLIC_KEY,
  token: process.env.BOT_CLIENT_TOKEN,
  serverPort: Number(process.env.BOT_SERVER_PORT),
};

const creator = new SlashCreator(slashConfig);

const { socket } = require('./lib/socket.js');

socket.connect();

// const games = [];
// Game types: waiting_registration | ready | active | game_over
// game = { id, creator, opponent, conf, callback_url, channel, guild };

// const getGameChannelTopic = (id) => `game:${id}`;

// create game
//    Args:
//      - discord player1 (creator)
//      - discord player2 (opponent)
//      - game config (level)
//      - callback url
//    server:
//      - verify both player account's
//      - registry them if not
//      - create game if any players in active game
//    send back:
//      if creator isn't in any active game
//        - id request to create game
//        - set game status (waiting)
//        - send both players (or/and channel) message about created game
//      else
//        - send creator error message
//

// player ready
//    Args:
//      - game id
//      - discord player (creator/opponent)
//    server:
//      if (both players are ready)
//        - create game
//        - establish socket channel connect
//    send back
//      - inform about player's ready
//      if both players ready
//        - send created game id

// cancel game
//    Args:
//      - game id
//      - discord player (creator/opponent)
//    server:
//      - delete game by id
//    send back
//      - response both players about canceling game

creator.on('debug', (message) => console.log(message));

const logger = {
  warn: console.warn,
  error: console.error,
  info: console.info,
};

creator.on('warn', (message) => logger.warn(message));
creator.on('error', (error) => logger.error(error));
creator.on('synced', () => logger.info('Commands synced!'));
creator.on('commandRun', (command, _, ctx) =>
  logger.info(`${ctx.member.user.username}#${ctx.member.user.discriminator} (${ctx.member.id}) ran command ${command.commandName}`));
creator.on('commandRegister', (command) =>
  logger.info(`Registered command ${command.commandName}`));
creator.on('commandError', (command, error) => logger.error(`Command ${command.commandName}:`, error));

creator
  .withServer(
    new GatewayServer(
      (handler) => client.ws.on('INTERATION_CREATE', handler),
    ),
  )
  .registerCommandsIn(path.join(__dirname, 'commands'))
  .syncCommands();

client.login(process.env.BOT_CLIENT_TOKEN);
