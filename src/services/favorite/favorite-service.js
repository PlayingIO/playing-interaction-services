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
  
  _getUserFavorite(creator) {
    return super.find({ query: { creator } }).then((result) => {
      // create own favorite if not exists
      if (result && result.data.length === 0) {
        return super.create({
          title: 'My Favorite',
          description: 'User favorite collection',
          creator: creator,
          path: '/favorites/' + shortid.generate()
        });
      } else {
        return result && result.data[0];
      }
    });
  }

  find(params) {
    params = params || { query: {} };
    assert(params.query.creator, 'query.creator not provided.');
    return super.find(params);
  }

  get(id, params) {
    params = params || { query: {} };
    
    const action = params.__action;
    
    if (id === 'me') {
      assert(params.query.creator, 'query.creator not provided.');
      return this._getUserFavorite(params.query.creator).then((favorite) => {
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

  // get a document from the user favorite
  entry(id, data, params, favorite) {
    params = params || { query: {} };
    assert(params.query.entry, 'query.entry not provided.');
    assert(params.query.creator, 'query.creator not provided.');
    
    const entries = this.app.service('document-entries');

    return entries.find({ query: {
      entry: params.query.entry,
      parent: favorite.id,
      creator: params.query.creator
    }}).then((results) => {
      if (results && results.length > 0) {
        return results[0];
      } else {
        return null;
      }
    });
  }

  // add a document to the user favorite
  addToFavorites(id, data, params, favorite) {
    assert(data.document || data.documents, 'data.document(s) not provided.');
    assert(data.creator, 'data.creator not provided.');

    const entries = this.app.service('document-entries');
    
    debug('Add to favorite', favorite.id, 'with', data.document || data.documents);
    return entries.create({
      favorite: favorite.id,
      document: data.document || data.documents,
      creator: data.creator
    }, params);
  }

  // remove a document from the user favorite
  removeFromFavorites(id, data, params, favorite) {
    debug('removeFromFavorites', id, data, params, favorite);
    assert(data.document || data.documents, 'data.document(s) not provided.');
    assert(data.creator, 'data.creator not provided.');
    
    const entries = this.app.service('document-entries');

    debug('Remove from favorite', favorite.id, 'with', data.document || data.documents);
    return entries.remove(null, { query: {
      favorite: favorite.id,
      document: data.document || data.documents,
      creator: data.creator
    }});
  }
}

export default function init(app, options, hooks) {
  options = Object.assign({ ModelName: 'favorite' }, options);
  return createService(app, FavoriteService, FavoriteModel, options);
}

init.Service = FavoriteService;
