const assert = require('assert');
const makeDebug = require('debug');
const { createService, helpers } = require('mostly-feathers-mongoose');
const fp = require('mostly-func');
const shortid = require('shortid');

const { Service: CollectionService } = require('../collection/collection.service');
const FavoriteModel = require('../../models/favorite.model');
const defaultHooks = require('./favorite.hooks');

const debug = makeDebug('playing:interaction-services:favorites');

const defaultOptions = {
  name: 'favorites'
};

/**
 * Favorite is a particular collection
 */
class FavoriteService extends CollectionService {
  constructor (options) {
    options = fp.assignAll(defaultOptions, options);
    super(options);
  }

  setup (app) {
    super.setup(app);
    this.hooks(defaultHooks(this.options));
  }

  async _getUserFavorite (params) {
    const user = helpers.getCurrentUser(params);
    const favorite = await super.find({
      query: { creator: user, ...params.query },
      paginate: false
    });
    // create own favorite if not exists
    if (fp.isEmpty(favorite)) {
      return super.create({
        title: 'My Favorite',
        description: 'User favorite collection',
        creator: user,
        path: '/favorites/' + shortid.generate()
      });
    } else {
      return favorite[0];
    }
  }

  async find (params) {
    params = { query: {}, ...params };
    return super.find(params);
  }

  async get (id, params) {
    params = { query: {}, ...params };
    if (id === 'me') {
      return this._getUserFavorite(params);
    } else {
      return super.get(id, params);
    }
  }
}

module.exports = function init (app, options, hooks) {
  options = { ModelName: 'favorite', ...options };
  return createService(app, FavoriteService, FavoriteModel, options);
};
module.exports.Service = FavoriteService;
