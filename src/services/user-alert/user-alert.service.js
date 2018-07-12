const assert = require('assert');
const makeDebug = require('debug');
const { Service, createService } = require('mostly-feathers-mongoose');
const fp = require('mostly-func');
const shortid = require('shortid');

const UserAlertModel = require('../../models/user-alert.model');
const defaultHooks = require('./user-alert.hooks');

const debug = makeDebug('playing:interaction-services:user-alerts');

const defaultOptions = {
  name: 'user-alerts',
  payloads: ['os', 'osVersion', 'deviceType', 'app', 'appVersion']
};

class UserAlertService extends Service {
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
    return super.upsert(null, {
      $set: data,
      user: params.user.id
    }, {
      user: params.user.id
    });
  }

  async update (id, data, params) {
    return super.update(id, {
      $set: { [id]: new Date(), ...data }
    }, params);
  }

  async patch (id, data, params) {
    return super.patch(id, {
      $set: { [id]: new Date(), ...data }
    }, params);
  }

  async remove (id, params) {
    return super.path(id, {
      $unset: { [id]: 0 }
    }, params);
  }
}

module.exports = function init (app, options, hooks) {
  options = { ModelName: 'user-alert', ...options };
  return createService(app, UserAlertService, UserAlertModel, options);
};
module.exports.Service = UserAlertService;
