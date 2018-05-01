import assert from 'assert';
import makeDebug from 'debug';
import { Service, createService } from 'mostly-feathers-mongoose';
import fp from 'mostly-func';
import { plural } from 'pluralize';

import UserShareModel from '../../models/user-share.model';
import defaultHooks from './user-share.hooks';

const debug = makeDebug('playing:interaction-services:user-shares');

const defaultOptions = {
  name: 'user-shares'
};

export class UserShareService extends Service {
  constructor (options) {
    options = fp.assign(defaultOptions, options);
    super(options);
  }

  setup (app) {
    super.setup(app);
    this.hooks(defaultHooks(this.options));
  }

  get (id, params) {
    params = Object.assign({ query: {} }, params);
    assert(params.query.user, 'params.query.user not provided');
    params.query.subject = params.query.subject || id;
    return super.first(null, null, params);
  }

  create (data, params) {
    assert(data.subject || data.subjects, 'data.subject(s) not provided.');
    assert(data.type, 'data.type not provided');
    assert(data.user || data.group, 'data.user or data.group not provided.');

    const svcSubjects = this.app.service(plural(data.type));
    
    const ids = [].concat(data.subject || data.subjects);

    const getSubjects = () => svcSubjects.find({
      query: { _id: { $in: ids }, $select: ['type'] },
      paginate: false,
    });

    return getSubjects().then((docs) => {
      if (!docs || docs.length !== ids.length) throw new Error('some data.subject(s) not exists');
      return Promise.all(docs.map((doc) => {
        const share = fp.merge({ subject: doc.id, type: doc.type }, data);
        return super.create(share);
      }));
    });
  }
}

export default function init (app, options, hooks) {
  options = fp.assign({ ModelName: 'user-share' }, options);
  return createService(app, UserShareService, UserShareModel, options);
}

init.Service = UserShareService;
