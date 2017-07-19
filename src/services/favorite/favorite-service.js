import assert from 'assert';
import makeDebug from 'debug';
import defaultHooks from './favorite-hooks';

const debug = makeDebug('playing:interaction-services:favorites');

const defaultOptions = {
  name: 'favorites'
};

/**
 * Favorite is a special collection, proxy service to collections
 */
class FavoriteService {
  constructor(options) {
    options = Object.assign({}, defaultOptions, options);
    this.name = options.name;
    this.options = options;
  }

  setup(app) {
    this.app = app;
    this.hooks(defaultHooks(this.options));
  }

  find(params) {
    params = params || { query: {} };
    params.query.category = 'favorite';

    const collections = this.app.service('collections');
    return collections.first(params).then((result) => {
      if (!result) {
        return collections.create({
          title: 'My Favorite',
          description: 'User favorite collection',
          category: 'favorite'
        }, params);
      } else {
        return result;
      }
    });
  }
}

export default function init(app, options, hooks) {
  return new FavoriteService(options);
}

init.Service = FavoriteService;
