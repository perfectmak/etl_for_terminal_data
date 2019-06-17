const Sequelize = require('sequelize');
/**
 * Represents dao for keeping track of new data sources to be indexed.
 * For this task it would be paths to the CSV files.
 *
 */
const Factory = sequelize => {
  return sequelize.define('data_sources', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4
    },
    // either fs or gs
    sourceType: {
      type: Sequelize.STRING,
      allowNull: false
    },
    // actual source/path to source
    source: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    // either tokens or token_transfers
    dataType: {
      type: Sequelize.STRING,
      allowNull: false
    },
    // new, processing, done
    status: {
      type: Sequelize.STRING,
      defaultValue: Factory.Status.NEW
    }
  });
};

Factory.Status = {
  NEW: 'new',
  PROCESSING: 'processing',
  DONE: 'done',
  ERROR: 'error',
};

Factory.DataType = {
  TOKENS: 'tokens',
  TOKEN_TRANSFERS: 'token_transfers'
}

module.exports = Factory;
