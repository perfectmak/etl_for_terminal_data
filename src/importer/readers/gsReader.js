/**
 * Creates a reader for Google Cloud Storage.
 * Can be used to read files from gs path specified
 * 
 */
const GsReaderFactory = () => {

  return {
    /**
     * Path should be a string with prefix 'gs://`
     * 
     * @param {String} path
     */
    open: (path) => {
      
    }
  }
}

module.exports = GsReaderFactory