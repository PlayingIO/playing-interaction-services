import { iff, isProvider } from 'feathers-hooks-common';
import { associateCurrentUser, queryWithCurrentUser } from 'feathers-authentication-hooks';
import { hooks } from 'mostly-feathers-mongoose';
import { cache } from 'mostly-feathers-cache';

import UserCommentEntity from '../../entities/user-like.entity';

export default function (options = {}) {
  return {
    before: {
      all: [
        cache(options.cache)
      ],
      create: [
        hooks.authenticate('jwt', options.auth),
      ],
      update: [
        hooks.authenticate('jwt', options.auth),
        hooks.depopulate('subject', 'user')
      ],
      patch: [
        hooks.authenticate('jwt', options.auth),
        hooks.depopulate('subject', 'user')
      ],
      remove: [
        hooks.authenticate('jwt', options.auth)
      ]
    },
    after: {
      all: [
        hooks.populate('subject', { path: '@type', fallThrough: ['headers', 'user'] }), // absolute path
        hooks.populate('user', { service: 'users' }),
        cache(options.cache),
        hooks.presentEntity(UserCommentEntity, options.entities),
        hooks.responder()
      ]
    }
  };
}