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
    options = fp.assignAll(defaultOptions, options);
    super(options);
  }

  setup (app) {
    super.setup(app);
    this.hooks(defaultHooks(this.options));
  }

  async find (params) {
    params = { query: {}, ...params };
    params.query.$sort = params.query.$sort || { position: 1 };

    return super.find(params);
  }

  async _getDocuments (ids, params) {
    const svcDocuments = this.app.service('documents');
    const documents = await svcDocuments.find({
      query: { _id: { $in: ids }, $select: ['type'] },
      user: params.user,
      paginate: false,
    });
    if (!documents || documents.length !== ids.length) {
      throw new Error('some data.document(s) not exists');
    }
    return documents;
  }

  async _getFavorite (params) {
    const svcFavorites = this.app.service('favorites');
    const favorite = await svcFavorites.get('me', {
      query: { $select: ['id'] },
      user: params.user,
    });
    if (!favorite) {
      throw new Error('favorite collection not exists');
    }
    return favorite;
  }

  async get (id, params) {
    params = { query: {}, ...params };
    assert(params.query.user, 'params.query.user not provided');
    params.query.document = params.query.document || id;
    return super.first(params);
  }

  async create (data, params) {
    assert(data.document || data.documents, 'data.document(s) not provided.');

    const ids = [].concat(data.document || data.documents);
    const [documents, favorite] = await Promise.all([
      this._getDocuments(ids, params),
      this._getFavorite(params)
    ]);

    params.locals = { subjects: documents }; // for notifiers

    return Promise.all(fp.map(doc =>
      super.upsert(null, {
        document: doc.id,
        favorite: favorite.id,
        type: doc.type,
        user: params.user.id
      }), documents));
  }

  async remove (id, params) {
    if (id && id !== 'null') {
      return super.remove(id, params);
    } else {
      assert(params.query.document, 'query.document not provided.');

      const ids = params.query.document.split(',');
      const [documents, favorite] = await Promise.all([
        this._getDocuments(ids, params),
        this._getFavorite(params)
      ]);

      params.locals = { subjects: documents }; // for notifiers

      return super.remove(null, {
        query: {
          document: { $in: ids },
          favorite: favorite.id,
          user: params.user.id
        },
        $multi: true
      });
    }
  }
}

export default function init (app, options, hooks) {
  options = { ModelName: 'user-favorite', ...options };
  return createService(app, UserFavoriteService, UserFavoriteModel, options);
}

init.Service = UserFavoriteService;
