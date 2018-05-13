import { iff, isProvider } from 'feathers-hooks-common';
import { associateCurrentUser, queryWithCurrentUser } from 'feathers-authentication-hooks';
import { hooks } from 'mostly-feathers-mongoose';
import { cache } from 'mostly-feathers-cache';
import { hooks as feeds } from 'playing-feed-services';

import UserFavoriteEntity from '../../entities/user-favorite.entity';
import notifiers from './user-favorite.notifiers';

export default function (options = {}) {
  return {
    before: {
      all: [
        hooks.authenticate('jwt', options.auth),
        iff(isProvider('external'),
          queryWithCurrentUser({ idField: 'id', as: 'user' })),
        cache(options.cache)
      ],
      get: [
        hooks.prefixSelect('document')
      ],
      find: [
        hooks.prefixSelect('document')
      ],
      create: [
      ],
      update: [
        hooks.depopulate('document', 'user')
      ],
      patch: [
        hooks.depopulate('document', 'user')
      ]
    },
    after: {
      all: [
        hooks.populate('favorite', { service: 'favorites' }),
        hooks.populate('document', { path: '@type', fallThrough: ['headers', 'user'] }), // absolute path
        hooks.populate('user', { service: 'users' }),
        cache(options.cache),
        hooks.presentEntity(UserFavoriteEntity, options.entities),
        hooks.responder()
      ],
      find: [
        hooks.flatMerge('document')
      ],
      get: [
        hooks.flatMerge('document')
      ],
      create: [
        feeds.notify('favorite.create', notifiers)
      ],
      remove: [
        feeds.notify('favorite.delete', notifiers)
      ]
    }
  };
}