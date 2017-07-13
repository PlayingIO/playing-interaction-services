import { discard } from 'feathers-hooks-common';
import { hooks as auth } from 'feathers-authentication';
import { queryWithCurrentUser } from 'feathers-authentication-hooks';
import { hooks } from 'mostly-feathers-mongoose';
import CollectionEntity from '~/entities/collection-entity';
import * as content from 'playing-content-services/lib/services/content-hooks';

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
        content.computePath(),
        content.fetchBlobs()
      ],
      update: [
        hooks.depopulate('parent'),
        discard('id', 'metadata', 'path', 'createdAt', 'updatedAt', 'destroyedAt'),
        content.fetchBlobs()
      ],
      patch: [
        hooks.depopulate('parent'),
        discard('id', 'metadata', 'path', 'createdAt', 'updatedAt', 'destroyedAt'),
        content.fetchBlobs()
      ]
    },
    after: {
      all: [
        hooks.populate('parent', { service: 'folders' }),
        hooks.presentEntity(CollectionEntity, options),
        content.hasFolderishChild(),
        hooks.responder()
      ]
    }
  };
};