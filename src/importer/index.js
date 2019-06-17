const es = require('event-stream');
const csvParser = require('papaparse');
const trim = require('lodash/trim');
const trimEnd = require('lodash/trimEnd');
const pipe = require('lodash/flow');
const sqlString = require('sqlstring');

const database = require('../data/db');
const DataSource = require('../data/dataSourcesDao');
const log = require('../common/logger');
const {
  CHECK_DATA_SOURCE_INTERVAL_MS,
  TOKENS_HEADER,
  TOKEN_TRANSFERS_HEADER
} = require('../constants/importer');
const { getSourceReader } = require('./readers');
const BatchRecords = require('./batchRecords');

const defaultToNull = value => (!value ? null : value);
const quoteNonNull = value => (value === null ? null : `'${value}'`);

const checkNewDataSource = () =>
  setTimeout(async () => {
    // const sources = await database.daos.dataSourcesDao.findAll({
    //   where: { status: DataSource.Status.NEW }
    // });

    const sources = [
      {
        id: 'random',
        sourceType: 'fs',
        source: '/app/sample_data/tokens/tokens000000000000.csv',
        dataType: 'tokens',
        status: 'new'
      }
      // {
      //   id: 'random1',
      //   sourceType: 'fs',
      //   source:
      //     '/app/sample_data/token_transfers/token-transfer000000000000.csv',
      //   dataType: 'token_transfers',
      //   status: 'new'
      // }
    ];

    for (let dataSource of sources) {
      // try {
      // update source to processing
      // dataSource.status = DataSource.Status.PROCESSING;
      // await dataSource.save();

      // source adapter: that opens a stream
      // log.info('starting');
      console.time(dataSource.id);
      const reader = getSourceReader(dataSource.sourceType);
      reader
        .open(dataSource.source)
        .pipe(es.split())
        .pipe(
          es.filterSync(data => {
            switch (data) {
              case TOKENS_HEADER:
              case TOKEN_TRANSFERS_HEADER:
                return false;
              default:
                return true;
            }
          })
        )
        .pipe(
          es.mapSync(data => {
            if (trim(data).length === 0) {
              return '';
            }
            const row = csvParser.parse(data).data[0].map(
              pipe(
                trim,
                defaultToNull,
                // quoteNonNull
              )
            );
            return sqlString.format('(?)', [row]); // `(${row[0]}, ${row[1]}, ${row[2]}, ${row[3]}, ${row[4]})`;
          })
        )
        .pipe(new BatchRecords(2))
        .pipe(
          es.map(async (data, cb) => {
            switch (dataSource.dataType) {
              case DataSource.DataType.TOKENS:
                try {
                  // await database.daos.tokensDao.bulkCreate([
                  //   {
                  //     address: row[0],
                  //     symbol: row[1],
                  //     name: row[2],
                  //     decimals: row[3],
                  //     totalSupply: row[4]
                  //   }
                  // ]);
                  const insert = `INSERT INTO tokens("address","symbol","name","decimals","totalSupply") VALUES ${trimEnd(
                    data,
                    ','
                  )};`;
                  await database.withRawQuery(insert);
                } catch (error) {
                  console.log(error);
                }
                break;
              case DataSource.DataType.TOKEN_TRANSFERS:
                break;
              default:
                log.error(`Unknown data type ${dataSource.dataType}`);
            }

            cb('');
          })
        )
        .on('end', () => {
          console.timeEnd(dataSource.id);
          // log.info('finished');
        });
      // format mapper: maps format based on dataType
      // const mapper = getSourceMapper(dataSource.format, dataSource.dataType);
      // // dataType inserted get the source and batches insertion into the database
      // const inserter = getInserter(dataSource.dataType);

      // on success, update status to done
      // dataSource.status = DataSource.Status.PROCESSING;
      // await dataSource.save();
      // } catch (error) {
      //   log.error(
      //     { error, dataSource },
      //     `Error loading data source ${dataSource.id}`
      //   );
      // }
    }
  }, CHECK_DATA_SOURCE_INTERVAL_MS);

module.exports = {
  start: async () => {
    await database.sync({ force: true });
    checkNewDataSource();
  }
};
