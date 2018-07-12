const assert = require('assert');
const makeDebug = require('debug');
const { Service, createService } = require('mostly-feathers-mongoose');
const fp = require('mostly-func');
const shortid = require('shortid');

const UserShareModel = require('../../models/user-share.model');
const defaultHooks = require('./user-share.hooks');
const { getSubjects } = require('../../helpers');

const debug = makeDebug('playing:interaction-services:user-shares');

const defaultOptions = {
  name: 'user-shares',
  payloads: ['os', 'osVersion', 'deviceType', 'app', 'appVersion']
};

class UserShareService extends Service {
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

    const payload = fp.pick(this.options.payloads, data);
    const ids = [].concat(data.subject || data.subjects);

    const subjects = await getSubjects(this.app, data.type, ids);
    assert(subjects.length, 'Subject is not exists');

    return Promise.all(fp.map(subject => {
      return super.upsert(null, {
        hashid: shortid.generate(),
        subject: subject.id,
        type: subject.type,
        user: params.user.id,
        payload: payload,
        group: data.group
      });
    }, subjects));
  }
}

module.exports = function init (app, options, hooks) {
  options = { ModelName: 'user-share', ...options };
  return createService(app, UserShareService, UserShareModel, options);
};
module.exports.Service = UserShareService;
