const { GS_BUCKET } = require('../../constants/importer')
/**
 * Creates a reader for Google Cloud Storage.
 * Can be used to read files from gs path specified
 *
 */
const GsReaderFactory = gs => {
  return {
    /**
     * Path should be a string with prefix 'gs://`
     * but for simplicity, I'll assume all urls are inform
     * gs://terminal-public-buckets/{fileName} and strip it off to get the fileName
     *
     * @param {String} path
     */
    open: async path => {
      const bucketName = GS_BUCKET;
      const fileName = path.replace(`gs://${bucketName}/`, '');
      return gs
        .bucket(bucketName)
        .file(fileName)
        .createReadStream();
    }
  };
};

module.exports = GsReaderFactory;
