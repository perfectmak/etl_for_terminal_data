const { Storage } = require('@google-cloud/storage');
const database = require('../db');
const log = require('../../common/logger');
const { Status, DataType } = require('../dataSourcesDao');
const { GS_BUCKET } = require('../../constants/importer');

const getDataType = fileNamePath => {
  if (fileNamePath.includes('token-transfers')) {
    return DataType.TOKEN_TRANSFERS;
  }

  return DataType.TOKENS;
};

module.exports = {
  /**
   * useful for testing at the moment
   * would download one tokens and one token-transfer file and put
   * them in the path specified
   *
   */
  seedFsData: async path => {
    log.info('Seeding fs data...');
    const gs = new Storage({ autoRetry: false });
    const bucket = gs.bucket(GS_BUCKET);
    // download one tokens and one token-transfer file
    await bucket
      .file('assignment-data/tokens/tokens000000000000.csv')
      .download({ destination: `${path}/tokens000000000000.csv` });

    await database.daos.dataSourcesDao.create({
      sourceType: 'fs',
      source: `${path}/tokens000000000000.csv`,
      dataType: DataType.TOKENS,
      status: Status.NEW
    });

    await bucket
      .file('assignment-data/token-transfers/token-transfer000000000002.csv')
      .download({ destination: `${path}/token-transfer000000000002.csv` });

    await database.daos.dataSourcesDao.create({
      sourceType: 'fs',
      source: `${path}/token-transfer000000000002.csv`,
      dataType: DataType.TOKEN_TRANSFERS,
      status: Status.NEW
    });
    log.info('Seeding fs data completed');
  },

  /**
   * Fetches all the files on the GS_Bucket
   * and submits their information
   *
   */
  seedGsData: async () => {
    log.info('Seeding gs data...');
    const gs = new Storage();
    const [files] = await gs.bucket(GS_BUCKET).getFiles();
    let count = 0;
    for (let file of files) {
      if (count >= 5) {
        break;
      }
      const meta = file.metadata;
      if (!meta.name.endsWith('.csv')) {
        continue; // skip none csv files
      }

      // determine the datatype
      try {
        await database.daos.dataSourcesDao.create({
          sourceType: 'gs',
          source: `gs://${meta.bucket}/${meta.name}`,
          dataType: getDataType(meta.name),
          status: Status.NEW
        });
      } catch (error) {
        log.error({ error }, 'Seeder error');
      }
    }
    log.info('Seeding gs data completed');
  }
};
