const { queryWithCurrentUser } = require('feathers-authentication-hooks');
const { hooks } = require('mostly-feathers-mongoose');
const { cache } = require('mostly-feathers-cache');

const UserFeedbackEntity = require('../../entities/user-feedback.entity');

module.exports = function (options = {}) {
  return {
    before: {
      all: [
        hooks.authenticate('jwt', options.auth),
        cache(options.cache)
      ],
      find: [
        queryWithCurrentUser({ idField: 'id', as: 'user' }),
        hooks.prefixSelect('subject')
      ],
      get: [
        queryWithCurrentUser({ idField: 'id', as: 'user' }),
        hooks.prefixSelect('subject')
      ],
      create: [
      ],
      update: [
        hooks.depopulate('subject', 'user')
      ],
      patch: [
        hooks.depopulate('subject', 'user')
      ]
    },
    after: {
      all: [
        hooks.populate('subject', { path: '@type', fallThrough: ['headers', 'user'] }), // absolute path
        hooks.populate('user', { service: 'users' }),
        cache(options.cache),
        hooks.presentEntity(UserFeedbackEntity, options.entities),
        hooks.responder()
      ],
      find: [
        hooks.flatMerge('subject')
      ],
      get: [
        hooks.flatMerge('subject')
      ]
    }
  };
};