import { discard, iff, isProvider } from 'feathers-hooks-common';
import { hooks as auth } from 'feathers-authentication';
import { associateCurrentUser, queryWithCurrentUser } from 'feathers-authentication-hooks';
import { hooks } from 'mostly-feathers-mongoose';
import UserFavoriteEntity from '~/entities/user-favorite-entity';

module.exports = function(options = {}) {
  return {
    before: {
      all: [
        auth.authenticate('jwt'),
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
        hooks.populate('favorite', { service: 'favorites' }),
        hooks.populate('document', { path: '@type', fallThrough: ['headers'] }), // absolute path
        hooks.populate('user', { service: 'users' }),
        hooks.presentEntity(UserFavoriteEntity, options),
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