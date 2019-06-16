const isUndefined = require('lodash/isUndefined');
const omitBy = require('lodash/omitBy');
const { gql } = require('apollo-server');

const { validatePagination, withPagination } = require('../utils')

const schema = gql`
  type Token {
    address: ID!
    symbol: String
    name: String
    decimals: Int
    totalSupply: String
  }

  extend type Query {
    tokens(address: ID, page: String, limit: String): [Token!]!
  }
`;

const resolver = {
  Query: {
    tokens: async (_parent, args, { daos }) => {
      const where = omitBy({ address: args.address }, isUndefined);
      const pagination = validatePagination(args);

      const tokens = await daos.tokensDao.findAll({
        where,
        ...withPagination(pagination)
      });
      return tokens;
    }
  }
};

module.exports = {
  schema,
  resolver
};
