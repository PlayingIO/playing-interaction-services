import { iff, isProvider } from 'feathers-hooks-common';
import { queryWithCurrentUser } from 'feathers-authentication-hooks';
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
        cache(options.cache)
      ],
      get: [
        iff(isProvider('external'),
          queryWithCurrentUser({ idField: 'id', as: 'user' })),
        hooks.prefixSelect('subject')
      ],
      find: [
        iff(isProvider('external'),
          queryWithCurrentUser({ idField: 'id', as: 'user' })),
        hooks.prefixSelect('subject')
      ],
      create: [
      ],
      update: [
        hooks.depopulate('subject', 'user')
      ],
      patch: [
        hooks.depopulate('subject', 'user')
      ]
    },
    after: {
      all: [
        hooks.populate('favorite', { service: 'favorites' }),
        hooks.populate('subject', { path: '@type', fallThrough: ['headers', 'user'] }), // absolute path
        hooks.populate('user', { service: 'users' }),
        cache(options.cache),
        hooks.presentEntity(UserFavoriteEntity, options.entities),
        hooks.responder()
      ],
      find: [
        hooks.flatMerge('subject')
      ],
      get: [
        hooks.flatMerge('subject')
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