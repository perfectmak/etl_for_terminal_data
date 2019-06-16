const Sequelize = require('sequelize');
const log = require('../common/logger');
const makeTokensDao = require('./tokensDao');
const makeTokenTransfersDao = require('./tokenTransfersDao');

const sequelize = new Sequelize(
  process.env.PG_URL || 'postgresql://postgres@postgres:5432/postgres',
  {
    dialect: 'postgresql',
    logging: process.env.TRACE === 'true'
  }
);

const daos = {
  tokenTransfersDao: makeTokenTransfersDao(sequelize),
  tokensDao: makeTokensDao(sequelize)
};

/// SETUP SEQUELIZE RELATIONSHIPS
// tokens == has many ==> tokenTransfers
daos.tokensDao.Transfers = daos.tokenTransfersDao.hasMany(daos.tokensDao);
daos.tokenTransfersDao.Token = daos.tokensDao.belongsTo(daos.tokenTransfersDao);
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
  /**
   * Ensures database is setup and in sync with models
   * only for development, doesn't do anything for production environment
   * 
   */
  sync: () => {
    if (_isReady) {
      return Promise.resolve({});
    }

    if (process.env.NODE_ENV === 'production') {
      log.warn('Database Sync not allowed in production. Skipping...');
      _isReady = true;
      return Promise.resolve({});
    }

    return sequelize.sync().then(args => {
      _isReady = true;
      return args;
    });
  },
  isReady: () => _isReady
};
