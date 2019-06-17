const isUndefined = require('lodash/isUndefined');
const omitBy = require('lodash/omitBy');
const { gql } = require('apollo-server');

const { validatePagination, withPagination } = require('../utils');

const schema = gql`
  type TokenTransfer {
    transactionHash: ID!
    token: Token!
    fromAddress: String!
    toAddress: String!
    value: String!
    logIndex: String
    blockTimestamp: String
    blockNumber: String
    blockHash: String
  }

  extend type Query {
    transfers(
      transactionHash: ID
      fromAddress: String
      toAddress: String
      page: String
      limit: String
    ): [TokenTransfer!]
  }
`;

const resolver = {
  Query: {
    transfers: async (_parent, args, { daos }) => {
      const where = omitBy(
        {
          transactionHash: args.transactionHash,
          fromAddress: args.fromAddress,
          toAddress: args.toAddress
        },
        isUndefined
      );
      const pagination = validatePagination(args);

      const tokenTransfers = await daos.tokenTransfersDao.findAll({
        where,
        ...withPagination(pagination)
      });

      return tokenTransfers;
    }
  },
  TokenTransfer: {
    token: async (parent, _args, { daos }) => {
      return await daos.tokensDao.findOne({
        where: { address: parent.tokenAddress }
      });
    }
  }
};

module.exports = {
  schema,
  resolver
};
