const Sequelize = require('sequelize');
/**
 * Represents dao for fetching and manipulatign token_transfers
 * token_address,from_address,to_address,value,transaction_hash,log_index,block_timestamp,block_number,block_hash
 */
module.exports = sequelize => {
  return sequelize.define(
    'token_transfers',
    {
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
      value: {
        type: Sequelize.STRING,
        allowNull: false
      },
      transactionHash: {
        type: Sequelize.CHAR(66),
        // primaryKey: true,
        allowNull: false
      },
      logIndex: {
        type: Sequelize.STRING
      },
      blockTimestamp: {
        type: Sequelize.DATE
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
      timestamps: false,
      indexes: [{
        fields: ['transactionHash']
      }, {
        fields: ['fromAddress']
      }, {
        fields: ['toAddress']
      }]
    }
  );
};
