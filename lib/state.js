const _ = require('lodash');
const { configureStore, createSlice } = require('@reduxjs/toolkit');

const { reducer, actions } = createSlice({
  name: 'activeGames',
  initialState: [],
  reducers: {
    addSubscriber: (state, { payload }) => {
      const { gameId, subscriber } = payload;
      const game = _.find(state, ({ id }) => id === gameId);
      const newSubscribers = [...game.subscribers, subscriber];

      _.assign(game, { subscribers: newSubscribers });
      return state;
    },
    removeSubscriber: (state, { payload }) => {
      const { gameId, subscriber } = payload;
      const game = _.find(state, ({ id }) => id === gameId);
      const newSubscribers = _.filter(
        game.subscribers,
        ({ channelId }) => channelId === subscriber.channelId,
      );

      _.assign(game, { subscribers: newSubscribers });
      return state;
    },
    addGame: (state, { payload: game }) => [...state, game],
    removeGame: (state, { payload: gameId }) => _.filter(state, ({ id }) => id === gameId),
    updateGame: (state, { payload: params }) => {
      const game = _.find(state, ({ id }) => id === params.id);

      _.assign(game, params);
      return state;
    },
    initGameList: (_state, { payload: games }) => games,
    clearGameList: () => [],
  },
});

const store = configureStore({
  reducer,
});

const getActiveGame = (gameId) => {
  const activeGames = store.getState();
  const game = _.find(activeGames, ({ id }) => id === gameId);

  return game;
};

const getSubscribers = (gameId) => {
  const activeGames = store.getState();
  const game = _.find(activeGames, ({ id }) => id === gameId);

  return game.subscribers;
};

const getAllGames = () => (store.getState());

const selectors = {
  getActiveGame,
  getSubscribers,
  getAllGames,
};

module.exports = {
  dispatch: store.dispatch,
  actions,
  selectors,
};
