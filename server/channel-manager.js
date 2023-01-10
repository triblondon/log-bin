const SSEChannel = require('sse-pubsub');

const SSE_OPTIONS = { historySize: 10 };
const GC_INTERVAL = 60000;
const GC_WAIT = 10000;

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

      // Only delete it if it continues to have no subscribers for a short period
      // (allowing for client reconnects)
      setTimeout(() => {
        if (channel.getSubscriberCount() === 0) {
          channels.delete(name);
        }
      }, GC_WAIT);
    }
  }
}, GC_INTERVAL);