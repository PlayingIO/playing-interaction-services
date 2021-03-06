const assert = require('assert');
const makeDebug = require('debug');
const { Service, createService } = require('mostly-feathers-mongoose');
const fp = require('mostly-func');

const UserLikeModel = require('../../models/user-like.model');
const defaultHooks = require('./user-like.hooks');
const { getSubjects } = require('../../helpers');

const debug = makeDebug('playing:interaction-services:user-likes');

const defaultOptions = {
  name: 'user-likes'
};

class UserLikeService extends Service {
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
    const subjects = await getSubjects(this.app, data.type, ids);
    assert(subjects.length, 'Subject is not exists');

    return Promise.all(fp.map(subject => {
      return super.upsert(null, {
        subject: subject.id,
        type: subject.type,
        user: params.user.id
      });
    }, subjects));
  }

  async remove (id, params) {
    if (id) {
      return super.remove(id, params);
    } else {
      assert(params.query.subject, 'query.subject is not provided.');
      params.query.type = params.query.type || 'document';

      const ids = params.query.subject.split(',');
      const subjects = await getSubjects(this.app, params.query.type, ids);
      assert(subjects.length, 'Subject is not exists');

      return super.remove(null, {
        query: {
          subject: { $in: ids },
          user: params.query.user
        },
        $multi: true
      });
    }
  }
}

module.exports = function init (app, options, hooks) {
  options = { ModelName: 'user-like', ...options };
  return createService(app, UserLikeService, UserLikeModel, options);
};
module.exports.Service = UserLikeService;
