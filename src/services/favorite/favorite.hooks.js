import { associateCurrentUser, queryWithCurrentUser } from 'feathers-authentication-hooks';
import { disallow, iff, isProvider } from 'feathers-hooks-common';
import { hooks } from 'mostly-feathers-mongoose';
import { cache } from 'mostly-feathers-cache';
import contents from 'playing-content-common';

import FavoriteEntity from '../../entities/favorite.entity';

export default function (options = {}) {
  return {
    before: {
      all: [
        hooks.authenticate('jwt', options.auth),
        iff(isProvider('external'),
          queryWithCurrentUser({ idField: 'id', as: 'creator' })),
        cache(options.cache)
      ],
      create: [
        iff(isProvider('external'),
          associateCurrentUser({ idField: 'id', as: 'creator' }))
      ],
      update: [
        hooks.depopulate('parent'),
        hooks.discardFields('metadata', 'path', 'creator', 'createdAt', 'updatedAt', 'destroyedAt')
      ],
      patch: [
        hooks.depopulate('parent'),
        hooks.discardFields('metadata', 'path', 'creator', 'createdAt', 'updatedAt', 'destroyedAt')
      ]
    },
    after: {
      all: [
        hooks.responder()
      ],
      find: [
        hooks.populate('parent', { service: 'documents', fallThrough: ['headers'] }),
        hooks.populate('ancestors'), // with typed id
        hooks.populate('creator', { service: 'users' }),
        contents.documentEnrichers(options),
        cache(options.cache),
        hooks.presentEntity(FavoriteEntity, options.entities)
      ]
    }
  };
}