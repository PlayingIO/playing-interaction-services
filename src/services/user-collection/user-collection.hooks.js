import { iff, isProvider } from 'feathers-hooks-common';
import { queryWithCurrentUser } from 'feathers-authentication-hooks';
import { hooks } from 'mostly-feathers-mongoose';
import { cache } from 'mostly-feathers-cache';

import UserCollectionEntity from '../../entities/user-collection.entity';

export default function (options = {}) {
  return {
    before: {
      all: [
        hooks.authenticate('jwt', options.auth),
        cache(options.cache)
      ],
      get: [
        iff(isProvider('external'),
          queryWithCurrentUser({ idField: 'id', as: 'user' })),
        hooks.prefixSelect('subject', { excepts: ['collect', 'user']})
      ],
      find: [
        iff(isProvider('external'),
          queryWithCurrentUser({ idField: 'id', as: 'user' })),
        hooks.prefixSelect('subject', { excepts: ['collect', 'user']})
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
        hooks.populate('collect', { service: 'collections' }),
        hooks.populate('subject', { path: '@type', fallThrough: ['headers', 'user'] }), // absolute path
        hooks.populate('user', { service: 'users' }),
        cache(options.cache),
        hooks.presentEntity(UserCollectionEntity, options.entities),
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
}