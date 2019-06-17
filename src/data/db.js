const Sequelize = require('sequelize');
const log = require('../common/logger');
const makeTokensDao = require('./tokensDao');
const makeTokenTransfersDao = require('./tokenTransfersDao');
const makeDataSourcesDao = require('./dataSourcesDao');
const { DEFAULT_PG_URL } = require('../constants/db');

const sequelize = new Sequelize(process.env.PG_URL || DEFAULT_PG_URL, {
  dialect: 'postgresql',
  logging: process.env.TRACE === 'true'
});

const daos = {
  tokenTransfersDao: makeTokenTransfersDao(sequelize),
  tokensDao: makeTokensDao(sequelize),
  dataSourcesDao: makeDataSourcesDao(sequelize)
};

/// SETUP SEQUELIZE RELATIONSHIPS
// tokens == has many ==> tokenTransfers
// Note: Disabled this relation, since the referential integrity doesn't matter
// just leaving this here for documentation purposes
// daos.tokensDao.Transfers = daos.tokenTransfersDao.hasMany(daos.tokensDao);
// daos.tokenTransfersDao.Token = daos.tokensDao.belongsTo(daos.tokenTransfersDao);
/// END SETUP SEQUELIZE RELATIONSHIPS

// is set to true only if sync() is manually called
let _isReady = false;

module.exports = {
  sequelize,
  daos,
  withTransaction: callback => {
    return sequelize.transaction(callback);
  },
  withRawQuery: (query, options) => {
    return sequelize.query(query, options);
  },
  getRawConnection: async () => {
    const connection = await sequelize.connectionManager.getConnection();
    connection.release = () => {
      return sequelize.connectionManager.releaseConnection(connection)
    }
    return connection;
  },
  /**
   * Ensures database is setup and in sync with models
   * only for development, doesn't do anything for production environment
   *
   */
  sync: (options) => {
    if (_isReady) {
      return Promise.resolve({});
    }

    if (process.env.NODE_ENV === 'production') {
      log.warn('Database Sync not allowed in production. Skipping...');
      _isReady = true;
      return Promise.resolve({});
    }

    return sequelize.sync(options).then(args => {
      _isReady = true;
      return args;
    });
  },
  isReady: () => _isReady
};
