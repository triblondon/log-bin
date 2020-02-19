const path = require('path');

const express = require('express');
const expressNunjucks = require('express-nunjucks');
const bodyParser = require('body-parser');
const app = express();
const hri = require('human-readable-ids').hri;

const channelManager = require('./channel-manager');
const ParsedEvent = require('./parsers/ParsedEvent');

const MAX_SUBSCRIBERS_PER_STREAM = 10;
const MIN_BUCKET_ID_LENGTH = 10;

app.use(express.static(path.join(__dirname, '../client/public')));
app.use(bodyParser.text({ type: "text/*", limit: 1024 }));
app.use(bodyParser.text({ type: "application/json", limit: 1024 }));
app.disable('x-powered-by');

const njk = expressNunjucks(app, { watch:true });
app.set('views', './views');

app.disable('x-powered-by');
app.disable('etag');

app.use((req, res, next) => {
  res.set({
    'Content-Security-Policy': "default-src 'self'; img-src 'self' cdn.glitch.com",
    'X-Frame-Options': "SAMEORIGIN",
    'X-XSS-Protection': "1",
    'X-Content-Type-Options': "nosniff",
    'Referer-Policy': "origin-when-cross-origin",
		'Strict-Transport-Security': "max-age=86400",
		'X-Accel-Buffering': 'no' // Disables response buffering on Google App Engine (flex env)
  });
  next();
})

app.get('/', (req, res) => res.redirect('/' + hri.random()));

app.get('/:bucketID', (req, res) => {
  if (req.params.bucketID.length < MIN_BUCKET_ID_LENGTH) {
    res.status(404);
    res.end('Bucket ID too short.  Minimum length: ' + MIN_BUCKET_ID_LENGTH);
    return;
  }
  if (req.headers['accept'] === 'text/event-stream') {
    const maxSubs = (req.params.bucketID.match(/;max-subs=(\d+)/) || [])[1] || MAX_SUBSCRIBERS_PER_STREAM;
    const ch = channelManager.getChannel(req.params.bucketID);
    if (ch.getSubscriberCount() >= maxSubs) {
      res.status(429);
      res.end('This stream already has the maximum number of clients connected');
    } else {
      console.log('New subscriber for ' + req.params.bucketID);
      ch.subscribe(req, res);
      const clients = Object.keys(ch.listClients());
      const connCount = ch.getSubscriberCount();
      ch.publish({ clientCount: clients.length, connCount, clients }, 'stats');
    }
  } else {
    res.sendFile(path.join(__dirname, '../client/index.html'));
  }
});

app.post('/:bucketID', (req, res) => {
  req.body && req.body.split(/\n+/).filter(x => x && x.length).forEach(line => {
    const evt = new ParsedEvent(line);
    evt.parse();

    channelManager.getChannel(req.params.bucketID).publish({
      time: evt.getTime(),
      raw: line,
      fields: evt.getFields(),
      parser: evt.getParserName()
    }, 'log');

  });
  res.status(204);
  res.end();
});

// Allow this tool to be a log destination for Fastly's real time logging feature
app.all('/.well-known/fastly/logging/challenge', (req, res) => res.end("*"));

// Provide a healthcheck endpoint for Google App Engine
app.get('/__health', (req, res) => res.end('OK'));


app.listen(process.env.PORT, () => console.log('Server up'));
