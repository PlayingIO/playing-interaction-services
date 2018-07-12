const { hooks } = require('mostly-feathers-mongoose');
const { cache } = require('mostly-feathers-cache');

const UserCommentEntity = require('../../entities/user-like.entity');

module.exports = function (options = {}) {
  return {
    before: {
      all: [
        cache(options.cache)
      ],
      create: [
        hooks.authenticate('jwt', options.auth),
      ],
      update: [
        hooks.authenticate('jwt', options.auth),
        hooks.depopulate('subject', 'user')
      ],
      patch: [
        hooks.authenticate('jwt', options.auth),
        hooks.depopulate('subject', 'user')
      ],
      remove: [
        hooks.authenticate('jwt', options.auth)
      ]
    },
    after: {
      all: [
        hooks.populate('subject', { path: '@type', fallThrough: ['headers', 'user'] }), // absolute path
        hooks.populate('user', { service: 'users' }),
        cache(options.cache),
        hooks.presentEntity(UserCommentEntity, options.entities),
        hooks.responder()
      ]
    }
  };
};