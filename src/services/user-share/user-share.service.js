import assert from 'assert';
import makeDebug from 'debug';
import { Service, createService } from 'mostly-feathers-mongoose';
import fp from 'mostly-func';
import shortid from 'shortid';

import UserShareModel from '../../models/user-share.model';
import defaultHooks from './user-share.hooks';
import { getSubjects } from '../../helpers';

const debug = makeDebug('playing:interaction-services:user-shares');

const defaultOptions = {
  name: 'user-shares',
  payloads: ['os', 'osVersion', 'deviceType', 'app', 'appVersion']
};

export class UserShareService extends Service {
  constructor (options) {
    options = fp.assignAll(defaultOptions, options);
    super(options);
  }

  setup (app) {
    super.setup(app);
    this.hooks(defaultHooks(this.options));
  }

  find (params) {
    params = { query: {}, ...params };
    params.query.user = params.query.user || params.user.id;
    return super.find(params);
  }

  get (id, params) {
    params = { query: {}, ...params };
    assert(params.query.user, 'params.query.user not provided');
    params.query.subject = params.query.subject || id;
    return super.first(params);
  }

  async create (data, params) {
    assert(data.subject || data.subjects, 'data.subject(s) not provided.');
    data.type = data.type || 'document';
    const payload = fp.pick(this.options.payloads, data);

    const ids = [].concat(data.subject || data.subjects);
    const subjects = await getSubjects(this.app, data.type, ids, params);

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

export default function init (app, options, hooks) {
  options = { ModelName: 'user-share', ...options };
  return createService(app, UserShareService, UserShareModel, options);
}

init.Service = UserShareService;
