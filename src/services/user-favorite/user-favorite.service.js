const assert = require('assert');
const makeDebug = require('debug');
const { Service, helpers, createService } = require('mostly-feathers-mongoose');
const fp = require('mostly-func');

const UserFavoriteModel = require('../../models/user-favorite.model');
const defaultHooks = require('./user-favorite.hooks');
const { getSubjects, getFavorite } = require('../../helpers');

const debug = makeDebug('playing:interaction-services:user-favorites');

const defaultOptions = {
  name: 'user-favorites'
};

class UserFavoriteService extends Service {
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
    data.user = data.user || params.user.id;

    const ids = [].concat(data.subject || data.subjects);
    const [subjects, favorite] = await Promise.all([
      getSubjects(this.app, data.type, ids),
      getFavorite(this.app, data.user)
    ]);
    assert(subjects.length, 'Subject is not exists');
    assert(favorite, 'Favorite collection is not exists');

    params.locals = { subjects: subjects }; // for notifiers

    return Promise.all(fp.map(subject =>
      super.upsert(null, {
        subject: subject.id,
        favorite: favorite.id,
        type: subject.type,
        user: data.user
      }), subjects)
    );
  }

  async remove (id, params) {
    if (id) {
      return super.remove(id, params);
    } else {
      assert(params.query.subject, 'query.subject is not provided.');
      params.query.type = params.query.type || 'document';
      params.query.user = params.query.user || params.user.id;

      const ids = params.query.subject.split(',');
      const [subjects, favorite] = await Promise.all([
        getSubjects(this.app, params.query.type, ids),
        getFavorite(this.app, params.query.user)
      ]);
      assert(subjects.length, 'Subject is not exists');
      assert(favorite, 'Favorite collection is not exists');

      params.locals = { subjects: subjects }; // for notifiers

      return super.remove(null, {
        query: {
          subject: { $in: ids },
          favorite: favorite.id,
          user: params.query.user
        },
        $multi: true
      });
    }
  }
}

module.exports = function init (app, options, hooks) {
  options = { ModelName: 'user-favorite', ...options };
  return createService(app, UserFavoriteService, UserFavoriteModel, options);
};
module.exports.Service = UserFavoriteService;
