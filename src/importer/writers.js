const copyFrom = require('pg-copy-streams').from;

const { DataType } = require('../data/dataSourcesDao');

/**
 * For simplicity all writers
 * open a COPY stream to the databse
 * 
 */
const writers = {
  [DataType.TOKENS]: {
    open: (connection) => {
      return connection.query(
        copyFrom(`COPY tokens FROM STDIN DELIMITER ',' CSV HEADER`)
      )
    }
  },
  [DataType.TOKEN_TRANSFERS]: {
    open: (connection) => {
      return connection.query(
        copyFrom(`COPY token_transfers FROM STDIN DELIMITER ',' CSV HEADER`)
      )
    }
  }
}

class UnknownDataTypeWriter extends Error {
  constructor(dataType) {
    super(`No known writer for data type ${dataType}.`);
  }
}

const getDataTypeWriter = (dataType) => {
  const writer = writers[dataType];
  if (!writer) {
    throw new UnknownDataTypeWriter(dataType);
  }

  return writer;
}

module.exports = {
  getDataTypeWriter
}