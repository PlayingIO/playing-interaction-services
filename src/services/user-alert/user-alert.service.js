import assert from 'assert';
import makeDebug from 'debug';
import { Service, createService } from 'mostly-feathers-mongoose';
import fp from 'mostly-func';
import shortid from 'shortid';

import UserAlertModel from '../../models/user-alert.model';
import defaultHooks from './user-alert.hooks';
import { getSubjects } from '../../helpers';

const debug = makeDebug('playing:interaction-services:user-alerts');

const defaultOptions = {
  name: 'user-alerts',
  payloads: ['os', 'osVersion', 'deviceType', 'app', 'appVersion']
};

export class UserAlertService extends Service {
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
}

export default function init (app, options, hooks) {
  options = { ModelName: 'user-alert', ...options };
  return createService(app, UserAlertService, UserAlertModel, options);
}

init.Service = UserAlertService;
