const { associateCurrentUser, queryWithCurrentUser } = require('feathers-authentication-hooks');
const { hooks } = require('mostly-feathers-mongoose');
const { cache } = require('mostly-feathers-cache');
const contents = require('playing-content-common');

const { FavoriteEntity } = require('playing-interaction-common');

module.exports = function (options = {}) {
  return {
    before: {
      all: [
        hooks.authenticate('jwt', options.auth),
        queryWithCurrentUser({ idField: 'id', as: 'creator' }),
        cache(options.cache)
      ],
      create: [
        associateCurrentUser({ idField: 'id', as: 'creator' })
      ],
      update: [
        hooks.depopulate('parent'),
        hooks.discardFields('metadata', 'path', 'creator', 'createdAt', 'updatedAt', 'destroyedAt')
      ],
      patch: [
        hooks.depopulate('parent'),
        hooks.discardFields('metadata', 'path', 'creator', 'createdAt', 'updatedAt', 'destroyedAt')
      ]
    },
    after: {
      all: [
        hooks.responder()
      ],
      find: [
        hooks.populate('parent', { service: 'documents', fallThrough: ['headers'] }),
        hooks.populate('ancestors'), // with typed id
        hooks.populate('creator', { service: 'users' }),
        contents.documentEnrichers(options),
        cache(options.cache),
        hooks.presentEntity(FavoriteEntity, options.entities)
      ]
    }
  };
};