const send = (subscriber, msg) => {
  subscriber.send(msg);
};

const sendAll = (subscribers, msg) => {
  subscribers.forEach((subscriber) => subscriber.send(msg));
};

module.exports = {
  send,
  sendAll,
};
