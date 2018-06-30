import { queryWithCurrentUser } from 'feathers-authentication-hooks';
import { hooks } from 'mostly-feathers-mongoose';
import { cache } from 'mostly-feathers-cache';

import UserAlertEntity from '../../entities/user-alert.entity';

export default function (options = {}) {
  return {
    before: {
      all: [
        hooks.authenticate('jwt', options.auth),
        cache(options.cache)
      ],
      find: [
        queryWithCurrentUser({ idField: 'id', as: 'user' }),
        hooks.prefixSelect('subject')
      ],
      get: [
        queryWithCurrentUser({ idField: 'id', as: 'user' }),
        hooks.prefixSelect('subject')
      ],
      create: [
      ],
      update: [
        hooks.discardFields('user')
      ],
      patch: [
        hooks.discardFields('user')
      ]
    },
    after: {
      all: [
        hooks.populate('user', { service: 'users' }),
        cache(options.cache),
        hooks.presentEntity(UserAlertEntity, options.entities),
        hooks.responder()
      ],
      find: [
        hooks.flatMerge('subject')
      ],
      get: [
        hooks.flatMerge('subject')
      ]
    }
  };
}