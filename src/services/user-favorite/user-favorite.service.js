import assert from 'assert';
import makeDebug from 'debug';
import { Service, helpers, createService } from 'mostly-feathers-mongoose';
import fp from 'mostly-func';

import UserFavoriteModel from '../../models/user-favorite.model';
import defaultHooks from './user-favorite.hooks';

const debug = makeDebug('playing:interaction-services:user-favorites');

const defaultOptions = {
  name: 'user-favorites'
};

export class UserFavoriteService extends Service {
  constructor (options) {
    options = fp.assign(defaultOptions, options);
    super(options);
  }

  setup (app) {
    super.setup(app);
    this.hooks(defaultHooks(this.options));
  }

  find (params) {
    params = { query: {}, ...params };
    params.query.$sort = params.query.$sort || { position: 1 };

    return super.find(params);
  }

  get (id, params) {
    params = { query: {}, ...params };
    assert(params.query.user, 'params.query.user not provided');
    params.query.document = params.query.document || id;
    return super.first(params);
  }

  create (data, params) {
    assert(data.document || data.documents, 'data.document(s) not provided.');
    assert(data.user, 'data.user not provided.');

    const svcDocuments = this.app.service('documents');
    const svcFavorites = this.app.service('favorites');
    
    const ids = [].concat(data.document || data.documents);

    const getDocuments = () => svcDocuments.find({
      query: { _id: { $in: ids }, $select: ['type'] },
      paginate: false,
    });
    const getFavorite = () => data.favorite
      ? svcFavorites.get(data.favorite, { query: { $select: ['id'] } })
      : svcFavorites.get('me', { query: { creator: data.user, $select: ['id'] } });

    return Promise.all([
      getDocuments(),
      getFavorite()
    ]).then(([docs, favorite]) => {
      if (!docs || docs.length !== ids.length) throw new Error('some data.document(s) not exists');
      if (!favorite) throw new Error('favorite collection not exists');
      return Promise.all(docs.map((doc) => {
        return super.upsert(null, {
          document: doc.id,
          favorite: favorite.id,
          type: doc.type,
          user: data.user
        });
      }));
    });
  }

  remove (id, params) {
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

  reorder (id, data, params, original) {
    return this.get(data.target).then((target) => {
      if (!target) throw new Error("data.target not exists");
      target = target.data || target;
      return helpers.reorderPosition(this.Model, original, target.position, { classify: 'favorite' });
    });
  }
}

export default function init (app, options, hooks) {
  options = { ModelName: 'user-favorite', ...options };
  return createService(app, UserFavoriteService, UserFavoriteModel, options);
}

init.Service = UserFavoriteService;
