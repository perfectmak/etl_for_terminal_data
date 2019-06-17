const fs = require('fs');
const { Storage } = require('@google-cloud/storage')
const makeFsReader = require('./fsReader');
const makeGsReader = require('./gsReader');

/**
 * A map of all readers for currently supported source types
 * Readers expose a function `open(path)` returns a stream of
 * data from the specified path
 *
 */
const sourceReaders = {
  fs: makeFsReader(fs),
  gs: makeGsReader(new Storage())
};

class UnknownSourceReaderError extends Error {
  constructor(sourceType) {
    super(`No known reader for source ${sourceType}.`);
  }
}

/**
 * Fetches an instance of a source reader.
 * Current sourceType supported are 'fs' and 'gs'.
 *
 * @param {String} sourceType
 * @returns {Reader}
 */
const getSourceReader = sourceType => {
  const reader = sourceReaders[sourceType];
  if (!reader) {
    throw new UnknownSourceReaderError(sourceType);
  }

  return reader;
};

module.exports = {
  getSourceReader
};
