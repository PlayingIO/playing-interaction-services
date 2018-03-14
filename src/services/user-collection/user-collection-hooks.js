import { iff, isProvider } from 'feathers-hooks-common';
import { associateCurrentUser, queryWithCurrentUser } from 'feathers-authentication-hooks';
import { hooks } from 'mostly-feathers-mongoose';
import UserCollectionEntity from '~/entities/user-collection-entity';

module.exports = function(options = {}) {
  return {
    before: {
      all: [
        hooks.authenticate('jwt', options),
        iff(isProvider('external'),
          queryWithCurrentUser({ idField: 'id', as: 'user' }))
      ],
      get: [
        hooks.prefixSelect('document', { excepts: ['collect', 'user']})
      ],
      find: [
        hooks.prefixSelect('document', { excepts: ['collect', 'user']})
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
        hooks.populate('collect', { service: 'collections' }),
        hooks.populate('document', { path: '@type', fallThrough: ['headers', 'user'] }), // absolute path
        hooks.populate('user', { service: 'users' }),
        hooks.presentEntity(UserCollectionEntity, options),
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