const es = require('event-stream');

const database = require('../data/db');
const DataSource = require('../data/dataSourcesDao');
const log = require('../common/logger');
const dataSourceSeeder = require('../data/seeder/dataSourceSeeder');
const { CHECK_DATA_SOURCE_INTERVAL_MS } = require('../constants/importer');
const { getSourceReader } = require('./readers');
const { getDataTypeWriter } = require('./writers');

const checkNewDataSource = async () => {
  const dataSource = await database.daos.dataSourcesDao.findOne({
    where: { status: DataSource.Status.NEW }
  });

  if (!dataSource) {
    // no more new data source
    // TODO: perhaps revisit ERROR sources 
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
    log.error({ error, dataSource }, `Error processing ${dataSource.id}`);
    dataSource.status = DataSource.Status.ERROR;
    await dataSource.save();

    setTimeout(checkNewDataSource, CHECK_DATA_SOURCE_INTERVAL_MS);
  });

  outputStream.on('end', async () => {
    console.timeEnd(dataSource.id);
    dataSource.status = DataSource.Status.DONE;
    await dataSource.save();
    log.info({ dataSource }, `Ended processing`);
    await conn.release();

    setTimeout(checkNewDataSource, CHECK_DATA_SOURCE_INTERVAL_MS);
  });

  console.time(dataSource.id);
  inputStream.pipe(outputStream);
};

module.exports = {
  start: async ({ seedSource, seedSourcePath}) => {
    await database.sync({ force: true });
    switch (seedSource) {
      case 'fs':
        await dataSourceSeeder.seedFsData(seedSourcePath);
        break;
      case 'gs':
        await dataSourceSeeder.seedGsData();
        break;
    }
    setTimeout(checkNewDataSource, CHECK_DATA_SOURCE_INTERVAL_MS);
  }
};
