const StatsDClient = require('hot-shots');
const { hostname } = require('os');

const enabled = process.env.APP_STATSD_ENABLED !== undefined
  && ['true', '1'].includes(process.env.APP_STATSD_ENABLED.toLowerCase());

module.exports = (prefix) => new StatsDClient({
  host: process.env.APP_STATSD_HOST || 'datadog-agent',
  port: parseInt(process.env.APP_STATSD_PORT || 8125, 10),
  prefix,
  // NOTE: Mock means 'don't send events', hence the inversion of the boolean `enabled`
  mock: !enabled,
  globalTags: {
    app: process.env.APP_NAME,
    env: process.env.APP_NAMESPACE,
    hostname: hostname(),
    version: process.env.APP_VERSION,
  },
});
