const statsd = require('../statsd');

module.exports = statsd(`app.${process.env.APP_NAME}.`);
