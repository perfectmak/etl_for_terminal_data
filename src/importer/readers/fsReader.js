/**
 * Creates a reader for the local file system
 * 
 * @param {} fs fs module
 */
const FsReaderFactory = (fs) => {

  return {
    /**
     * Path should be an absolute path to the file to be read
     * 
     * @returns {ReadableStream}
     */
    open: (path) => {
      return fs.createReadStream(path, 'utf8');
    }
  }
}

module.exports = FsReaderFactory