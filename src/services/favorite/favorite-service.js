import assert from 'assert';
import makeDebug from 'debug';
import { createService } from 'mostly-feathers-mongoose';
import shortid from 'shortid';

import FavoriteModel from '~/models/favorite-model';
import { Service } from '~/services/collection/collection-service';
import defaultHooks from './favorite-hooks';

const debug = makeDebug('playing:interaction-services:favorites');

const defaultOptions = {
  name: 'favorites'
};

/**
 * Favorite is a particular collection
 */
class FavoriteService extends Service {
  constructor(options) {
    options = Object.assign({}, defaultOptions, options);
    super(options);
  }

  setup(app) {
    super.setup(app);
    this.hooks(defaultHooks(this.options));
  }
  
  find(params) {
    params = params || { query: {} };
    assert(params.query.owner, 'query.owner not provided.');

    return super.find(params).then((result) => {
      // create own favorite if not exists
      if (result && result.data.length === 0) {
        return super.create({
          title: 'My Favorite',
          description: 'User favorite collection',
          owner: params.query.owner,
          path: '/favorites/' + shortid.generate()
        }, params);
      } else {
        return result && result.data[0];
      }
    });
  }
}

export default function init(app, options, hooks) {
  options = Object.assign({ ModelName: 'favorite' }, options);
  return createService(app, FavoriteService, FavoriteModel, options);
}

init.Service = FavoriteService;
