const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const resolver = require('../../../src/graphql/resolvers');

const expect = chai.expect;

chai.use(chaiAsPromised);

describe('GraphQLResolver', () => {

  it('should expose Query Resolver', () => {
    expect(resolver).to.have.property('Query');
  });
});
