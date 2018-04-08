import { associateCurrentUser, queryWithCurrentUser } from 'feathers-authentication-hooks';
import { disallow, iff, isProvider } from 'feathers-hooks-common';
import { hooks } from 'mostly-feathers-mongoose';
import { cache } from 'mostly-feathers-cache';
import { hooks as content } from 'playing-content-services';

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
        iff(isProvider('external'),
          associateCurrentUser({ idField: 'id', as: 'creator' })),
        hooks.depopulate('parent'),
        hooks.discardFields('metadata', 'path', 'createdAt', 'updatedAt', 'destroyedAt')
      ],
      patch: [
        iff(isProvider('external'),
          associateCurrentUser({ idField: 'id', as: 'creator' })),
        hooks.depopulate('parent'),
        hooks.discardFields('metadata', 'path', 'createdAt', 'updatedAt', 'destroyedAt')
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
        content.documentEnrichers(options),
        cache(options.cache),
        hooks.presentEntity(FavoriteEntity, options.entities)
      ]
    }
  };
}