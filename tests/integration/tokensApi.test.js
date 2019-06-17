const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { createTestClient } = require('apollo-server-testing');
const { gql } = require('apollo-server');

const server = require('../../src/server');
const importer = require('../../src/importer');
const db = require('../../src/data/db');

const expect = chai.expect;

chai.use(chaiAsPromised);

const TOKENS_QUERY = gql`
  query {
    tokens {
      address
      name
      totalSupply
      symbol
      decimals
    }
  }
`;

const TRANSFERS_QUERY = gql`
  query {
    transfers {
      toAddress
      fromAddress
      value
      transactionHash
    }
  }
`;

describe('GraphQL API', () => {
  let testClient;

  before(async () => {
    testClient = createTestClient(server);

    await db.sync({ force: true });

    await importer.seedData({
      seedSource: 'fs',
      seedSourcePath: process.cwd()
    });
    // wait for importer to be done
    await new Promise(resolve => {
      importer.on('end', () => {
        resolve();
      });
    });
  });

  it('should index tokens correctly', async () => {
    const res = testClient.query({ query: TOKENS_QUERY });
    expect(res.data.tokens).not.to.be.empty();
  });

  it('should index transfers correctly', async () => {
    const res = testClient.query({ query: TRANSFERS_QUERY });
    expect(res.data.transfers).not.to.be.empty();
  });
});
