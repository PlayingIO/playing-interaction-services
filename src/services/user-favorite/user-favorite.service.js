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

  async _getSubjects (ids, params) {
    const svcDocuments = this.app.service('documents');
    const subjects = await svcDocuments.find({
      query: { _id: { $in: ids }, $select: ['type'] },
      user: params.user,
      paginate: false,
    });
    if (!subjects || subjects.length !== ids.length) {
      throw new Error('some data.subject(s) not exists');
    }
    return subjects;
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
    params.query.subject = params.query.subject || id;
    return super.first(params);
  }

  async create (data, params) {
    assert(data.subject || data.subjects, 'data.subject(s) not provided.');

    const ids = [].concat(data.subject || data.subjects);
    const [subjects, favorite] = await Promise.all([
      this._getSubjects(ids, params),
      this._getFavorite(params)
    ]);

    params.locals = { subjects: subjects }; // for notifiers

    return Promise.all(fp.map(subject =>
      super.upsert(null, {
        subject: subject.id,
        favorite: favorite.id,
        type: subject.type,
        user: params.user.id
      }), subjects));
  }

  async remove (id, params) {
    if (id && id !== 'null') {
      return super.remove(id, params);
    } else {
      assert(params.query.subject, 'query.subject not provided.');

      const ids = params.query.subject.split(',');
      const [subjects, favorite] = await Promise.all([
        this._getSubjects(ids, params),
        this._getFavorite(params)
      ]);

      params.locals = { subjects: subjects }; // for notifiers

      return super.remove(null, {
        query: {
          subject: { $in: ids },
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
