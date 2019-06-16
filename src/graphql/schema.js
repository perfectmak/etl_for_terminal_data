const { gql } = require('apollo-server');
const tokenType = require('./types/token');
const tokenTransferType = require('./types/tokenTransfer');

const Query = gql`
  type Query {
    # required because type cannot be empty
    _empty: String
  }
`;

module.exports = [Query, tokenType.schema, tokenTransferType.schema];
