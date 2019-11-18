const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const { metricsMiddleware } = require('../');
const httpMetrics = require('../lib/metrics/httpMetrics');

chai.use(sinonChai);

const { expect } = chai;

describe('Test metricsMiddleware', () => {
  const clock = sinon.useFakeTimers();

  let next;
  let req = {};
  let res = {};
  let sandbox;

  before(() => {
    sandbox = sinon.createSandbox();
  });

  beforeEach(() => {
    next = sinon.spy();

    req = {
      method: 'GET',
      originalUrl: '/foo/123?bar',
    };
    res = {
      statusCode: 404,
      end: () => 'asdf',
    };

    httpMetrics.increment = sinon.spy();
    httpMetrics.histogram = sinon.spy();
  });

  afterEach(() => {
    sandbox.restore();
  });

  context('valid request and response', () => {
    it('should call increment and histogram', () => {
      metricsMiddleware(req, res, next);
      clock.tick(105);
      res.end('chunk', 'encoding');

      expect(next).to.have.been.calledOnce;

      expect(httpMetrics.increment).to.have.been.calledWith(
        'response',
        {
          method: 'GET',
          path: '/foo/123?bar',
          status_code: 404,
          status_code_class: '4xx',
        },
      );
      expect(httpMetrics.histogram).to.have.been.calledWith(
        'latency',
        105,
        1,
        {
          method: 'GET',
          path: '/foo/123?bar',
          status_code: 404,
          status_code_class: '4xx',
        },
      );
    });
  });

  context('invalid status code', () => {
    it('should not call any metrics', () => {
      res.statusCode = 0;

      metricsMiddleware(req, res, next);
      clock.tick(105);
      res.end('chunk', 'encoding');

      expect(next).to.have.been.calledOnce;

      expect(httpMetrics.increment).to.not.have.been.called;
      expect(httpMetrics.histogram).to.not.have.been.called;
    });
  });
});
