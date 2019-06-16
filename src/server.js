const { ApolloServer } = require('apollo-server');

const database = require('./data/db');
const schema = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  cors: true,
  context: async () => {
    await database.sync();
    return {
      daos: database.daos
    };
  }
});

module.exports = server;
