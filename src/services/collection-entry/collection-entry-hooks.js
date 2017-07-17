import { discard } from 'feathers-hooks-common';
import { hooks as auth } from 'feathers-authentication';
import { associateCurrentUser, queryWithCurrentUser } from 'feathers-authentication-hooks';
import { hooks } from 'mostly-feathers-mongoose';
import CollectionEntryEntity from '~/entities/collection-entry-entity';
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
        associateCurrentUser({ idField: 'id', as: 'owner' })
      ],
      update: [
        associateCurrentUser({ idField: 'id', as: 'owner' }),
        hooks.depopulate('entry', 'owner')
      ],
      patch: [
        associateCurrentUser({ idField: 'id', as: 'owner' }),
        hooks.depopulate('entry', 'owner')
      ],
      remove: [
        queryWithCurrentUser({ idField: 'id', as: 'owner' })
      ],
    },
    after: {
      all: [
        hooks.presentEntity(CollectionEntryEntity, options),
        hooks.responder()
      ]
    }
  };
};