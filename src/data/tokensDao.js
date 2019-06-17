const Sequelize = require('sequelize');
/**
 * Sequelize is used as dao so as to speed setup up
 * 
 * Represents a dao for accessing and manipulating tokens in the database
 *
 */
module.exports = sequelize => {
  return sequelize.define(
    'tokens',
    {
      // address and id
      address: {
        type: Sequelize.CHAR(42),
        primaryKey: true,
        allowNull: false
      },
      symbol: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      decimals: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      totalSupply: {
        type: Sequelize.STRING,
        allowNull: true
      }
    },
    {
      timestamps: false
    }
  );
};
