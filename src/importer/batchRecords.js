const Transform = require('stream').Transform;

class BatchRecords extends Transform {
  constructor(batchSize, options) {
    super(options);
    this.batchSize = batchSize;
    this.batch = '';
    this.batchLength = 0;
  }

  _transform(data, _encoding, callback) {
    this.batch += `${data.toString('utf8')},`;
    this.batchLength++;
    if (this.batchLength === this.batchSize) {
      this.push(this.batch);
      this.batchLength = 0;
      this.batch = '';
    }

    callback();
  }
}

module.exports = BatchRecords;
