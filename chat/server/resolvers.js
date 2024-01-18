import { GraphQLError } from 'graphql';
import { createMessage, getMessages } from './db/messages.js';
import { PubSub } from 'graphql-subscriptions';

const pubSub = new PubSub()

export const resolvers = {
  Query: {
    messages: (_root, _args, { user }) => {
      if (!user) throw unauthorizedError();
      return getMessages();
    },
  },

  Mutation: {
    addMessage: (_root, { text }, { user }) => {
      if (!user) throw unauthorizedError();
      return createMessage(user, text);
    },
  },

  Subscription: {
    messageAdded: {
      subscribe: () => pubSub.asyncIterator('MESSAGE_ADDED'),
    }
  }
};

function unauthorizedError() {
  return new GraphQLError('Not authenticated', {
    extensions: { code: 'UNAUTHORIZED' },
  });
}
