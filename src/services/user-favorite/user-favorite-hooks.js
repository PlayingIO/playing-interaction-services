import { discard } from 'feathers-hooks-common';
import { hooks as auth } from 'feathers-authentication';
import { associateCurrentUser, queryWithCurrentUser } from 'feathers-authentication-hooks';
import { hooks } from 'mostly-feathers-mongoose';
import * as content from 'playing-content-services/lib/services/content-hooks';
import UserFavoriteEntity from '~/entities/user-favorite-entity';

module.exports = function(options = {}) {
  return {
    before: {
      all: [
        auth.authenticate('jwt'),
        queryWithCurrentUser({ idField: 'id', as: 'user' })
      ],
      get: [
        hooks.prefixSelect('document', { excepts: ['favorite', 'user']})
      ],
      find: [
        hooks.prefixSelect('document', { excepts: ['favorite', 'user']})
      ],
      create: [
        associateCurrentUser({ idField: 'id', as: 'user' })
      ],
      update: [
        associateCurrentUser({ idField: 'id', as: 'user' }),
        hooks.depopulate('document', 'user')
      ],
      patch: [
        associateCurrentUser({ idField: 'id', as: 'user' }),
        hooks.depopulate('document', 'user')
      ],
      remove: [
        queryWithCurrentUser({ idField: 'id', as: 'user' })
      ],
    },
    after: {
      all: [
        hooks.populate('favorite', { service: 'favorites' }),
        hooks.populate('document', { path: '@type', fallThrough: ['headers'] }), // absolute path
        hooks.populate('user', { service: 'users' }),
        hooks.presentEntity(UserFavoriteEntity, options),
        hooks.responder()
      ],
      find: [
        hooks.flatMerge('document')
      ],
      get: [
        hooks.flatMerge('document')
      ]
    }
  };
};