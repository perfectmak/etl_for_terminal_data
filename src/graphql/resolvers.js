const merge = require('lodash/merge');
const tokenType = require('./types/token');
const tokenTransferType = require('./types/tokenTransfer');

module.exports = merge({}, tokenType.resolver, tokenTransferType.resolver);
