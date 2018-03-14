import { iff, isProvider } from 'feathers-hooks-common';
import { associateCurrentUser, queryWithCurrentUser } from 'feathers-authentication-hooks';
import { hooks } from 'mostly-feathers-mongoose';
import UserCommentEntity from '~/entities/user-like-entity';

module.exports = function(options = {}) {
  return {
    before: {
      all: [
      ],
      create: [
        hooks.authenticate('jwt', options),
        iff(isProvider('external'),
          associateCurrentUser({ idField: 'id', as: 'user' }))
      ],
      update: [
        hooks.authenticate('jwt', options),
        iff(isProvider('external'),
          associateCurrentUser({ idField: 'id', as: 'user' })),
        hooks.depopulate('subject', 'user')
      ],
      patch: [
        hooks.authenticate('jwt', options),
        iff(isProvider('external'),
          associateCurrentUser({ idField: 'id', as: 'user' })),
        hooks.depopulate('subject', 'user')
      ],
      remove: [
        hooks.authenticate('jwt', options),
        iff(isProvider('external'),
          queryWithCurrentUser({ idField: 'id', as: 'user' }))
      ]
    },
    after: {
      all: [
        hooks.populate('subject', { path: '@type', fallThrough: ['headers', 'user'] }), // absolute path
        hooks.populate('user', { service: 'users' }),
        hooks.presentEntity(UserCommentEntity, options),
        hooks.responder()
      ]
    }
  };
};