import { discard } from 'feathers-hooks-common';
import { hooks as auth } from 'feathers-authentication';
import { associateCurrentUser, queryWithCurrentUser } from 'feathers-authentication-hooks';
import { hooks } from 'mostly-feathers-mongoose';
import * as content from 'playing-content-services/lib/services/content-hooks';
import DocumentEntryEntity from '~/entities/document-entry-entity';

module.exports = function(options = {}) {
  return {
    before: {
      all: [
        auth.authenticate('jwt')
      ],
      get: [
        // queryWithCurrentUser({ idField: 'id', as: 'creator' })
      ],
      find: [
        // queryWithCurrentUser({ idField: 'id', as: 'creator' })
      ],
      create: [
        associateCurrentUser({ idField: 'id', as: 'creator' })
      ],
      update: [
        associateCurrentUser({ idField: 'id', as: 'creator' }),
        hooks.depopulate('entry', 'creator')
      ],
      patch: [
        associateCurrentUser({ idField: 'id', as: 'creator' }),
        hooks.depopulate('entry', 'creator')
      ],
      remove: [
        queryWithCurrentUser({ idField: 'id', as: 'creator' })
      ],
    },
    after: {
      all: [
        hooks.populate('parent', { service: 'documents' }),
        hooks.populate('entry', { path: '@type' }), // absolute path
        hooks.populate('creator', { service: 'users' }),
        hooks.presentEntity(DocumentEntryEntity, options),
        hooks.responder()
      ]
    }
  };
};