import { hooks as auth } from 'feathers-authentication';
import { associateCurrentUser, queryWithCurrentUser } from 'feathers-authentication-hooks';
import { disallow, discard, iff, isProvider } from 'feathers-hooks-common';
import { hooks } from 'mostly-feathers-mongoose';
import { hooks as content } from 'playing-content-services';
import WorkspaceEntity from '~/entities/favorite-entity';

module.exports = function(options = {}) {
  return {
    before: {
      all: [
        auth.authenticate('jwt'),
        iff(isProvider('external'),
          queryWithCurrentUser({ idField: 'id', as: 'creator' }))
      ],
      create: [
        iff(isProvider('external'),
          associateCurrentUser({ idField: 'id', as: 'creator' }))
      ],
      update: [
        iff(isProvider('external'),
          associateCurrentUser({ idField: 'id', as: 'creator' })),
        hooks.depopulate('parent'),
        discard('id', 'metadata', 'path', 'createdAt', 'updatedAt', 'destroyedAt')
      ],
      patch: [
        iff(isProvider('external'),
          associateCurrentUser({ idField: 'id', as: 'creator' })),
        hooks.depopulate('parent'),
        discard('id', 'metadata', 'path', 'createdAt', 'updatedAt', 'destroyedAt')
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
        hooks.presentEntity(WorkspaceEntity, options),
      ],
      patch: [
        iff(
          hooks.isAction('addToWorkspaces'),
          hooks.publishEvent('favorite.added', { prefix: 'playing' })
        ),
        iff(
          hooks.isAction('removeFromWorkspaces'),
          hooks.publishEvent('favorite.removed', { prefix: 'playing' })
        )
      ]
    }
  };
};