import { hooks as auth } from 'feathers-authentication';
import { associateCurrentUser, queryWithCurrentUser } from 'feathers-authentication-hooks';
import { disallow, discard, iff, isProvider } from 'feathers-hooks-common';
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
        queryWithCurrentUser({ idField: 'id', as: 'creator' })
      ],
      find: [
        queryWithCurrentUser({ idField: 'id', as: 'creator' })
      ],
      create: [
        associateCurrentUser({ idField: 'id', as: 'creator' })
      ],
      update: [
        queryWithCurrentUser({ idField: 'id', as: 'creator' }),
        associateCurrentUser({ idField: 'id', as: 'creator' }),
        hooks.depopulate('parent'),
        discard('id', 'metadata', 'path', 'createdAt', 'updatedAt', 'destroyedAt')
      ],
      patch: [
        queryWithCurrentUser({ idField: 'id', as: 'creator' }),
        associateCurrentUser({ idField: 'id', as: 'creator' }),
        hooks.depopulate('parent'),
        discard('id', 'metadata', 'path', 'createdAt', 'updatedAt', 'destroyedAt')
      ],
      remove: [
        queryWithCurrentUser({ idField: 'id', as: 'creator' })
      ]
    },
    after: {
      all: [
        iff(isProvider('external'), discard('ACL')),
        hooks.responder()
      ],
      find: [
        hooks.populate('parent', { service: 'documents', fallThrough: ['headers'] }),
        hooks.populate('creator', { service: 'users' }),
        content.documentEnrichers(options),
        hooks.presentEntity(FavoriteEntity, options),
      ],
      patch: [
        iff(
          hooks.isAction('addToFavorites'),
          hooks.publishEvent('favorite.added', { prefix: 'playing' })
        ),
        iff(
          hooks.isAction('removeFromFavorites'),
          hooks.publishEvent('favorite.removed', { prefix: 'playing' })
        )
      ]
    }
  };
};