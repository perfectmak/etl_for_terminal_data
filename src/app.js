const log = require('./common/logger');

/**
 * This file is an entry point for both the server and importer.
 *
 * You can toggle off some features using the environment variables
 *
 */
const server = require('./server');
const importer = require('./importer');

if (process.env.GRAPHQL_API !== 'off') {
  const port = process.env.PORT || 9090;
  server.listen(port).then(({ url }) => {
    log.info(`Server ready at ${url}`);
  });
}

if (process.env.IMPORTER != 'off') {
  importer.start({
      seedSource: process.env.SEED_SOURCE || 'gs',
      seedSourcePath: process.env.SEED_SOURCE_PATH
    })
    .then(() => {
      log.info(`Importer started`);
    })
    .catch(error => {
      log.error({ error }, 'Error starting up importer');
    });
}
