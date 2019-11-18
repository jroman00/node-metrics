const httpMetrics = require('../metrics/httpMetrics');

module.exports = (req, res, next) => {
  const start = new Date();
  const { end } = res;

  res.end = (chunk, encoding) => {
    res.end = end;
    res.end(chunk, encoding);

    // ignore invalid or unexpected status codes
    if (!res.statusCode
      || res.statusCode < 100
      || res.statusCode > 599
      || !req.method
    ) {
      return;
    }

    const statTags = {
      method: req.method.toUpperCase(),
      path: req.originalUrl,
      status_code_class: res.statusCode.toString().replace(/\d\d$/, 'xx'),
      status_code: res.statusCode,
    };

    httpMetrics.increment('response', statTags);

    const duration = new Date() - start;
    httpMetrics.histogram('latency', duration, 1, statTags);
  };

  next();
};
