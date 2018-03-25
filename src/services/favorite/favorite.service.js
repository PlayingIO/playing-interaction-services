import assert from 'assert';
import makeDebug from 'debug';
import { createService } from 'mostly-feathers-mongoose';
import fp from 'mostly-func';
import shortid from 'shortid';

import { Service } from '~/services/collection/collection.service';
import FavoriteModel from '~/models/favorite.model';
import defaultHooks from './favorite.hooks';
import defaultEvents from './favorite.events';

const debug = makeDebug('playing:interaction-services:favorites');

const defaultOptions = {
  name: 'favorites'
};

/**
 * Favorite is a particular collection
 */
class FavoriteService extends Service {
  constructor (options) {
    options = Object.assign({}, defaultOptions, options);
    super(options);
  }

  setup (app) {
    super.setup(app);
    this.hooks(defaultHooks(this.options));
    defaultEvents(this.app, this.options);
  }

  _getUserFavorite (params) {
    params = fp.assign(params, { paginate: false });
    return super.find(params).then((result) => {
      // create own favorite if not exists
      if (result && result.length === 0) {
        assert(params.query.creator, 'params.query.creator not provided');
        return super.create({
          title: 'My Favorite',
          description: 'User favorite collection',
          creator: params.query.creator,
          path: '/favorites/' + shortid.generate()
        });
      } else {
        return result && result[0];
      }
    });
  }

  find (params) {
    params = fp.assign({ query: {} }, params);
    
    return super.find(params);
  }

  get (id, params) {
    params = fp.assign({ query: {} }, params);
    
    const action = params.__action;
    
    if (id === 'me') {
      assert(params.query.creator, 'query.creator not provided.');
      return this._getUserFavorite(params).then((favorite) => {
        if (action) {
          assert(this[action], 'No such action method: ' + action);
          return this[action].call(this, id, {}, params, favorite);
        } else {
          return favorite;
        }
      });
    } else {
      return super.get(id, params);
    }
  }

  // add a document to the user favorite
  _addToFavorites (id, data, params, favorite) {
    assert(data.document || data.documents, 'data.document(s) not provided.');
    assert(data.creator, 'data.creator not provided.');

    const svcUserFavorites = this.app.service('user-favorites');
    
    debug('Add to favorite', favorite.id, 'with', data.document || data.documents);
    return svcUserFavorites.create({
      favorite: favorite.id,
      document: data.document || data.documents,
      user: data.creator
    }, params);
  }

  // remove a document from the user favorite
  _removeFromFavorites (id, data, params, favorite) {
    debug('removeFromFavorites', id, data, params, favorite);
    assert(data.document || data.documents, 'data.document(s) not provided.');
    assert(data.creator, 'data.creator not provided.');
    
    const svcUserFavorites = this.app.service('user-favorites');

    debug('Remove from favorite', favorite.id, 'with', data.document || data.documents);
    return svcUserFavorites.remove(null, { query: {
      favorite: favorite.id,
      document: data.document || data.documents,
      user: data.creator
    }});
  }
}

export default function init (app, options, hooks) {
  options = Object.assign({ ModelName: 'favorite' }, options);
  return createService(app, FavoriteService, FavoriteModel, options);
}

init.Service = FavoriteService;
