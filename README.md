# @jroman00/node-metrics

A collection of StatsD helpers and middleware for Node.js applications

---

## Installation

TODO

## Usage

There are two types of exports made available by this library:

* Metrics Files
  * `applicationMetrics`
  * `standardMetrics`
* HTTP Middleware
  * `metricsMiddleware`

### Metrics Files

**Metrics files** are intended to help with setting up standard StatsD configurations. They are convenience wrappers around the StatsD client library [hot-shots](https://github.com/brightcove/hot-shots). Applications can use any standard metric call (e.g. increment/decrement counters, gauge, timers, histograms)

Metrics files share mostly the same configurations (e.g. host, port, global tags). The only difference between them is the prefix that gets set. Each metric type defines its own prefix:

| Metrics File | Prefix | Notes |
| --- | --- | --- |
| `applicationMetrics` | `app.<app_name>.` | `<app_name>` comes from the `APP_NAME` environment variable |
| `standardMetrics` | `app.` | |

#### `applicationMetrics`

These metrics should be used to log when application-specific events happen in the business logic of the application in question. For example, a service that receives invalid input may want to trigger a metric. `applicationMetrics` can optionally include any tags deemed useful (e.g. `user_id`)

##### Example Usage

The following is an example of a service, `user_service` in this case, receiving an invalid value

```javascript
const { applicationMetrics } = require('@jroman00/node-metrics');
// or
import { applicationMetrics } from '@jroman00/node-metrics';

// ...

applicationMetrics.increment('invalid_user_id', {
  user_id: '123',
});
```

Assuming the environment variables are correctly set, the above increment would produce the following:

* Metric: `app.user_service.invalid_user_id`
* Tags:
  * `app:user_service`
  * `env:prod`
  * `version:1.0.0`
  * `user_id:123`

#### `standardMetrics`

These metrics should be used to log when standard events happen. For example, dependency failures in ready checks could be considered a standard metric, not an application-specific one. `standardMetrics` can optionally include any tags deemed useful

##### Example Usage

The following is an example ready check that confirms the availability of a connection to a dependency, PostgreSQL in this case

```javascript
const { standardMetrics } = require('@jroman00/node-metrics');
// or
import { standardMetrics } from '@jroman00/node-metrics';

// ...

static checkPostgres() {
  return new Promise(resolve => {
    db.sequelize.authenticate()
      .then(() => {
        standardMetrics.gauge('dependency.postgres', 1);
        standardMetrics.gauge('service', 1);

        resolve('ok');
      })
      .catch(err => {
        standardMetrics.gauge('dependency.postgres', 0);
        standardMetrics.gauge('service', 0);

        resolve('error');
      });
  });
}
```

The above gauges would produce two metrics:

* Metric: `app.dependency.postgres`
* Value: `1|0`
* Tags:
  * `app:user_service`
  * `env:prod`
  * `version:1.0.0`

and

* Metric: `app.service`
* Value: `1|0`
* Tags:
  * `app:user_service`
  * `env:prod`
  * `version:1.0.0`

### HTTP Middleware

The **HTTP Middleware** is meant to be used to capture RED metrics. RED stands for "rate, errors, and durations" and are the minimum standard metrics we would want to measure for each application. See [The RED Method: key metrics for microservices architecture](https://www.weave.works/blog/the-red-method-key-metrics-for-microservices-architecture/) for more information

##### Example Usage

```javascript
const express = require('express');
const { metricsMiddleware } = require('@jroman00/node-metrics');
// or
import express from 'express';
import { metricsMiddleware } from '@jroman00/node-metrics';

// ...

const app = express();

// Add HTTP metrics middleware
app.use(metricsMiddleware);

// ...
```

## Contributing

A docker image has been set up so that you don't have to install node/npm locally. To contribute, you'll want to build the image, connect to a running instance, and start running scripts inside the container

To build the image:

```bash
bash bin/local-init.sh
```

To connect to a running instance:

```bash
docker-compose run --rm node-metrics bash
```

To run linting:

```bash
docker-compose run --rm node-metrics npm run lint
```

To run the test suite:

```bash
docker-compose run --rm node-metrics npm run test
```

## Available configuration variables

| Name | Description | Default Value | Required? |
| - | - | - | - |
| `APP_NAME` | The name of the application | `<none>` | yes |
| `APP_NAMESPACE` | The environment in which the application is running (e.g. `local`, `uat`, `qa`, `loadtest`, `prod`) | `<none>` | yes |
| `APP_STATSD_ENABLED` | Whether to send StatsD metrics | `false` | - |
| `APP_STATSD_HOST` | The host where the StatsD server resides | `datadog-agent` | - |
| `APP_STATSD_PORT` | The port on which the StatsD server is listening | `8125` | - |
| `APP_VERSION` | The version of the application | `<none>` | yes |
