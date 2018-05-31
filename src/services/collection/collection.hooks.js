import { associateCurrentUser, queryWithCurrentUser } from 'feathers-authentication-hooks';
import { iff, isProvider } from 'feathers-hooks-common';
import { hooks } from 'mostly-feathers-mongoose';
import { cache } from 'mostly-feathers-cache';
import contents from 'playing-content-common';

import { CollectionEntity } from 'playing-interaction-common';
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
        contents.computePath({ type: 'collection' }),
        contents.computeAncestors()
      ],
      update: [
        iff(isProvider('external'),
          associateCurrentUser({ idField: 'id', as: 'creator' })),
        hooks.depopulate('parent'),
        hooks.discardFields('metadata', 'ancestors', 'creator', 'createdAt', 'updatedAt', 'destroyedAt'),
        contents.computePath({ type: 'collection' }),
        contents.computeAncestors()
      ],
      patch: [
        iff(isProvider('external'),
          associateCurrentUser({ idField: 'id', as: 'creator' })),
        hooks.depopulate('parent'),
        hooks.discardFields('metadata', 'ancestors', 'creator', 'createdAt', 'updatedAt', 'destroyedAt'),
        contents.computePath({ type: 'collection' }),
        contents.computeAncestors()
      ]
    },
    after: {
      all: [
        hooks.populate('parent', { service: 'documents', fallThrough: ['headers'] }),
        hooks.populate('ancestors'), // with typed id
        hooks.populate('creator', { service: 'users' }),
        contents.documentEnrichers(options),
        collectionEnrichers(options),
        cache(options.cache),
        hooks.presentEntity(CollectionEntity, options.entities),
        hooks.responder()
      ],
      find: [
        hooks.assoc('members', { service: 'user-collections', field: 'collect' })
      ],
      create: [
        contents.documentNotifier('document.create')
      ]
    }
  };
}