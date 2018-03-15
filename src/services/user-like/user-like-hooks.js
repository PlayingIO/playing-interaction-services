import { iff, isProvider } from 'feathers-hooks-common';
import { associateCurrentUser, queryWithCurrentUser } from 'feathers-authentication-hooks';
import { hooks } from 'mostly-feathers-mongoose';
import UserLikeEntity from '~/entities/user-like-entity';

module.exports = function(options = {}) {
  return {
    before: {
      all: [
        hooks.authenticate('jwt', options.auth),
        iff(isProvider('external'),
          queryWithCurrentUser({ idField: 'id', as: 'user' }))
      ],
      get: [
        hooks.prefixSelect('document')
      ],
      find: [
        hooks.prefixSelect('document')
      ],
      create: [
        iff(isProvider('external'),
          associateCurrentUser({ idField: 'id', as: 'user' }))
      ],
      update: [
        iff(isProvider('external'),
          associateCurrentUser({ idField: 'id', as: 'user' })),
        hooks.depopulate('document', 'user')
      ],
      patch: [
        iff(isProvider('external'),
          associateCurrentUser({ idField: 'id', as: 'user' })),
        hooks.depopulate('document', 'user')
      ]
    },
    after: {
      all: [
        hooks.populate('document', { path: '@type', fallThrough: ['headers'] }), // absolute path
        hooks.populate('user', { service: 'users' }),
        hooks.presentEntity(UserLikeEntity, options),
        hooks.responder()
      ],
      find: [
        hooks.flatMerge('document')
      ],
      get: [
        hooks.flatMerge('document')
      ]
    }
  };
};