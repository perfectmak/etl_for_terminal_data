const appRoot = require('app-root-path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { createTestClient } = require('apollo-server-testing');
const { gql } = require('apollo-server');

const server = require('../../src/server');
const importer = require('../../src/importer');
const db = require('../../src/data/db');
const { Status, DataType } = require('../../src/data/dataSourcesDao');

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

    // not working on CI :(
    // await importer.seedData({
    //   seedSource: 'fs',
    //   seedSourcePath: process.cwd()
    // });

    // fetching from cloud storage fails on CI (google or travis ci don't)
    // so we would seed manually
    const fixturesPath = appRoot + '/test/fixtures';
    await db.sync({ force: true });
    await db.daos.dataSourcesDao.create({
      sourceType: 'fs',
      source: `${fixturesPath}/tokens000000000000.csv`,
      dataType: DataType.TOKENS,
      status: Status.NEW
    });
    await db.daos.dataSourcesDao.create({
      sourceType: 'fs',
      source: `${fixturesPath}/token-transfer000000000002.csv`,
      dataType: DataType.TOKEN_TRANSFERS,
      status: Status.NEW
    });

    await importer.start();
    // wait for importer to be done
    await new Promise(resolve => {
      importer.on('end', () => {
        resolve();
      });
    });
  });

  it('should index tokens correctly', async () => {
    const res = await testClient.query({ query: TOKENS_QUERY });
    expect(res.data.tokens).to.not.be.empty;
  });

  it('should index transfers correctly', async () => {
    const res = await testClient.query({ query: TRANSFERS_QUERY });
    expect(res.data.transfers).to.not.be.empty;
  });
});
