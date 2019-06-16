const makeResolver = require('../../../src/graphql/resolvers');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const expect = chai.expect;

chai.use(chaiAsPromised);

describe('GraphQLResolver', () => {
  let resolver;

  beforeEach(() => {
    resolver = makeResolver();
  });

  it('should expose Query Resolver', () => {
    expect(resolver).to.have.property('Query');
  });
});
