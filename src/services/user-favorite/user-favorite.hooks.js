const { queryWithCurrentUser } = require('feathers-authentication-hooks');
const { hooks } = require('mostly-feathers-mongoose');
const { cache } = require('mostly-feathers-cache');
const feeds = require('playing-feed-common');

const UserFavoriteEntity = require('../../entities/user-favorite.entity');
const notifiers = require('./user-favorite.notifiers');

module.exports = function (options = {}) {
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
};