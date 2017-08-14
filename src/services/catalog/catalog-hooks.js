import { discard } from 'feathers-hooks-common';
import { hooks as auth } from 'feathers-authentication';
import { associateCurrentUser, queryWithCurrentUser } from 'feathers-authentication-hooks';
import { hooks } from 'mostly-feathers-mongoose';
import * as content from 'playing-content-services/lib/services/content-hooks';
import CatalogEntity from '~/entities/catalog-entity';

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
        hooks.depopulate('document', 'creator')
      ],
      
      patch: [
        associateCurrentUser({ idField: 'id', as: 'creator' }),
        hooks.depopulate('document', 'creator')
      ],
      remove: [
        queryWithCurrentUser({ idField: 'id', as: 'creator' })
      ],
    },
    after: {
      all: [
        hooks.populate('parent', { path: '@category' }), // absolute path
        hooks.populate('document', { path: '@type', fallThrough: true }), // absolute path
        hooks.populate('creator', { service: 'users' }),
        hooks.presentEntity(CatalogEntity, options),
        hooks.responder()
      ]
    }
  };
};