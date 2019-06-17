const es = require('event-stream');
const EventEmitter = require('events').EventEmitter;

const database = require('../data/db');
const DataSource = require('../data/dataSourcesDao');
const log = require('../common/logger');
const dataSourceSeeder = require('../data/seeder/dataSourceSeeder');
const { CHECK_DATA_SOURCE_INTERVAL_MS } = require('../constants/importer');
const { getSourceReader } = require('./readers');
const { getDataTypeWriter } = require('./writers');

let emitter = new EventEmitter();

/**
 * Checks the data_sources table for a record with status New
 * picks it up and proceeds to indexing it.
 *
 * Currently the source content is stream to the database via a copy comment.
 * See `getSourceReader()` and `getDataTypeWriter()` for how these are implemented.
 *
 * Currently no transformation is done on the data, but the input can be piped
 * through a transform stream for transformation. Of course depending on how heavy the transformation
 * it could also incur some extra time in the writing to the database.
 *
 */
const checkNewDataSource = async () => {
  const dataSource = await database.daos.dataSourcesDao.findOne({
    where: { status: DataSource.Status.NEW }
  });

  if (!dataSource) {
    // no more new data source
    // TODO: perhaps revisit ERROR sources
    emitter.emit('end', DataSource.Status.NEW);
    return;
  }
  dataSource.status = DataSource.Status.PROCESSING;
  await dataSource.save();

  const reader = getSourceReader(dataSource.sourceType);
  const inputStream = await reader.open(dataSource.source);

  const writer = getDataTypeWriter(dataSource.dataType);
  const conn = await database.getRawConnection();
  const outputStream = await writer.open(conn);

  outputStream.on('error', async error => {
    dataSource.status = DataSource.Status.ERROR;
    await dataSource.save();
    log.error({ error, dataSource }, `Error processing ${dataSource.id}`);

    setTimeout(checkNewDataSource, CHECK_DATA_SOURCE_INTERVAL_MS);
  });

  outputStream.on('end', async () => {
    dataSource.status = DataSource.Status.DONE;
    await dataSource.save();
    log.info({ dataSource }, `Ended processing`);
    await conn.release();

    setTimeout(checkNewDataSource, CHECK_DATA_SOURCE_INTERVAL_MS);
  });

  inputStream.pipe(outputStream);
};

module.exports = Object.assign(emitter, {
  start: async () => {
    setTimeout(checkNewDataSource, CHECK_DATA_SOURCE_INTERVAL_MS);
  },
  seedData: async ({ seedSource, seedSourcePath }) => {
    // forcing cleaning of database when seeding
    await database.sync({ force: true });
    switch (seedSource) {
      case 'fs':
        await dataSourceSeeder.seedFsData(seedSourcePath);
        break;
      case 'gs':
        await dataSourceSeeder.seedGsData();
        break;
    }
  }
});
