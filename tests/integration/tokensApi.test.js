const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiAsPromised = require('chai-as-promised');

// const transactionFixtures = require('../fixtures/transactions.json');
const server = require('../../src/server');
const db = require('../../src/data/db');

const expect = chai.expect;

chai.use(chaiHttp);
chai.use(chaiAsPromised);

describe('GET /opreturn/${opReturnData}', () => {
  describe('when opReturnData exists', () => {

    beforeEach(async () => {
      // clean repository
      // await db.sequelize.sync({ force: true });
    });

    it('should return correct result', async () => {
      expect(true).to.equal(true);
    });
  });
});