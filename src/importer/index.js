const es = require('event-stream');

const database = require('../data/db');
const DataSource = require('../data/dataSourcesDao');
const log = require('../common/logger');
const {
  CHECK_DATA_SOURCE_INTERVAL_MS,
  TOKENS_HEADER,
  TOKEN_TRANSFERS_HEADER
} = require('../constants/importer');
const { getSourceReader } = require('./readers');
const { getDataTypeWriter } = require('./writers');

const checkNewDataSource = () =>
  setTimeout(async () => {
    const sources = await database.daos.dataSourcesDao.findAll({
      where: { status: DataSource.Status.NEW }
    });

    const conn = await database.getRawConnection();

    for (let dataSource of sources) {
      dataSource.status = DataSource.Status.PROCESSING;
      await dataSource.save();

      console.time(dataSource.id);
      const reader = getSourceReader(dataSource.sourceType);
      const inputStream = await reader.open(dataSource.source);

      const writer = getDataTypeWriter(dataSource.dataType);
      const outputStream = await writer.open(conn);
      outputStream.on('error', error => {
        log.error({ error, dataSource }, `Error processing ${dataSource.id}`);
        // TODO: cleanup affected line and retry (perhaps remove duplicate entries)
      });

      outputStream.on('end', async () => {
        console.timeEnd(dataSource.id);
        dataSource.status = DataSource.Status.DONE;
        await dataSource.save();
        await conn.release();
      });

      inputStream.pipe(outputStream);
    }
  }, CHECK_DATA_SOURCE_INTERVAL_MS);

module.exports = {
  start: async () => {
    await database.sync({ force: true });
    checkNewDataSource();
  }
};
