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
        disallow()
      ],
      update: [
        disallow()
      ],
      patch: [
        disallow()
      ],
      remove: [
        disallow()
      ]
    },
    after: {
      all: [
        hooks.populate('parent', { service: 'folders' }),
        hooks.populate('owner', { service: 'users' }),
        hooks.presentEntity(FavoriteEntity, options),
        content.documentEnrichers(options),
        hooks.responder()
      ]
    }
  };
};