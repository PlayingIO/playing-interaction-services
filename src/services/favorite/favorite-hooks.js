import { hooks as auth } from 'feathers-authentication';
import { associateCurrentUser, queryWithCurrentUser } from 'feathers-authentication-hooks';
import { disallow, discard } from 'feathers-hooks-common';
import { hooks } from 'mostly-feathers-mongoose';
import * as content from 'playing-content-services/lib/services/content-hooks';
import FavoriteEntity from '~/entities/favorite-entity';

module.exports = function(options = {}) {
  return {
    before: {
      all: [
        auth.authenticate('jwt')
      ],
      get: [
        queryWithCurrentUser({ idField: 'id', as: 'owner' })
      ],
      find: [
        queryWithCurrentUser({ idField: 'id', as: 'owner' })
      ],
      create: [
        associateCurrentUser({ idField: 'id', as: 'owner' })
      ],
      update: [
        associateCurrentUser({ idField: 'id', as: 'owner' }),
        hooks.depopulate('parent'),
        content.computePath(),
        discard('id', 'metadata', 'createdAt', 'updatedAt', 'destroyedAt'),
      ],
      patch: [
        associateCurrentUser({ idField: 'id', as: 'owner' }),
        hooks.depopulate('parent'),
        content.computePath(),
        discard('id', 'metadata', 'createdAt', 'updatedAt', 'destroyedAt'),
      ],
      remove: [
        queryWithCurrentUser({ idField: 'id', as: 'owner' })
      ]
    },
    after: {
      all: [
        hooks.responder()
      ],
      find: [
        hooks.populate('parent', { service: 'folders' }),
        hooks.populate('entries', { serviceBy: 'type' }),
        hooks.populate('owner', { service: 'users' }),
        content.documentEnrichers(options),
        hooks.presentEntity(FavoriteEntity, options),
      ]
    }
  };
};