const { Book, User } = require('../models');

const resolvers = {
  Query: {
    // get all users
    users: async () => {
      return User.find().populate('savedBooks');
    },
    // get a user by username
    user: async (parent, { username }) => {
      return User.findOne({ username }).populate('savedBooks');
  }
}
  ,
  Mutation: {
    // create a user, sign up
    addUser: async (parent, args) => {
      const user = await User.create(args);
      return user;
    },
    // login
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        return { message: 'No user with this email!' };
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        return { message: 'Incorrect password!' };
      }

      return { token: user, user };
    },
    // save a book to a user's `savedBooks` field by adding it to the set (to prevent duplicates)
    saveBook: async (parent, { bookId, authors, description, title, image, link }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          {
            $addToSet: { savedBooks: { bookId, authors, description, title, image, link } },
          },
          { new: true }
        ).populate('savedBooks');

        return updatedUser;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
    // remove a book from `savedBooks`
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        ).populate('savedBooks');

        return updatedUser;
      }
      throw new AuthenticationError('You need to be logged in!');
    },

  },
};

module.exports = resolvers;
