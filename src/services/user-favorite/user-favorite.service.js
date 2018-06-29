import assert from 'assert';
import makeDebug from 'debug';
import { Service, helpers, createService } from 'mostly-feathers-mongoose';
import fp from 'mostly-func';

import UserFavoriteModel from '../../models/user-favorite.model';
import defaultHooks from './user-favorite.hooks';
import { getSubjects, getFavorite } from '../../helpers';

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

  async get (id, params) {
    params = { query: {}, ...params };
    params.query.subject = params.query.subject || id;
    return super.first(params);
  }

  async create (data, params) {
    assert(data.subject || data.subjects, 'subject(s) not provided.');
    data.type = data.type || 'document';

    const ids = [].concat(data.subject || data.subjects);
    const [subjects, favorite] = await Promise.all([
      getSubjects(this.app, data.type, ids, params),
      getFavorite(this.app, params)
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
    if (id) {
      return super.remove(id, params);
    } else {
      assert(params.query.subject, 'query.subject is not provided.');
      params.query.type = params.query.type || 'document';

      const ids = params.query.subject.split(',');
      const [subjects, favorite] = await Promise.all([
        getSubjects(this.app, params.query.type, ids, params),
        getFavorite(this.app, params)
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
