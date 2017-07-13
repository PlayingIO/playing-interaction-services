import { hooks as auth } from 'feathers-authentication';
import { hooks } from 'mostly-feathers-mongoose';
import FavoriteEntity from '~/entities/favorite-entity';

module.exports = function(options = {}) {
  return {
    before: {
      all: [
        auth.authenticate('jwt')
      ]
    },
    after: {
      all: [
        hooks.presentEntity(FavoriteEntity, options),
        hooks.responder()
      ]
    }
  };
};