const { Socket } = require('phoenix-channels');
const { store, actions } = require('./state');

const endPoint = process.env.NODE_ENV === 'development'
  ? 'ws://localhost:4000/discord/websocket?vsn=2.0.0'
  : 'wss://codebattle.hexlet.io/discord/websocket?vsn=2.0.0';

const socket = new Socket(
  endPoint,
  {
    logger: (kind = 'event', msg = 'nothing', data = {}) => {
      console.log(`[socket log] ${kind}: ${msg}`);
      console.log(`[socket log] data: ${JSON.stringify(data)}`);
    },
    params: { token: process.env.BOT_CLIENT_TOKEN },
  },
);

// TODO: handle all socket messages
const socketMessages = {
  // game messages
  editorDataUpdate: 'editor:data',
  userStartCheck: 'user:start_check',
  userCheckComplete: 'user:check_complete',
  gameTimeOut: 'game:timeout',
  userGiveUp: 'user:give_up',
  rematchUpdateStatus: 'rematch:update_status',
  rematchGame: 'rematch:redirect_to_new_game',
  // chat messages
  userJoined: 'chat:user_joined',
  userLeave: 'chat:user_left',
  newMessage: 'chat:new_msg',
};

socket.onOpen(() => {
  console.log('Connection with server opened');
});
socket.onError((err) => {
  console.error(`Socket doesn't work. Error: ${JSON.stringify(err)}`);
  store.dispatch(actions.clearGameList());
});
socket.onClose(() => {
  console.log('Connection with server closed');
  store.dispatch(actions.clearGameList());
});

module.exports = { socket, socketMessages };
