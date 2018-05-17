import { associateCurrentUser, queryWithCurrentUser } from 'feathers-authentication-hooks';
import { iff, isProvider } from 'feathers-hooks-common';
import { hooks } from 'mostly-feathers-mongoose';
import { cache } from 'mostly-feathers-cache';
import { hooks as content } from 'playing-content-services';

import CollectionEntity from '../../entities/collection.entity';
import { collectionEnrichers } from '../../hooks';

export default function (options = {}) {
  return {
    before: {
      all: [
        hooks.authenticate('jwt', options.auth),
        cache(options.cache)
      ],
      find: [
        iff(isProvider('external'),
          queryWithCurrentUser({ idField: 'id', as: 'creator' })),
      ],
      get: [
        iff(isProvider('external'),
          queryWithCurrentUser({ idField: 'id', as: 'creator' })),
      ],
      create: [
        iff(isProvider('external'),
          associateCurrentUser({ idField: 'id', as: 'creator' })),
        content.computePath({ type: 'collection' }),
        content.computeAncestors()
      ],
      update: [
        iff(isProvider('external'),
          associateCurrentUser({ idField: 'id', as: 'creator' })),
        hooks.depopulate('parent'),
        hooks.discardFields('metadata', 'ancestors', 'creator', 'createdAt', 'updatedAt', 'destroyedAt'),
        content.computePath({ type: 'collection' }),
        content.computeAncestors()
      ],
      patch: [
        iff(isProvider('external'),
          associateCurrentUser({ idField: 'id', as: 'creator' })),
        hooks.depopulate('parent'),
        hooks.discardFields('metadata', 'ancestors', 'creator', 'createdAt', 'updatedAt', 'destroyedAt'),
        content.computePath({ type: 'collection' }),
        content.computeAncestors()
      ]
    },
    after: {
      all: [
        hooks.populate('parent', { service: 'documents', fallThrough: ['headers'] }),
        hooks.populate('ancestors'), // with typed id
        hooks.populate('creator', { service: 'users' }),
        content.documentEnrichers(options),
        collectionEnrichers(options),
        cache(options.cache),
        hooks.presentEntity(CollectionEntity, options.entities),
        hooks.responder()
      ],
      find: [
        hooks.assoc('members', { service: 'user-collections', field: 'collect' })
      ],
      create: [
        content.documentNotifier('document.create')
      ]
    }
  };
}