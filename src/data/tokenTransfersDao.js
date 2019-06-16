const Sequelize = require('sequelize');
/**
 * Represents dao for fetching and manipulatign token_transfers
 * 
 */
module.exports = sequelize => {
  return sequelize.define(
    'token_transfers',
    {
      transactionHash: {
        type: Sequelize.CHAR(66),
        primaryKey: true,
        allowNull: false
      },
      tokenAddress: {
        type: Sequelize.CHAR(42),
        allowNull: false
      },
      fromAddress: {
        type: Sequelize.CHAR(42),
        allowNull: false,
      },
      toAddress: {
        type: Sequelize.CHAR(42),
        allowNull: false
      },
      logIndex: {
        type: Sequelize.STRING
      },
      blockTimestamp: {
        type: Sequelize.BIGINT
      },
      blockNumber: {
        type: Sequelize.BIGINT
      },
      blockHash: {
        type: Sequelize.CHAR(66),
        allowNull: false
      }
    },
    {
      timestamps: false
    }
  );
};
