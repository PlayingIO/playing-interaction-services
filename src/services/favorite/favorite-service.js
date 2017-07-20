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
  
  _getUserFavorite(params) {
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

  // get the default user favorite
  find(params) {
    params = params || { query: {} };
    assert(params.query.owner, 'query.owner not provided.');
    return this._getUserFavorite(params);
  }

  // get the favorited document
  get(id, params) {
    params = params || { query: {} };
    assert(params.query.owner, 'query.owner not provided.');
    
    const entries = this.app.service('document-entries');

    return this._getUserFavorite(params).then((favorite) => {
      if (favorite) {
        return entries.find({ query: {
          entry: id,
          parent: favorite.id,
          owner: params.query.owner
        }}).then((results) => {
          if (results && results.length > 0) {
            return results[0];
          } else {
            return null;
          }
        });
      } else {
        return null;
      }
    });
  }

  create(data, params) {
    assert(data.document || data.documents, 'data.document(s) not provided.');
    assert(data.owner, 'data.owner not provided.');

    const entries = this.app.service('document-entries');
    
    return this._getUserFavorite(params).then((favorite) => {
      if (favorite) {
        debug('Add to favorite', favorite.id, 'with', data.document || data.documents);
        return entries.create({
          favorite: favorite.id,
          document: data.document || data.documents,
          owner: data.owner
        }, params);
      } else {
        throw new Error('User favorite collection not exists');
      }
    });
  }
}

export default function init(app, options, hooks) {
  options = Object.assign({ ModelName: 'favorite' }, options);
  return createService(app, FavoriteService, FavoriteModel, options);
}

init.Service = FavoriteService;
