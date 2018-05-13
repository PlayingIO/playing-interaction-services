import assert from 'assert';
import makeDebug from 'debug';
import { createService } from 'mostly-feathers-mongoose';
import fp from 'mostly-func';
import shortid from 'shortid';

import { CollectionService } from '../collection/collection.service';
import FavoriteModel from '../../models/favorite.model';
import defaultHooks from './favorite.hooks';

const debug = makeDebug('playing:interaction-services:favorites');

const defaultOptions = {
  name: 'favorites'
};

/**
 * Favorite is a particular collection
 */
export class FavoriteService extends CollectionService {
  constructor (options) {
    options = fp.assignAll(defaultOptions, options);
    super(options);
  }

  setup (app) {
    super.setup(app);
    this.hooks(defaultHooks(this.options));
  }

  async _getUserFavorite (params) {
    const favorite = await super.find({
      query: { creator: params.user.id, ...params.query },
      paginate: false
    });
    // create own favorite if not exists
    if (fp.isEmpty(favorite)) {
      return super.create({
        title: 'My Favorite',
        description: 'User favorite collection',
        creator: params.user.id,
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

export default function init (app, options, hooks) {
  options = { ModelName: 'favorite', ...options };
  return createService(app, FavoriteService, FavoriteModel, options);
}

init.Service = FavoriteService;
