const SSEChannel = require('sse-pubsub');

const SSE_OPTIONS = { historySize: 10 };
const GC_INTERVAL = 5000;

const channels = new Map();

module.exports.getChannel = name => {
  if (!channels.has(name)) {
    channels.set(name, new SSEChannel(SSE_OPTIONS));
  }
  return channels.get(name);
}

setInterval(() => {
  for (let [name, channel] of channels) {
    if (channel.getSubscriberCount() === 0) {
      channels.delete(name);
    }
  }
}, GC_INTERVAL);