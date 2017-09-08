import assert from 'assert';
import makeDebug from 'debug';
import { filter, flatten, groupBy, map, unionWith } from 'lodash';
import { Service, helpers, createService } from 'mostly-feathers-mongoose';
import { plural } from 'pluralize';
import UserFavoriteModel from '~/models/user-favorite-model';
import defaultHooks from './user-favorite-hooks';

const debug = makeDebug('playing:interaction-services:user-favorites');

const defaultOptions = {
  name: 'user-favorites'
};

class UserFavoriteService extends Service {
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
    params.query.$sort = params.query.$sort || { position: 1 };

    return super.find(params);
  }

  get(id, params) {
    params = Object.assign({ query: {} }, params);
    params.query.document = params.query.document || id;
    return super.first(params);
  }

  create(data, params) {
    assert(data.favorite, 'data.favorite not provided.');
    assert(data.document || data.documents, 'data.document(s) not provided.');
    assert(data.user, 'data.user not provided.');

    const documents = this.app.service('documents');
    const favorites = this.app.service('favorites');
    
    const ids = [].concat(data.document || data.documents);

    const getDocuments = documents.find({ query: { _id: { $in: ids } } });
    const getFavorite = favorites.get(data.favorite);

    return Promise.all([getDocuments, getFavorite]).then(([results, favorite]) => {
      const docs = results.data || results;
      if (!docs || docs.length !== ids.length) throw new Error('some data.document not exists');
      if (!favorite) throw new Error('favorite collection not exists');
      return Promise.all(docs.map((doc) => {
        return super.upsert({
          document: doc.id,
          favorite: favorite.id,
          type: doc.type,
          user: data.user
        });
      }));
    });
  }

  remove(id, params) {
    if (id && id !== 'null') {
      return super.remove(id, params);
    } else {
      assert(params.query.favorite, 'params.query.favorite not provided.');
      assert(params.query.document, 'query.document not provided.');
      assert(params.query.user, 'query.user not provided.');

      return super.remove(null, {
        query: {
          document: { $in: params.query.document.split(',') },
          favorite: params.query.favorite,
          user: params.query.user
        },
        provider: params.provider,
        $multi: true
      });
    }
  }

  reorder(id, data, params, original) {
    return this.get(data.target).then((target) => {
      if (!target) throw new Error("data.target not exists");
      target = target.data || target;
      return helpers.reorderPosition(this.Model, original, target.position, { classify: 'favorite' });
    });
  }
}

export default function init(app, options, hooks) {
  options = Object.assign({ ModelName: 'user-favorite' }, options);
  return createService(app, UserFavoriteService, UserFavoriteModel, options);
}

init.Service = UserFavoriteService;
