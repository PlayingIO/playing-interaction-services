import { discard, iff, isProvider } from 'feathers-hooks-common';
import { hooks as auth } from 'feathers-authentication';
import { associateCurrentUser, queryWithCurrentUser } from 'feathers-authentication-hooks';
import { hooks } from 'mostly-feathers-mongoose';
import UserCommentEntity from '~/entities/user-like-entity';

module.exports = function(options = {}) {
  return {
    before: {
      all: [
      ],
      create: [
        auth.authenticate('jwt'),
        iff(isProvider('external'),
          associateCurrentUser({ idField: 'id', as: 'user' }))
      ],
      update: [
        auth.authenticate('jwt'),
        iff(isProvider('external'),
          associateCurrentUser({ idField: 'id', as: 'user' })),
        hooks.depopulate('subject', 'user')
      ],
      patch: [
        auth.authenticate('jwt'),
        iff(isProvider('external'),
          associateCurrentUser({ idField: 'id', as: 'user' })),
        hooks.depopulate('subject', 'user')
      ],
      remove: [
        auth.authenticate('jwt'),
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